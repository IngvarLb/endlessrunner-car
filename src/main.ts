import { createGameApp } from "./app/GameApp";
import "./styles/global.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

// iOS standalone PWAs don't fill to the home indicator with bottom:0/100%, so
// pin the real viewport height into a CSS var the root reads from.
const updateAppHeight = (): void => {
  document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
};
updateAppHeight();
window.addEventListener("resize", updateAppHeight);
window.addEventListener("orientationchange", () => window.setTimeout(updateAppHeight, 250));
window.visualViewport?.addEventListener("resize", updateAppHeight);

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
