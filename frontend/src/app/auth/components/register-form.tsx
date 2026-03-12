"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cognitoSignUp } from "@/lib/cognito";
import { cn } from "@/lib/utils";
import { type RegisterFormValues, registerSchema } from "../schemas/register";
import { ConfirmOtpModal, type PendingConfirmation } from "./confirm-otp-modal";

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
	const [isLoading, setIsLoading] = React.useState(false);
	const [pendingConfirmation, setPendingConfirmation] = React.useState<PendingConfirmation | null>(
		null,
	);

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onTouched",
	});

	async function onSubmit(data: RegisterFormValues) {
		try {
			setIsLoading(true);
			const result = await cognitoSignUp(data);

			if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
				setPendingConfirmation({
					username: data.username,
					email: data.email,
				});
			} else {
				toast.success("Conta criada com sucesso!");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<ConfirmOtpModal
				pending={pendingConfirmation}
				onConfirmed={() => setPendingConfirmation(null)}
			/>

			<form
				id="register-form-rhf"
				className={cn("flex flex-col gap-6", className)}
				onSubmit={form.handleSubmit(onSubmit)}
				{...props}
			>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="font-bold text-2xl">Crie sua conta</h1>
						<p className="text-balance text-muted-foreground text-sm">
							Insira seus dados abaixo para criar sua conta
						</p>
					</div>

					<Controller
						name="name"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="register-name">Nome completo</FieldLabel>
								<Input
									{...field}
									id="register-name"
									type="text"
									placeholder="Seu nome"
									aria-invalid={fieldState.invalid}
									autoComplete="name"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Controller
						name="username"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="register-username">Username</FieldLabel>
								<Input
									{...field}
									id="register-username"
									type="text"
									placeholder="seu_username"
									aria-invalid={fieldState.invalid}
									autoComplete="username"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Controller
						name="email"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="register-email">Email</FieldLabel>
								<Input
									{...field}
									id="register-email"
									type="email"
									placeholder="seu@exemplo.com"
									aria-invalid={fieldState.invalid}
									autoComplete="email"
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
								<FieldLabel htmlFor="register-password">Senha</FieldLabel>
								<Input
									{...field}
									id="register-password"
									type="password"
									placeholder="••••••••"
									aria-invalid={fieldState.invalid}
									autoComplete="new-password"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Controller
						name="confirmPassword"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="register-confirm-password">Confirmar Senha</FieldLabel>
								<Input
									{...field}
									id="register-confirm-password"
									type="password"
									placeholder="Repita a senha"
									aria-invalid={fieldState.invalid}
									autoComplete="new-password"
								/>
								{fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
							</Field>
						)}
					/>

					<Field>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Criando conta..." : "Criar Conta"}
						</Button>
						<FieldDescription className="text-center">
							Já possui uma conta?{" "}
							<Link href="/auth/login" className="underline underline-offset-4">
								Entre aqui
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</>
	);
}
