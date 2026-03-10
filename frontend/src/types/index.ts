// Status do processamento (alinhado com backend: ProcessStatus enum)
export type ProcessStatus = "STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";

// Report retornado por GET /latest (alinhado com ReportResponse do backend)
export interface Report {
	id: string;
	videoName: string;
	userId: string;
	requestId: string;
	traceId: string;
	frameCutMinutes: number;
	percentStatusProcess: number; // 0-100
	reportTime: string;
	status: ProcessStatus;
}

// Payload recebido via WebSocket STOMP (alinhado com ReportPayload do backend)
export interface ReportPayload {
	id: string;
	videoName: string;
	userId: string;
	requestId: string;
	traceId: string;
	imageMinute: number;
	frameCutMinutes: number;
	percentStatusProcess: number;
	reportTime: string;
	status: ProcessStatus;
}

// Resposta de GET /video/download/url (alinhado com VideoImagesDownloadUrlResponse do backend)
export interface VideoImagesDownloadUrlResponse {
	url: string;
}

// Resposta de GET /video/upload/url (alinhado com VideoUploadUrlResponse do backend)
export interface VideoUploadUrlResponse {
	url: string;
	userId: string;
	requestId: string;
}

// Usuário autenticado via Cognito
export interface User {
	id: string; // Cognito sub
	email: string;
	name: string;
	avatarUrl?: string;
}

// Resposta de paginação genérica (alinhada com PaginationResponse do backend)
export type PaginationResponse<T> = {
	content: T[];
} & Pagination;

// Resposta de paginação genérica (alinhada com PaginationResponse do backend)
export type PaginationState<T> = {
	pageItems: Record<number, T[]>;
} & Pagination;

// Metadados de paginação para frontend
export interface Pagination {
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

// Estatísticas de reports para dashboard
export interface ReportStats {
	total: number;
	byStatus: {
		PROCESSING: number;
		COMPLETED: number;
		FAILED: number;
	};
}

// Resposta de GET /stats (alinhada com ReportStatsResponse do backend)
export interface ReportStatsResponse {
	total: number;
	completed: number;
	processing: number;
	failed: number;
}
