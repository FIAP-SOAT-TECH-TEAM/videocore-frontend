import { create } from "zustand";
import { fetchLatestReports, fetchReportById } from "@/lib/api";
import type { ProcessStatus, Report, ReportPayload } from "@/types";

interface ReportsState {
	reports: Report[];
	isLoading: boolean;
	error: string | null;
}

interface ReportsActions {
	fetchReports: () => Promise<void>;
	updateReportFromWebSocket: (payload: ReportPayload) => void;
	getReportByRequestId: (requestId: string) => Report | undefined;
	getDashboardStats: () => {
		total: number;
		completed: number;
		processing: number;
		failed: number;
	};
	fetchReportById: (id: string) => Promise<void>;
}

type ReportsStore = ReportsState & ReportsActions;

export const useReportsStore = create<ReportsStore>()((set, get) => ({
	reports: [],
	isLoading: false,
	error: null,

	fetchReports: async () => {
		set({ isLoading: true, error: null });
		try {
			const reports = await fetchLatestReports();
			set({ reports, isLoading: false });
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

			const existingIndex = state.reports.findIndex(
				(r) => r.requestId === payload.requestId && r.videoName === payload.videoName,
			);

			if (existingIndex >= 0) {
				const updatedReports = [...state.reports];
				updatedReports[existingIndex] = newReport;
				return { reports: updatedReports };
			}

			return { reports: [newReport, ...state.reports] };
		});
	},

	getReportByRequestId: (requestId: string) => {
		return get().reports.find((r) => r.requestId === requestId);
	},

	getDashboardStats: () => {
		const reports = get().reports;
		return {
			total: reports.length,
			completed: reports.filter((r) => r.status === "COMPLETED").length,
			processing: reports.filter((r) => r.status === "PROCESSING" || r.status === "STARTED").length,
			failed: reports.filter((r) => r.status === "FAILED").length,
		};
	},

	fetchReportById: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			const report = await fetchReportById(id);
			set((state) => {
				const existingIndex = state.reports.findIndex((r) => r.id === report.id);
				let updatedReports = [...state.reports];
				if (existingIndex >= 0) {
					updatedReports[existingIndex] = report;
				} else {
					updatedReports = [report, ...updatedReports];
				}
				return { reports: updatedReports, isLoading: false };
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro ao buscar report";
			set({ error: message, isLoading: false });
		}
	},
}));
