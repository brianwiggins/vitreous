import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import type { ButtonPlugin, ButtonOptions, ButtonUpdateOptions, ButtonFrame } from "./definitions";

export * from "./definitions";

// ---------------------------------------------------------------------------
// Frame helpers
// ---------------------------------------------------------------------------

/**
 * Derives a ButtonFrame from a DOM element.
 * Preserves the element's aspect ratio (pill, square, etc.).
 * minSize applies independently to width and height so a pill stays a pill.
 */
function frameFromElement(el: Element, minSize = 44): ButtonFrame {
  const rect = el.getBoundingClientRect();
  const width  = Math.max(rect.width,  minSize);
  const height = Math.max(rect.height, minSize);
  return {
    x: rect.x + rect.width  / 2 - width  / 2,
    y: rect.y + rect.height / 2 - height / 2,
    width,
    height,
  };
}

function resolveFrame(options: ButtonOptions | ButtonUpdateOptions): ButtonFrame | undefined {
  if (options.element) return frameFromElement(options.element, options.minSize);
  return options.frame;
}

// ---------------------------------------------------------------------------
// Plugin wrapper — strips non-serializable fields before bridging to native
// ---------------------------------------------------------------------------

const _native = registerPlugin<ButtonPlugin>("Button", {
  web: () => import("./web").then(m => new m.ButtonWeb()),
});

function stripExtras<T extends { element?: Element; minSize?: number }>(
  options: T
): Omit<T, "element" | "minSize"> {
  const { element: _e, minSize: _m, ...rest } = options as Record<string, unknown>;
  return rest as Omit<T, "element" | "minSize">;
}

export const Button: ButtonPlugin = {
  show(options: ButtonOptions): Promise<void> {
    const frame = resolveFrame(options);
    if (!frame) throw new Error("Button.show: provide either frame or element");
    return _native.show({ ...stripExtras(options), frame });
  },

  update(options: ButtonUpdateOptions): Promise<void> {
    const frame = resolveFrame(options);
    return _native.update({ ...stripExtras(options), ...(frame ? { frame } : {}) });
  },

  hide(options: { id: string }): Promise<void> {
    return _native.hide(options);
  },

  remove(options: { id: string }): Promise<void> {
    return _native.remove(options);
  },

  addListener(
    eventName: "tapped",
    listenerFunc: (ev: { id: string }) => void
  ): Promise<PluginListenerHandle> {
    return _native.addListener(eventName, listenerFunc);
  },
};
