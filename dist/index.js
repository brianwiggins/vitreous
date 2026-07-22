// src/components/tabs/index.ts
import { registerPlugin } from "@capacitor/core";
var TabsBar = registerPlugin("TabsBar", {
  web: () => import("./web-IPZCEYFC.js").then((m) => new m.TabsBarWeb())
});

// src/components/button/index.ts
import { registerPlugin as registerPlugin2 } from "@capacitor/core";
function frameFromElement(el, minSize = 44) {
  const rect = el.getBoundingClientRect();
  const width = Math.max(rect.width, minSize);
  const height = Math.max(rect.height, minSize);
  return {
    x: rect.x + rect.width / 2 - width / 2,
    y: rect.y + rect.height / 2 - height / 2,
    width,
    height
  };
}
function resolveFrame(options) {
  if (options.element) return frameFromElement(options.element, options.minSize);
  return options.frame;
}
var _native = registerPlugin2("Button", {
  web: () => import("./web-67IZK274.js").then((m) => new m.ButtonWeb())
});
function stripExtras(options) {
  const { element: _e, minSize: _m, ...rest } = options;
  return rest;
}
var Button = {
  show(options) {
    const frame = resolveFrame(options);
    if (!frame) throw new Error("Button.show: provide either frame or element");
    return _native.show({ ...stripExtras(options), frame });
  },
  update(options) {
    const frame = resolveFrame(options);
    return _native.update({ ...stripExtras(options), ...frame ? { frame } : {} });
  },
  hide(options) {
    return _native.hide(options);
  },
  remove(options) {
    return _native.remove(options);
  },
  addListener(eventName, listenerFunc) {
    return _native.addListener(eventName, listenerFunc);
  }
};
export {
  Button,
  TabsBar,
  frameFromElement
};
//# sourceMappingURL=index.js.map