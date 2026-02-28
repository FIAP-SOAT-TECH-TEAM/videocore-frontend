import Image from "next/image";
import notFound from "../assets/not_found.png";

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center">
			<Image
				src={notFound}
				width={512}
				height={512}
				alt="Auth image cover"
				className="object-contain"
			/>
		</main>
	);
}
