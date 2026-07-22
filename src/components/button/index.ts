import { registerPlugin } from "@capacitor/core";
import type { ButtonPlugin } from "./definitions";

export * from "./definitions";

export const Button = registerPlugin<ButtonPlugin>("Button", {
  web: () => import("./web").then(m => new m.ButtonWeb()),
});
