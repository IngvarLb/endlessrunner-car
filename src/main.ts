import { createGameApp } from "./app/GameApp";
import "./styles/global.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

const app = createGameApp(root);
await app.init();

window.addEventListener("beforeunload", () => app.dispose());
