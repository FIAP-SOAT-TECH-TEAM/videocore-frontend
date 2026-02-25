import { env } from "@/env";
import type { Report, VideoImagesDownloadUrlResponse, VideoUploadUrlResponse } from "@/types";
import { getAccessToken, getAuthSubject } from "./cognito";
import { isDev } from "./utils";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (isDev()) {
		const subject = await getAuthSubject();

		subject && (headers["Auth-Subject"] = `${subject}`);
	} else {
		const apimKey = `${env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY}`;
		const token = await getAccessToken();

		token && (headers.Authorization = `Bearer ${token}`);
		apimKey && (headers["Ocp-Apim-Subscription-Key"] = apimKey);
	}

	return headers;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers = await getAuthHeaders();
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			...headers,
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => null);
		const message = errorBody?.message || `HTTP ${response.status}`;
		throw new Error(message);
	}

	return response.json();
}

/**
 * GET /latest — Retorna os últimos reports do usuário autenticado
 */
export async function fetchLatestReports(): Promise<Report[]> {
	return apiFetch<Report[]>("/latest");
}

/**
 * GET /{reportId} — Retorna um reporte do usuário autenticado pelo ID
 */
export async function fetchReportById(id: string): Promise<Report> {
	return apiFetch<Report>(`/${id}`);
}

/**
 * GET /video/download/url?requestId=...&videoName=... — Retorna a SAS URL de download do ZIP de imagens
 */
export async function fetchVideoImagesDownloadUrl(
	requestId: string,
	videoName: string,
): Promise<VideoImagesDownloadUrlResponse> {
	const params = new URLSearchParams({ requestId, videoName });
	return apiFetch<VideoImagesDownloadUrlResponse>(`/video/download/url?${params.toString()}`);
}

/**
 * GET /video/upload/url?videoNames=... — Solicita SAS URLs de upload ao backend (máximo 3 vídeos)
 * Retorna uma lista com url, userId e requestId para cada vídeo.
 */
export async function fetchVideoUploadUrls(
	videoNames: string[],
): Promise<VideoUploadUrlResponse[]> {
	const params = new URLSearchParams();
	for (const name of videoNames) {
		params.append("videoNames", name);
	}
	return apiFetch<VideoUploadUrlResponse[]>(`/video/upload/url?${params.toString()}`);
}

/**
 * Upload do arquivo diretamente para o Azure Blob Storage via SAS URL.
 * Define metadata (user_id, request_id, frame_cut) como headers x-ms-meta-*.
 */
export async function uploadFileToBlobStorage(
	sasUrl: string,
	file: File,
	metadata: Record<string, string>,
	onProgress?: (percent: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", (event) => {
			if (event.lengthComputable && onProgress) {
				const percent = Math.round((event.loaded / event.total) * 100);
				onProgress(percent);
			}
		});

		xhr.addEventListener("load", () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`Upload falhou: HTTP ${xhr.status}`));
			}
		});

		xhr.addEventListener("error", () => reject(new Error("Erro de rede no upload")));
		xhr.addEventListener("abort", () => reject(new Error("Upload cancelado")));

		xhr.open("PUT", sasUrl);
		xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
		xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

		for (const [key, value] of Object.entries(metadata)) {
			xhr.setRequestHeader(`x-ms-meta-${key}`, value);
		}

		xhr.send(file);
	});
}
