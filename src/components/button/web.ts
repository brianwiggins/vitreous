import { WebPlugin } from "@capacitor/core";
import type { ButtonPlugin, ButtonOptions, ButtonUpdateOptions } from "./definitions";

export class ButtonWeb extends WebPlugin implements ButtonPlugin {
  async show(_options: ButtonOptions): Promise<void> {}

  async update(_options: ButtonUpdateOptions): Promise<void> {}

  async hide(_options: { id: string }): Promise<void> {}

  async remove(_options: { id: string }): Promise<void> {}
}
