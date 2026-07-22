"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/tabs/color-utils.ts
function isValidHexColor(color) {
  const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(color);
}
function isValidRgbaColor(color) {
  const rgbaRegex = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([01](?:\.\d+)?))?\s*\)$/i;
  const match = color.match(rgbaRegex);
  if (!match) return false;
  const [, r, g, b, a] = match;
  const red = parseFloat(r);
  const green = parseFloat(g);
  const blue = parseFloat(b);
  const alpha = a ? parseFloat(a) : 1;
  return red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255 && alpha >= 0 && alpha <= 1;
}
function isValidColor(color) {
  if (!color || typeof color !== "string") return false;
  return isValidHexColor(color) || isValidRgbaColor(color);
}
var init_color_utils = __esm({
  "src/components/tabs/color-utils.ts"() {
    "use strict";
  }
});

// src/components/tabs/web.ts
var web_exports = {};
__export(web_exports, {
  TabsBarWeb: () => TabsBarWeb
});
var import_core, ImageValidator, ImageManager, TabsBarWeb;
var init_web = __esm({
  "src/components/tabs/web.ts"() {
    "use strict";
    import_core = require("@capacitor/core");
    init_color_utils();
    ImageValidator = class {
      // 5MB
      static isValidImageFormat(contentType) {
        return this.SUPPORTED_FORMATS.includes(contentType.toLowerCase());
      }
      static isValidBase64DataUri(dataUri) {
        const base64Pattern = /^data:image\/(png|jpeg|jpg|svg\+xml|webp);base64,/i;
        return base64Pattern.test(dataUri);
      }
      static isValidHttpUrl(url) {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
          return false;
        }
      }
      static validateImageSize(blob) {
        return blob.size <= this.MAX_FILE_SIZE;
      }
    };
    ImageValidator.SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    ImageValidator.MAX_FILE_SIZE = 5 * 1024 * 1024;
    ImageManager = class {
      static async loadImage(imageIcon) {
        const { image } = imageIcon;
        if (ImageValidator.isValidBase64DataUri(image)) {
          return image;
        }
        if (ImageValidator.isValidHttpUrl(image)) {
          return this.loadRemoteImage(image);
        }
        throw new Error(`Invalid image source: ${image}`);
      }
      static async loadRemoteImage(url) {
        if (this.loadingPromises.has(url)) {
          return this.loadingPromises.get(url);
        }
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          return cached.objectUrl;
        }
        const loadingPromise = this.fetchAndCacheImage(url);
        this.loadingPromises.set(url, loadingPromise);
        try {
          const result = await loadingPromise;
          this.loadingPromises.delete(url);
          return result;
        } catch (error) {
          this.loadingPromises.delete(url);
          throw error;
        }
      }
      static async fetchAndCacheImage(url) {
        try {
          const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "default",
            headers: {
              "Accept": "image/*"
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const contentType = response.headers.get("content-type") || "";
          if (!ImageValidator.isValidImageFormat(contentType)) {
            throw new Error(`Unsupported image format: ${contentType}`);
          }
          const blob = await response.blob();
          if (!ImageValidator.validateImageSize(blob)) {
            throw new Error("Image file too large");
          }
          const oldCached = this.cache.get(url);
          if (oldCached) {
            URL.revokeObjectURL(oldCached.objectUrl);
          }
          const objectUrl = URL.createObjectURL(blob);
          const cached = {
            url,
            blob,
            timestamp: Date.now(),
            objectUrl
          };
          this.cache.set(url, cached);
          this.cleanupCache();
          return objectUrl;
        } catch (error) {
          throw new Error(`Failed to load image from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      static cleanupCache() {
        const now = Date.now();
        for (const [url, cached] of this.cache.entries()) {
          if (now - cached.timestamp > this.CACHE_DURATION) {
            URL.revokeObjectURL(cached.objectUrl);
            this.cache.delete(url);
          }
        }
      }
      static clearCache() {
        for (const cached of this.cache.values()) {
          URL.revokeObjectURL(cached.objectUrl);
        }
        this.cache.clear();
        this.loadingPromises.clear();
      }
    };
    ImageManager.cache = /* @__PURE__ */ new Map();
    ImageManager.CACHE_DURATION = 24 * 60 * 60 * 1e3;
    // 24 hours
    ImageManager.loadingPromises = /* @__PURE__ */ new Map();
    TabsBarWeb = class extends import_core.WebPlugin {
      constructor() {
        super(...arguments);
        this.loadingStates = /* @__PURE__ */ new Map();
        this.imageLoadPromises = /* @__PURE__ */ new Map();
      }
      async configure(options) {
        if (options.selectedIconColor && !isValidColor(options.selectedIconColor)) {
          console.warn(`TabsBar: Invalid selectedIconColor format: ${options.selectedIconColor}`);
        }
        if (options.unselectedIconColor && !isValidColor(options.unselectedIconColor)) {
          console.warn(`TabsBar: Invalid unselectedIconColor format: ${options.unselectedIconColor}`);
        }
        await this.validateAndPreloadImages(options.items);
      }
      async validateAndPreloadImages(items) {
        const imagePromises = items.filter((item) => item.imageIcon).map((item) => this.preloadItemImage(item));
        await Promise.allSettled(imagePromises);
      }
      async preloadItemImage(item) {
        if (!item.imageIcon) return;
        const { id } = item;
        const { imageIcon } = item;
        if (this.imageLoadPromises.has(id)) {
          return this.imageLoadPromises.get(id);
        }
        this.loadingStates.set(id, "loading");
        const loadPromise = this.loadImageIcon(imageIcon).then(() => {
          this.loadingStates.set(id, "loaded");
        }).catch((error) => {
          this.loadingStates.set(id, "error");
          console.warn(`TabsBar: Failed to load image for tab ${id}:`, error.message);
          if (!item.systemIcon) {
            console.warn(`TabsBar: No fallback available for tab ${id}`);
          }
        }).finally(() => {
          this.imageLoadPromises.delete(id);
        });
        this.imageLoadPromises.set(id, loadPromise);
        return loadPromise;
      }
      async loadImageIcon(imageIcon) {
        try {
          return await ImageManager.loadImage(imageIcon);
        } catch (error) {
          throw new Error(`Image loading failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /** Get the loading state of an image for a specific tab */
      getImageLoadingState(tabId) {
        return this.loadingStates.get(tabId);
      }
      /** Clear all cached images */
      clearImageCache() {
        ImageManager.clearCache();
        this.loadingStates.clear();
        this.imageLoadPromises.clear();
      }
      async show() {
      }
      async hide() {
      }
      async select(_options) {
      }
      async setBadge(_options) {
      }
      async getSafeAreaInsets() {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    };
  }
});

// src/components/button/web.ts
var web_exports2 = {};
__export(web_exports2, {
  ButtonWeb: () => ButtonWeb
});
var import_core3, ButtonWeb;
var init_web2 = __esm({
  "src/components/button/web.ts"() {
    "use strict";
    import_core3 = require("@capacitor/core");
    ButtonWeb = class extends import_core3.WebPlugin {
      async show(_options) {
      }
      async update(_options) {
      }
      async hide(_options) {
      }
      async remove(_options) {
      }
    };
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Button: () => Button,
  TabsBar: () => TabsBar
});
module.exports = __toCommonJS(index_exports);

// src/components/tabs/index.ts
var import_core2 = require("@capacitor/core");
var TabsBar = (0, import_core2.registerPlugin)("TabsBar", {
  web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.TabsBarWeb())
});

// src/components/button/index.ts
var import_core4 = require("@capacitor/core");
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
var _native = (0, import_core4.registerPlugin)("Button", {
  web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.ButtonWeb())
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  TabsBar
});
//# sourceMappingURL=index.cjs.map