import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Ensure only one instance of Three.js
if (window.THREE) {
  console.warn('THREE already exists on window');
} else {
  // This will be populated by the imports in our components
  window.THREE = {};
}

// Clean up any lingering script tags that might be causing issues
document.addEventListener('DOMContentLoaded', () => {
  // Remove any script tags with MindAR or AR.js
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    if (src.includes('mindar') || src.includes('ar.js')) {
      script.remove();
    }
  });
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
