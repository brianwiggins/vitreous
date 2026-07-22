import { PluginListenerHandle } from '@capacitor/core';

type BadgeValue = number | "dot" | null;
/** Shape options for image icon containers */
type ImageIconShape = "circle" | "square";
/** Size behavior options for image scaling */
type ImageIconSize = "cover" | "stretch" | "fit";
/** Ring configuration for selected image icons */
interface ImageIconRing {
    /** Whether to show ring around the image */
    enabled: boolean;
    /** Width of the ring in pixels (default: 2.0) */
    width?: number;
}
/** Image icon configuration object */
interface ImageIcon {
    /** Shape of the icon container */
    shape: ImageIconShape;
    /** Image scaling behavior */
    size: ImageIconSize;
    /** Image source - either base64 data URI or HTTP/HTTPS URL */
    image: string;
    /** Optional ring configuration for selected and unselected states */
    ring?: ImageIconRing;
}
interface TabItem {
    /** Unique id you use in your router (e.g., 'home') */
    id: string;
    /** Title shown under the icon (optional if you want icon-only) */
    title?: string;
    /** SF Symbol name (e.g., 'house', 'sparkles') - compulsory fallback when imageIcon fails */
    systemIcon: string;
    /** Or provide an asset name bundled on iOS (selected/unselected are tinted by system) */
    image?: string;
    /** Optional enhanced image icon with shape, size, and remote/base64 support */
    imageIcon?: ImageIcon;
    /** Optional badge number or 'dot' */
    badge?: BadgeValue;
}
interface TabsBarConfigureOptions {
    items: TabItem[];
    /** Which tab is selected initially */
    initialId?: string;
    /** Show immediately (default true) */
    visible?: boolean;
    /** Color for the selected tab icon (hex or RGBA format) */
    selectedIconColor?: string;
    /** Color for unselected tab icons (hex or RGBA format) */
    unselectedIconColor?: string;
}
interface SelectOptions {
    id: string;
}
interface SetBadgeOptions {
    id: string;
    value: BadgeValue;
}
interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
interface TabsBarPlugin {
    configure(options: TabsBarConfigureOptions): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    select(options: SelectOptions): Promise<void>;
    setBadge(options: SetBadgeOptions): Promise<void>;
    getSafeAreaInsets(): Promise<SafeAreaInsets>;
    /** Fires when user taps a tab */
    addListener(eventName: "selected", listenerFunc: (ev: {
        id: string;
    }) => void): Promise<PluginListenerHandle>;
}

/** Named export for the TabsBar plugin within the larger library */
declare const TabsBar: TabsBarPlugin;

interface ButtonFrame {
    /** X position in CSS pixels (from getBoundingClientRect) */
    x: number;
    /** Y position in CSS pixels (from getBoundingClientRect) */
    y: number;
    width: number;
    height: number;
}
interface ButtonOptions {
    /** Unique identifier for this button */
    id: string;
    /** Text label displayed inside the button */
    label?: string;
    /** SF Symbol name (e.g. 'plus', 'heart.fill') */
    systemIcon?: string;
    /** Tint color for the SF Symbol icon (hex or RGBA format) */
    iconColor?: string;
    /** Position and size in CSS pixels. Provide either frame or element. */
    frame?: ButtonFrame;
    /** DOM element to center the button over. Provide either frame or element. */
    element?: Element;
    /** Minimum button size in CSS pixels when deriving frame from element (default: 44) */
    minSize?: number;
}
/** Options for update() -- all fields except id are optional */
interface ButtonUpdateOptions {
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
}
interface ButtonPlugin {
    /** Create and show a new liquid glass button */
    show(options: ButtonOptions): Promise<void>;
    /** Update an existing button. All fields except id are optional;
     *  omit frame to update only visual properties without moving the button */
    update(options: ButtonUpdateOptions): Promise<void>;
    /** Hide a button without removing it */
    hide(options: {
        id: string;
    }): Promise<void>;
    /** Remove a button entirely */
    remove(options: {
        id: string;
    }): Promise<void>;
    /** Fires when the user taps a button */
    addListener(eventName: 'tapped', listenerFunc: (ev: {
        id: string;
    }) => void): Promise<PluginListenerHandle>;
}

/**
 * Derives a ButtonFrame from a DOM element.
 * Preserves the element's aspect ratio (pill, square, etc.).
 * minSize applies independently to width and height.
 */
declare function frameFromElement(el: Element, minSize?: number): ButtonFrame;
declare const Button: ButtonPlugin;

export { type BadgeValue, Button, type ButtonFrame, type ButtonOptions, type ButtonPlugin, type ButtonUpdateOptions, type SafeAreaInsets, type SelectOptions, type SetBadgeOptions, type TabItem, TabsBar, type TabsBarConfigureOptions, type TabsBarPlugin, frameFromElement };
