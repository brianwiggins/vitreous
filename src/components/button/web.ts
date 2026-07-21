import { WebPlugin } from "@capacitor/core";
import type { ButtonPlugin, ButtonOptions } from "./definitions";

export class ButtonWeb extends WebPlugin implements ButtonPlugin {
  async show(options: ButtonOptions): Promise<void> {
    console.log("LiquidButton: show()", options);
  }

  async update(options: ButtonOptions): Promise<void> {
    console.log("LiquidButton: update()", options);
  }

  async hide(options: { id: string }): Promise<void> {
    console.log("LiquidButton: hide()", options.id);
  }

  async remove(options: { id: string }): Promise<void> {
    console.log("LiquidButton: remove()", options.id);
  }
}
