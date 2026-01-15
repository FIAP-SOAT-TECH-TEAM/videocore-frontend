import * as z from "zod"

export const registerSchema = z
  .object({
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })


export type RegisterFormValues = z.infer<typeof registerSchema>
