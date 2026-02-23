import { Client, type IMessage } from "@stomp/stompjs";
import { env } from "@/env";
import type { ReportPayload } from "@/types";

let stompClient: Client | null = null;

export interface WebSocketCallbacks {
	onReportUpdate: (payload: ReportPayload) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onError?: (error: string) => void;
}

export function connectWebSocket(
	userId: string,
	authSubject: string,
	callbacks: WebSocketCallbacks,
): Client {
	disconnectWebSocket();

	const wsUrl = `${env.NEXT_PUBLIC_WS_URL}?Auth-Subject=${encodeURIComponent(authSubject)}`;

	const client = new Client({
		brokerURL: wsUrl,
		connectHeaders: {
			"Auth-Subject": authSubject,
		},
		reconnectDelay: 5000,
		heartbeatIncoming: 10000,
		heartbeatOutgoing: 10000,

		onConnect: () => {
			// [WebSocket] Conectado ao STOMP broker
			callbacks.onConnect?.();

			client.subscribe(`/topic/${userId}`, (message: IMessage) => {
				try {
					const payload: ReportPayload = JSON.parse(message.body);
					callbacks.onReportUpdate(payload);
				} catch (_error) {
					// [WebSocket] Erro ao processar mensagem
				}
			});
		},

		onDisconnect: () => {
			// [WebSocket] Desconectado
			callbacks.onDisconnect?.();
		},

		onStompError: (frame) => {
			// [WebSocket] STOMP error
			callbacks.onError?.(frame.headers.message || "Erro na conexão WebSocket");
		},

		onWebSocketError: (_event) => {
			// [WebSocket] WebSocket error
			callbacks.onError?.("Erro na conexão WebSocket");
		},
	});

	client.activate();
	stompClient = client;

	return client;
}

export function disconnectWebSocket(): void {
	if (stompClient?.active) {
		stompClient.deactivate();
		// [WebSocket] Desconectado manualmente
	}
	stompClient = null;
}

export function isWebSocketConnected(): boolean {
	return stompClient?.active ?? false;
}
