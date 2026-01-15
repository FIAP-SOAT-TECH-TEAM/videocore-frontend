"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { registerSchema, type RegisterFormValues } from "../schemas/register"

export function RegisterForm({
  className,
  onSubmit: propsOnSubmit,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  })

  function onSubmit(data: RegisterFormValues, event?: React.BaseSyntheticEvent) {
    propsOnSubmit?.(event as React.FormEvent<HTMLFormElement>)
    console.log(data)
  }

  return (
    <form
      id="register-form-rhf"
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-bold text-2xl">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Insira seu email abaixo para começar
          </p>
        </div>

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
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
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
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm-password">
                Confirmar Senha
              </FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type="password"
                placeholder="Repita a senha"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
              />
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" className="w-full">
            Cadastrar
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
  )
}
