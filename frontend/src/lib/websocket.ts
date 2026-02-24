import { Client, type IMessage } from "@stomp/stompjs";
import { env } from "@/env";
import { getAccessToken, getAuthSubject } from "./cognito";

const isDev = process.env.NODE_ENV === "development";

export interface WebSocketCallbacks<T> {
	onPublish: (payload: T) => void;
	onConnection?: () => void;
	onDisconnect?: () => void;
	onError?: (error: string) => void;
}

export async function connectStomp<T>(
	stompSubscribePath: string,
	callbacks: WebSocketCallbacks<T>
): Promise<Client> {
	const wsUrl = `${env.NEXT_PUBLIC_WS_URL}`;
	let token;
	let apimKey;
	let subject;

	if (isDev) {
		subject = await getAuthSubject();
	}
	else {
		apimKey = `${env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY}`;
		token = await getAccessToken();
	}

	const client = new Client({
		brokerURL: wsUrl,
		connectHeaders: {
			...(token && {"Authorization": token}),
			...(apimKey && {"Ocp-Apim-Subscription-Key": apimKey}),
			...(subject && {"Auth-Subject": subject})
		},
		reconnectDelay: 5000,
		heartbeatIncoming: 10000,
		heartbeatOutgoing: 10000,

		onConnect: () => {
			callbacks.onConnection?.();

			client.subscribe(stompSubscribePath, (message: IMessage) => {
				try {
					const payload = JSON.parse(message.body) as T;
					callbacks.onPublish(payload);
				} catch {
					callbacks.onError?.("Payload STOMP inválido");
				}
			});
		},
		onStompError: (frame) => callbacks.onError?.(frame.headers.message ?? "Erro STOMP"),
		onWebSocketClose: () => callbacks.onDisconnect?.(),
		onWebSocketError: () =>  callbacks.onError?.("Erro WebSocket")
	});

	client.activate();
	return client;
}