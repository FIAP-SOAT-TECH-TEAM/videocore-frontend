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
	cpf?: string;
	role?: string;
}
