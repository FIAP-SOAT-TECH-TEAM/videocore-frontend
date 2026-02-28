import Image from "next/image";
import { GuestGuard } from "@/components/guest-guard";
import authCover from "../../assets/auth_cover.png";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<GuestGuard>
			<div className="grid min-h-svh lg:grid-cols-2">
				<div className="flex flex-col gap-4 p-6 md:p-10">
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-xs">{children}</div>
					</div>
				</div>
				<div className="hidden lg:flex items-center justify-center">
					<Image
						src={authCover}
						width={1024}
						height={1024}
						alt="Auth image cover"
						className="max-w-full max-h-full object-contain"
						sizes="(max-width: 1024px) 100vw, 50vw"
					/>
				</div>
			</div>
		</GuestGuard>
	);
}
