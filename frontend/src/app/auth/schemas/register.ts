import * as z from "zod";

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, "Nome é obrigatório")
			.max(100, "Nome deve ter no máximo 100 caracteres"),
		username: z
			.string()
			.min(3, "Username deve ter no mínimo 3 caracteres")
			.max(30, "Username deve ter no máximo 30 caracteres")
			.regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscores"),
		email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
		password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
		confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
