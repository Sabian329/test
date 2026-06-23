import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const viteEnv = loadEnv(mode, process.cwd(), "VITE");
	const clerkPublishableKey =
		viteEnv.VITE_CLERK_PUBLISHABLE_KEY ||
		process.env.VITE_CLERK_PUBLISHABLE_KEY ||
		process.env.CLERK_PUBLISHABLE_KEY ||
		"";

	return {
		plugins: [react()],
		define: {
			"import.meta.env.VITE_CLERK_PUBLISHABLE_KEY":
				JSON.stringify(clerkPublishableKey),
		},
		server: {
			host: true,
			port: 5173,
		},
	};
});
