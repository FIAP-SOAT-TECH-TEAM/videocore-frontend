"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "../schemas/login"
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

export function LoginForm({
  className,
  onSubmit: propsOnSubmit,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  })

  function onSubmit(data: LoginFormValues, event?: React.BaseSyntheticEvent) {
    propsOnSubmit?.(event as React.FormEvent<HTMLFormElement>)
    console.log(data)
  }

  return (
    <form
      id="login-form-rhf"
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-bold text-2xl ">Entre na sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Insira seu email abaixo para entrar na sua conta
          </p>
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
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
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Link
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
              />
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <FieldDescription className="text-center">
            Nao possui uma conta?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4"
            >
              Cadastre-se aqui
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
