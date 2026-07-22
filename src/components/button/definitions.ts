import type { PluginListenerHandle } from '@capacitor/core';

export interface ButtonFrame {
  /** X position in CSS pixels (from getBoundingClientRect) */
  x: number;
  /** Y position in CSS pixels (from getBoundingClientRect) */
  y: number;
  width: number;
  height: number;
}

type ButtonOptionsBase = {
  /** Unique identifier for this button */
  id: string;
  /** Text label displayed inside the button */
  label?: string;
  /** SF Symbol name (e.g. 'plus', 'heart.fill') */
  systemIcon?: string;
  /** Tint color for the SF Symbol icon (hex or RGBA format) */
  iconColor?: string;
};

/** ButtonOptions requires exactly one of `frame` or `element` (not both, not neither). */
export type ButtonOptions = ButtonOptionsBase &
  (
    | {
        /** Position and size in CSS pixels. */
        frame: ButtonFrame;
        element?: never;
        minSize?: never;
        forceSquare?: never;
      }
    | {
        /** DOM element to center the button over. */
        element: Element;
        frame?: never;
        /** Minimum button size in CSS pixels when deriving frame from element (default: 44) */
        minSize?: number;
        /** Force equal width and height (circle). Uses max(width, height, minSize) for both dimensions. */
        forceSquare?: boolean;
      }
  );

/** Options for update() -- all fields except id are optional */
export interface ButtonUpdateOptions {
  id: string;
  label?: string;
  systemIcon?: string;
  iconColor?: string;
  /** New frame in CSS pixels. Provide either frame or element, or omit to keep current position. */
  frame?: ButtonFrame;
  /** DOM element to re-derive frame from. */
  element?: Element;
  /** Minimum button size when re-deriving frame from element (default: 44) */
  minSize?: number;
  /** Force equal width and height (circle). Uses max(width, height, minSize) for both dimensions. */
  forceSquare?: boolean;
}

export interface ButtonPlugin {
  /** Create and show a new liquid glass button */
  show(options: ButtonOptions): Promise<void>;
  /** Update an existing button. All fields except id are optional;
   *  omit frame to update only visual properties without moving the button */
  update(options: ButtonUpdateOptions): Promise<void>;
  /** Hide a button without removing it */
  hide(options: { id: string }): Promise<void>;
  /** Remove a button entirely */
  remove(options: { id: string }): Promise<void>;

  /** Fires when the user taps a button */
  addListener(
    eventName: 'tapped',
    listenerFunc: (ev: { id: string }) => void
  ): Promise<PluginListenerHandle>;
}
