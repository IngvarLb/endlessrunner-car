import { createGameApp } from "./app/GameApp";
import "./styles/global.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

const app = createGameApp(root);
await app.init();

window.addEventListener("beforeunload", () => app.dispose());

// Register the PWA service worker (production builds only, so it never
// interferes with the Vite dev server / HMR). BASE_URL keeps it deploy-agnostic.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const base = import.meta.env.BASE_URL;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => undefined);
  });
}
