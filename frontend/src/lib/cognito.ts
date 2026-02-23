import { Amplify } from "aws-amplify";
import {
	type ConfirmSignUpOutput,
	confirmSignUp,
	fetchAuthSession,
	getCurrentUser,
	resendSignUpCode,
	type SignInOutput,
	type SignUpOutput,
	signIn,
	signOut,
	signUp,
} from "aws-amplify/auth";
import { env } from "@/env";

const isDev = process.env.NODE_ENV === "development";

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
			userPoolClientId: env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
			...(isDev &&
				env.NEXT_PUBLIC_COGNITO_ENDPOINT && { userPoolEndpoint: env.NEXT_PUBLIC_COGNITO_ENDPOINT }),
		},
	},
});

export async function cognitoSignUp(data: {
	username: string;
	email: string;
	name: string;
	password: string;
}): Promise<SignUpOutput> {
	return signUp({
		username: data.username,
		password: data.password,
		options: {
			userAttributes: {
				email: data.email,
				name: data.name,
				preferred_username: data.username,
			},
		},
	});
}

export async function cognitoConfirmSignUp(
	username: string,
	code: string,
): Promise<ConfirmSignUpOutput> {
	return confirmSignUp({ username, confirmationCode: code });
}

export async function cognitoResendSignUpCode(username: string): Promise<void> {
	await resendSignUpCode({ username });
}

export async function cognitoSignIn(username: string, password: string): Promise<SignInOutput> {
	return signIn({
		username,
		password,
		options: {
			authFlowType: "USER_PASSWORD_AUTH",
		},
	});
}

export async function cognitoSignOut(): Promise<void> {
	await signOut();
}

export async function getAuthSession() {
	const session = await fetchAuthSession();
	return session;
}

export async function getAccessToken(): Promise<string | undefined> {
	const session = await fetchAuthSession();
	return session.tokens?.accessToken?.toString();
}

export async function getIdToken(): Promise<string | undefined> {
	const session = await fetchAuthSession();
	return session.tokens?.idToken?.toString();
}

export async function getAuthSubject(): Promise<string | undefined> {
	try {
		const user = await getCurrentUser();
		return user.userId;
	} catch {
		return undefined;
	}
}

export interface CognitoUserAttributes {
	sub: string;
	email: string;
	name?: string;
	preferred_username?: string;
}

export async function getUserAttributes(): Promise<CognitoUserAttributes | null> {
	try {
		const session = await fetchAuthSession();
		const idToken = session.tokens?.idToken;
		if (!idToken) return null;

		const payload = idToken.payload;
		return {
			sub: payload.sub as string,
			email: payload.email as string,
			name: (payload.name as string) || (payload.preferred_username as string),
			preferred_username: payload.preferred_username as string
		};
	} catch {
		return null;
	}
}
