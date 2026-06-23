import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import App from "./App.jsx";
import { CLERK_PUBLISHABLE_KEY } from "./config.js";

const publishableKey = String(
	CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
).trim();

if (!publishableKey) {
	throw new Error(
		"Brak CLERK_PUBLISHABLE_KEY – ustaw klucz w src/config.js lub VITE_CLERK_PUBLISHABLE_KEY w .env",
	);
}

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ClerkProvider publishableKey={publishableKey}>
			<App />
		</ClerkProvider>
	</StrictMode>,
);
