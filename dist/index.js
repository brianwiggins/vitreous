// src/components/tabs/index.ts
import { registerPlugin } from "@capacitor/core";
var TabsBar = registerPlugin("TabsBar", {
  web: () => import("./web-SI4KTUU7.js").then((m) => new m.TabsBarWeb())
});

// src/components/button/index.ts
import { registerPlugin as registerPlugin2 } from "@capacitor/core";
var Button = registerPlugin2("Button", {
  web: () => import("./web-RX3AWSMS.js").then((m) => new m.ButtonWeb())
});
export {
  Button,
  TabsBar
};
//# sourceMappingURL=index.js.map