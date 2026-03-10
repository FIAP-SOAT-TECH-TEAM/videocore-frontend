import { create } from "zustand";
import { fetchLastExistingReport, fetchLatestReports, fetchStats } from "@/lib/api";
import type { PaginationState, ProcessStatus, Report, ReportPayload, ReportStats } from "@/types";

interface ReportsState {
	pagination: PaginationState<Report>;
	stats: ReportStats;
	isLoading: boolean;
	error: string | null;
}

interface ReportsActions {
	fetchReports: (page: number, size?: number) => Promise<void>;
	updateReportFromWebSocket: (payload: ReportPayload) => void;
	fetchDashboardStats: () => Promise<void>;
	fetchLastExistingReport: (requestId: string, videoName: string) => Promise<void>;
}

type ReportsStore = ReportsState & ReportsActions;

function createNextPageInStore(pagination: PaginationState<Report>): PaginationState<Report> {
	return {
		...pagination,
		totalElements: pagination.totalElements + 1,
		totalPages: pagination.totalPages + 1,
		hasNext: true,
	};
}

export const useReportsStore = create<ReportsStore>()((set, get) => ({
	pagination: {
		pageItems: { 0: [] },
		page: 0,
		size: 0,
		totalPages: 0,
		totalElements: 0,
		hasNext: false,
		hasPrevious: false,
	},
	stats: {
		total: 0,
		byStatus: {
			COMPLETED: 0,
			PROCESSING: 0,
			FAILED: 0,
		},
	},
	isLoading: false,
	error: null,

	fetchReports: async (page = 0, size = 10) => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetchLatestReports(page, size);
			const updatedPageItems = { ...get().pagination.pageItems };
			updatedPageItems[page] = response.content;

			set({
				pagination: {
					page: response.page,
					size: response.size,
					totalPages: response.totalPages,
					totalElements: response.totalElements,
					hasNext: response.hasNext,
					hasPrevious: response.hasPrevious,
					pageItems: updatedPageItems,
				},
				isLoading: false,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro ao carregar reports";
			set({ error: message, isLoading: false });
		}
	},

	updateReportFromWebSocket: (payload: ReportPayload) => {
		set((state) => {
			let status: ProcessStatus;

			if (payload.status !== undefined) {
				status = payload.status;
			} else if (payload.percentStatusProcess >= 100) {
				status = "COMPLETED";
			} else if (payload.percentStatusProcess > 0) {
				status = "PROCESSING";
			} else {
				status = "STARTED";
			}

			let pagination = { ...state.pagination };
			const currentPage = state.pagination.page;
			const currentReports = state.pagination.pageItems[currentPage];
			const existingIndex = currentReports.findIndex(
				(r) => r.requestId === payload.requestId && r.videoName === payload.videoName,
			);
			const previousPage = currentPage > 0 ? currentPage - 1 : 0;
			const previousReports = state.pagination.pageItems[previousPage];

			const newReport: Report = {
				id: payload.id,
				videoName: payload.videoName,
				userId: payload.userId,
				requestId: payload.requestId,
				traceId: payload.traceId,
				frameCutMinutes: payload.frameCutMinutes,
				percentStatusProcess: payload.percentStatusProcess,
				reportTime: payload.reportTime,
				status,
			};

			if (existingIndex >= 0 && pagination.page === 0) {
				const currentUpdatedReports = [...currentReports];
				currentUpdatedReports[existingIndex] = newReport;

				pagination = {
					...pagination,
					pageItems: { ...pagination.pageItems, [currentPage]: currentUpdatedReports },
				};

				return { pagination };
			}
			if (existingIndex >= 0) {
				if (previousReports.length === 0) {
					pagination = {
						...pagination,
						pageItems: { ...pagination.pageItems, [currentPage]: currentReports },
					};

					return { pagination };
				}

				let currentUpdatedReports = [...currentReports];
				currentUpdatedReports.splice(existingIndex, 1);
				const lastPreviousReport = previousReports.pop() as Report;
				currentUpdatedReports = [lastPreviousReport, ...currentUpdatedReports];

				pagination = {
					...pagination,
					pageItems: {
						...pagination.pageItems,
						[currentPage]: currentUpdatedReports,
						[previousPage]: previousReports,
					},
				};

				return { pagination };
			}

			if (currentReports.length < pagination.size && pagination.page === 0) {
				pagination = {
					...pagination,
					pageItems: { ...pagination.pageItems, [currentPage]: [newReport, ...currentReports] },
				};

				return {
					pagination,
				};
			}
			if (
				(currentReports.length < pagination.size && payload.status === "STARTED") ||
				(payload.status === "FAILED" && payload.percentStatusProcess === 0)
			) {
				if (previousReports.length === 0) {
					pagination = {
						...pagination,
						pageItems: { ...pagination.pageItems, [currentPage]: currentReports },
					};

					return { pagination };
				}

				const lastPreviousReport = previousReports.pop() as Report;

				pagination = {
					...pagination,
					pageItems: {
						...pagination.pageItems,
						[currentPage]: [lastPreviousReport, ...currentReports],
						[previousPage]: previousReports,
					},
				};

				return {
					pagination,
				};
			}

			if (currentReports.length >= pagination.size && pagination.page === 0) {
				const currentUpdatedReports = [newReport, ...currentReports.slice(0, pagination.size - 1)];

				if (!pagination.hasNext) {
					pagination = createNextPageInStore(pagination);
				}

				pagination = {
					...pagination,
					pageItems: { ...pagination.pageItems, [currentPage]: currentUpdatedReports },
				};

				return {
					pagination,
				};
			}
			if (
				(currentReports.length >= pagination.size && payload.status === "STARTED") ||
				(payload.status === "FAILED" && payload.percentStatusProcess === 0)
			) {
				if (previousReports.length === 0) {
					pagination = {
						...pagination,
						pageItems: { ...pagination.pageItems, [currentPage]: currentReports },
					};

					return { pagination };
				}

				const lastPreviousReport = previousReports.pop() as Report;

				const currentUpdatedReports = [
					lastPreviousReport,
					...currentReports.slice(0, pagination.size - 1),
				];

				if (!pagination.hasNext) {
					pagination = createNextPageInStore(pagination);
				}

				pagination = {
					...pagination,
					pageItems: {
						...pagination.pageItems,
						[currentPage]: currentUpdatedReports,
						[previousPage]: previousReports,
					},
				};

				return {
					pagination,
				};
			}

			pagination = {
				...pagination,
				pageItems: { ...pagination.pageItems, [currentPage]: currentReports },
			};

			return { pagination };
		});
	},

	fetchDashboardStats: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetchStats();

			set({
				stats: {
					total: response.total,
					byStatus: {
						COMPLETED: response.completed,
						PROCESSING: response.processing,
						FAILED: response.failed,
					},
				},
				isLoading: false,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro ao carregar estatísticas";
			set({ error: message, isLoading: false });
		}
	},

	fetchLastExistingReport: async (requestId: string, videoName: string) => {
		set({ isLoading: true, error: null });

		try {
			const report = await fetchLastExistingReport(requestId, videoName);

			set((state) => {
				let pagination = { ...state.pagination };
				const currentPage = state.pagination.page;
				const currentReports = state.pagination.pageItems[currentPage];
				const existingIndex = currentReports.findIndex((r) => r.id === report.id);

				let currentUpdatedReports = [...currentReports];

				if (existingIndex >= 0) {
					currentUpdatedReports[existingIndex] = report;
				} else {
					currentUpdatedReports = [report, ...currentUpdatedReports];
				}

				pagination = {
					...pagination,
					pageItems: {
						...state.pagination.pageItems,
						[currentPage]: currentUpdatedReports,
					},
				};

				return {
					pagination,
					isLoading: false,
				};
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro ao buscar report";
			set({ error: message, isLoading: false });
		}
	},
}));
