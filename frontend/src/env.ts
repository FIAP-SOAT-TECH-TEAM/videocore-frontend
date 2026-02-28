import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		NEXT_PUBLIC_BASE_API_URL: z.url(),
		NEXT_PUBLIC_BASE_WS_URL: z.url(),
		NEXT_PUBLIC_COGNITO_USER_POOL_ID: z.string().min(1),
		NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string().min(1),
		NEXT_PUBLIC_COGNITO_REGION: z.string().default("us-east-1"),
		NEXT_PUBLIC_COGNITO_ENDPOINT: z.url().optional(),
		NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY: z.string().optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
		NEXT_PUBLIC_BASE_WS_URL: process.env.NEXT_PUBLIC_BASE_WS_URL,
		NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
		NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
		NEXT_PUBLIC_COGNITO_REGION: process.env.NEXT_PUBLIC_COGNITO_REGION,
		NEXT_PUBLIC_COGNITO_ENDPOINT: process.env.NEXT_PUBLIC_COGNITO_ENDPOINT,
		NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY: process.env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
