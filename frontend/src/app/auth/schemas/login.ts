import * as z from "zod";

export const loginSchema = z.object({
	username: z.string().min(1, "Nome de usuário é obrigatório"),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
