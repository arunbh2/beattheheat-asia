import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/fraunces/300.css";
import "@fontsource/fraunces/400.css";
import "./styles.css";
import App from "./App";

const qc = new QueryClient();
createRoot(document.getElementById("root")!).render(<StrictMode><QueryClientProvider client={qc}><App /></QueryClientProvider></StrictMode>);
