"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { type LoginFormValues, loginSchema } from "../schemas/login";
import { ConfirmOtpModal, type PendingConfirmation } from "./confirm-otp-modal";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
	const router = useRouter();
	const login = useAuthStore((state) => state.login);
	const isLoading = useAuthStore((state) => state.isLoading);

	const [pendingConfirmation, setPendingConfirmation] = React.useState<PendingConfirmation | null>(
		null,
	);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { username: "", password: "" },
		mode: "onTouched",
	});

	async function onSubmit(data: LoginFormValues) {
		try {
			await login(data.username, data.password);
			toast.success("Login realizado com sucesso!");
			router.push("/dashboard");
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Erro desconhecido";

			if (message.includes("NotAuthorizedException") || message.includes("Incorrect")) {
				toast.error("Nome de usuário ou senha incorretos.");
			} else if (
				message.includes("UserNotFoundException") ||
				message.includes("User does not exist")
			) {
				toast.error("Usuário não encontrado.");
			} else if (message.includes("UNCONFIRMED")) {
				try {
					toast.info("Conta não confirmada. Reenviamos o código de verificação.");
					setPendingConfirmation({ username: data.username });
				} catch {
					toast.error("Erro ao reenviar código de verificação.");
				}
			} else {
				toast.error("Erro ao fazer login. Tente novamente.");
			}
			// erro ao fazer login
		}
	}

	return (
		<>
			<ConfirmOtpModal
				pending={pendingConfirmation}
				onConfirmed={() => setPendingConfirmation(null)}
			/>

			<form
				id="login-form-rhf"
				className={cn("flex flex-col gap-6", className)}
				onSubmit={form.handleSubmit(onSubmit)}
				{...props}
			>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="font-bold text-2xl">Entre na sua conta</h1>
						<p className="text-balance text-muted-foreground text-sm">
							Insira seu nome de usuário abaixo para entrar na sua conta
						</p>
					</div>

					<Controller
						name="username"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="login-username">Nome de usuário</FieldLabel>
								<Input
									{...field}
									id="login-username"
									type="text"
									placeholder="seu_usuario"
									aria-invalid={fieldState.invalid}
									autoComplete="username"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Controller
						name="password"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="login-password">Senha</FieldLabel>
								<Input
									{...field}
									id="login-password"
									type="password"
									placeholder="••••••••"
									aria-invalid={fieldState.invalid}
									autoComplete="current-password"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Entrando..." : "Login"}
						</Button>
						<FieldDescription className="text-center">
							Não possui uma conta?{" "}
							<Link href="/auth/register" className="underline underline-offset-4">
								Cadastre-se aqui
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</>
	);
}
