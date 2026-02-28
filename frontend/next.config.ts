import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	output: "export",
	images: {
		unoptimized: true,
	},
	// Azure Static WebSite necessita de trailing slash para que o Client Side Routing funcione corretamente
	// https://stackoverflow.com/questions/75816349/azure-static-site-on-storage-account-all-paths-other-than-index-return-a-404
	trailingSlash: true,
};

export default nextConfig;
