import { Client, type IMessage } from "@stomp/stompjs";
import { env } from "@/env";
import { getAccessToken, getAuthSubject } from "./cognito";
import { isDev } from "./utils";

export interface WebSocketCallbacks<T> {
	onPublish: (payload: T) => void;
	onConnection?: () => void;
	onDisconnect?: () => void;
	onError?: (error: string) => void;
}

export async function connectStomp<T>(
	stompSubscribePath: string,
	callbacks: WebSocketCallbacks<T>,
): Promise<Client> {
	let wsUrl = `${env.NEXT_PUBLIC_BASE_WS_URL}/ws/connect`;
	let token;
	let apimKey;
	let subject;
	// https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
	let secWebSocketProtocolCustomValue;

	if (isDev()) {
		subject = await getAuthSubject();
		secWebSocketProtocolCustomValue = `${subject}`;
	} else {
		apimKey = `${env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY}`;
		token = await getAccessToken();
		secWebSocketProtocolCustomValue = `${token}`;
		wsUrl = `${wsUrl}?subscription-key=${apimKey}`;
	}

	const client = new Client({
		webSocketFactory: () => {
			let subProtocols = ["v10.stomp", "v11.stomp", "v12.stomp", secWebSocketProtocolCustomValue];
			return new WebSocket(wsUrl, subProtocols);
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
		onWebSocketError: () => callbacks.onError?.("Erro WebSocket"),
	});

	client.activate();
	return client;
}
