import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import App from "./App.jsx";

const publishableKey = String(
	import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
).trim();

if (!publishableKey) {
	throw new Error(
		"Brak VITE_CLERK_PUBLISHABLE_KEY. Ustaw zmienną w Vercel (Settings → Environment Variables) dla Production i zrób Redeploy.",
	);
}

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ClerkProvider publishableKey={publishableKey}>
			<App />
		</ClerkProvider>
	</StrictMode>,
);
