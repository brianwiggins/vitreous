// src/components/button/web.ts
import { WebPlugin } from "@capacitor/core";
var ButtonWeb = class extends WebPlugin {
  async show(options) {
    console.log("LiquidButton: show()", options);
  }
  async update(options) {
    console.log("LiquidButton: update()", options);
  }
  async hide(options) {
    console.log("LiquidButton: hide()", options.id);
  }
  async remove(options) {
    console.log("LiquidButton: remove()", options.id);
  }
};
export {
  ButtonWeb
};
//# sourceMappingURL=web-6I5KWONF.js.map