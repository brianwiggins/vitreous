import type { PluginListenerHandle } from '@capacitor/core';

export interface ButtonFrame {
  /** X position in CSS pixels (from getBoundingClientRect) */
  x: number;
  /** Y position in CSS pixels (from getBoundingClientRect) */
  y: number;
  width: number;
  height: number;
}

export interface ButtonOptions {
  /** Unique identifier for this button */
  id: string;
  /** Text label displayed inside the button */
  label?: string;
  /** SF Symbol name (e.g. 'plus', 'heart.fill') */
  systemIcon?: string;
  /** Position and size in CSS pixels */
  frame: ButtonFrame;
}

export interface ButtonPlugin {
  /** Create and show a new liquid glass button */
  show(options: ButtonOptions): Promise<void>;
  /** Update the frame, label, or icon of an existing button */
  update(options: ButtonOptions): Promise<void>;
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
