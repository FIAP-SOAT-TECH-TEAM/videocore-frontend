"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { cognitoConfirmSignUp, cognitoResendSignUpCode } from "@/lib/cognito";

export interface PendingConfirmation {
	username: string;
	email?: string;
}

interface ConfirmOtpModalProps {
	pending: PendingConfirmation | null;
	onConfirmed: () => void;
}

export function ConfirmOtpModal({ pending, onConfirmed }: ConfirmOtpModalProps) {
	const router = useRouter();
	const [otp, setOtp] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (!pending) setOtp("");
	}, [pending]);

	async function handleConfirm() {
		if (!pending || otp.length < 6) return;

		setIsLoading(true);
		try {
			await cognitoConfirmSignUp(pending.username, otp);
			toast.success("Email confirmado! Faça login para continuar.");
			onConfirmed();
			router.push("/auth/login");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Código inválido.");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleResendCode() {
		if (!pending) return;

		try {
			toast.info("Reenviando código de verificação...");
			await cognitoResendSignUpCode(pending.username);
			toast.success("Código reenviado com sucesso!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao reenviar código.");
		}
	}

	return (
		<Dialog open={!!pending} modal={true}>
			<DialogContent showCloseButton={false} className="max-w-sm">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>Confirme seu email</DialogTitle>

						<Button
							variant="link"
							size="sm"
							className="absolute top-2 right-2"
							onClick={handleResendCode}
						>
							Reenviar código
						</Button>
					</div>
					<DialogDescription>
						Insira o código de 6 dígitos enviado para seu email cadastrado.
					</DialogDescription>
				</DialogHeader>

				<div className="flex justify-center py-2">
					<InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus={true}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>

				<Button className="w-full" disabled={otp.length < 6 || isLoading} onClick={handleConfirm}>
					{isLoading ? "Verificando..." : "Confirmar"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
