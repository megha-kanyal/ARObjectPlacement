import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import * as THREE from 'three';

// Add THREE to the window object to prevent multiple instances
declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

// Ensure only one instance of Three.js
if (window.THREE) {
  console.warn('THREE already exists on window');
} else {
  // Explicitly set THREE on window to prevent multiple instances
  window.THREE = THREE;
}

// More aggressive cleanup of problematic scripts
function removeProblematicScripts() {
  // First, remove any script tags with MindAR or AR.js
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    if (src.includes('mindar') || src.includes('ar.js')) {
      console.log('Removing problematic script:', src);
      script.remove();
    }
  });

  // Also remove any script tags that might be added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            const src = script.getAttribute('src') || '';
            if (src.includes('mindar') || src.includes('ar.js')) {
              console.log('Removing dynamically added script:', src);
              script.remove();
            }
          }
        });
      }
    });
  });

  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// Run immediately and also after DOM is loaded
removeProblematicScripts();
document.addEventListener('DOMContentLoaded', removeProblematicScripts);

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
