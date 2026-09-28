import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { initializeStorageOptimization } from "./utils/storageUtils";
import "./index.css";

// Automatically optimize local storage cache on startup to avoid QuotaExceededError
initializeStorageOptimization();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
