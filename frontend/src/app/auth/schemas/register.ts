import * as z from "zod";

export const registerSchema = z
	.object({
		username: z.string().min(3, "Username deve ter ao menos 3 caracteres"),
		name: z.string().min(5, "Nome deve ter ao menos 5 caracteres"),
		email: z.email("Email inválido"),
		password: z
			.string()
			.min(8, "Senha deve ter ao menos 8 caracteres")
			.regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
			.regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
			.regex(/[0-9]/, "Senha deve conter ao menos um número")
			.regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um símbolo"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
