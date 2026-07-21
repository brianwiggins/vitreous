// src/components/tabs/index.ts
import { registerPlugin } from "@capacitor/core";
var TabsBar = registerPlugin("TabsBar", {
  web: () => import("./web-FDK2MPWE.js").then((m) => new m.TabsBarWeb())
});

// src/components/button/index.ts
import { registerPlugin as registerPlugin2 } from "@capacitor/core";
var Button = registerPlugin2("Button", {
  web: () => import("./web-6I5KWONF.js").then((m) => new m.ButtonWeb())
});
export {
  Button as LiquidButton,
  TabsBar
};
//# sourceMappingURL=index.js.map