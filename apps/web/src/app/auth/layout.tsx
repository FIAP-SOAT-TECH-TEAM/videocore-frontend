import Image from "next/image";
import authCover from "../../assets/auth-cover.png";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
					{children}
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<Image
				    src={authCover}
                    width={1024}
                    height={1024}
					alt="Auth image cover"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
