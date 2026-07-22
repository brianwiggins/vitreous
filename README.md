# Vitreous: Native Liquid Glass for Ionic & Capacitor Applications

Apple's Liquid Glass design language poses a real challenge for Ionic and Capacitor developers. The effect relies on techniques that CSS cannot replicate -- it composites light from the layers physically behind the element in the native render pipeline, not a visual approximation.

Vitreous solves this by rendering true native Liquid Glass components as overlays on top of Ionic's WKWebView. You call the plugin from TypeScript or JavaScript, and when a native component fires an event it is passed back to Ionic for you to handle. No Swift required in your project.

Vitreous is a fork of [stay-liquid](https://github.com/alistairheath/stay-liquid), extended with additional components and capabilities. The tab navigation bar and native buttons are currently available, with more planned.

## Installation

Install directly from GitHub using npm:

```powershell
npm i https://github.com/brianwiggins/vitreous
```

Then sync it to your Ionic or Capacitor build:

```powershell
ionic cap sync ios
```

---

## Tab Bar

### Import

```tsx
import type { PluginListenerHandle } from '@capacitor/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { TabsBar } from 'vitreous';
import { filter, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
```

### Setup

Add `ionViewDidEnter()` and `ionViewWillLeave()` to manage the native tab bar on iOS 26+:

```tsx
private routerSub?: Subscription;
private nativeTabSub?: PluginListenerHandle;
private useNativeTabs = false;

async ionViewDidEnter() {
  const deviceInfo: DeviceInfo = await Device.getInfo();
  if (deviceInfo.platform !== 'ios') return;
  if (!deviceInfo.iOSVersion || deviceInfo.iOSVersion < 260000) return;

  this.useNativeTabs = true;

  await TabsBar.configure({
    visible: true,
    initialId: 'home',
    items: [
      { id: 'home',     title: 'Home',     systemIcon: 'house'     },
      { id: 'new',      title: 'New',      systemIcon: 'sparkles'  },
      { id: 'calendar', title: 'Calendar', systemIcon: 'calendar'  },
      { id: 'data',     title: 'Data',     systemIcon: 'chart.bar' },
      { id: 'settings', title: 'Settings', systemIcon: 'gear'      },
    ],
    selectedIconColor: '#007AFF',
    unselectedIconColor: '#8E8E93'
  });

  // Native -> JS (user taps native tab)
  this.nativeTabSub = await TabsBar.addListener('selected', ({ id }: { id: string }) => {
    this.router.navigateByUrl(`/tabs/${id}`);
  });

  // JS -> Native (keep native highlight in sync with route)
  this.routerSub = this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      const id = this.routeToTabId(this.router.url);
      if (id) TabsBar.select({ id });
    });
}

async ionViewWillLeave() {
  this.routerSub?.unsubscribe();
  await this.nativeTabSub?.remove();
  if (this.useNativeTabs) {
    // Hide the native bar when leaving the authenticated zone (e.g. logout).
    // ionViewDidEnter will re-show it with visible: true when the user returns.
    await TabsBar.configure({
      visible: false,
      initialId: 'home',
      items: [
        { id: 'home',     title: 'Home',     systemIcon: 'house'     },
        { id: 'new',      title: 'New',      systemIcon: 'sparkles'  },
        { id: 'calendar', title: 'Calendar', systemIcon: 'calendar'  },
        { id: 'data',     title: 'Data',     systemIcon: 'chart.bar' },
        { id: 'settings', title: 'Settings', systemIcon: 'gear'      },
      ],
    });
  }
}

private routeToTabId(url: string): string | null {
  if (url.startsWith('/tabs/home'))     return 'home';
  if (url.startsWith('/tabs/new'))      return 'new';
  if (url.startsWith('/tabs/calendar')) return 'calendar';
  if (url.startsWith('/tabs/data'))     return 'data';
  if (url.startsWith('/tabs/settings')) return 'settings';
  return null;
}
```

> You will need to build and run with iOS 26+ from Xcode for the native tab bar to be visible.

If you use Ionic tabs for other platforms, hide them on iOS 26+ using the `useNativeTabs` flag:

```html
<ion-tabs [class.hidden]="useNativeTabs">
  <!-- tabs content -->
</ion-tabs>
```

### Color Customization

Specify custom colors for selected and unselected tab icon states using hex or RGBA formats.

**Supported formats**
- Hex: `#FF5733`, `#F57` (3-digit shorthand), `#FF5733FF` (with alpha)
- RGBA: `rgba(255, 87, 51, 1.0)`, `rgb(255, 87, 51)`

```tsx
await TabsBar.configure({
  items: [...],
  selectedIconColor: '#007AFF',
  unselectedIconColor: 'rgba(142, 142, 147, 0.6)',
});
```

Invalid color values log a warning and fall back to iOS system defaults.

### Image Icons

The `imageIcon` property lets you use custom images -- remote URLs or base64 data URIs -- in place of SF Symbols.

```tsx
interface ImageIcon {
  shape: 'circle' | 'square';          // icon container shape
  size:  'cover'  | 'fit' | 'stretch'; // image scaling behaviour
  image: string;                       // base64 data URI or HTTPS URL
  ring?: {
    enabled: boolean;
    width?: number; // ring width in points, default 2.0
  };
}
```

| Property | Value     | Description                                  |
|----------|-----------|----------------------------------------------|
| `shape`  | `circle`  | Circular container                           |
| `shape`  | `square`  | Square container                             |
| `size`   | `cover`   | Aspect fill -- crops to fill container       |
| `size`   | `fit`     | Aspect fit -- scales to fit within container |
| `size`   | `stretch` | Stretches to fill exactly (may distort)      |

```tsx
await TabsBar.configure({
  items: [{
    id: 'profile', title: 'Profile', systemIcon: 'person',
    imageIcon: { shape: 'circle', size: 'fit', image: 'https://example.com/avatar.png' }
  }]
});
```

**Supported formats:** PNG, JPEG, SVG, WebP. Remote images must use HTTPS and be under 5 MB.

**Fallback chain:** `imageIcon` -> `systemIcon` (SF Symbol) -> `image` (bundled asset) -> empty placeholder

Remote images are cached for 24 hours. Loading is asynchronous -- the `systemIcon` fallback displays until the image is ready.

---


## Buttons

`Button` renders a native Liquid Glass button on top of the WKWebView at coordinates you provide. Only buttons you explicitly register are affected -- nothing in your project changes automatically.

> iOS 26+ uses `UIGlassEffect` for the authentic Liquid Glass appearance. On older iOS versions the button falls back to a `UIBlurEffect` background.

### Import

```tsx
import { Button, frameFromElement } from 'vitreous';
import type { PluginListenerHandle } from '@capacitor/core';
```

### Show a button

Pass coordinates explicitly, or let the plugin derive them from a DOM element:

```tsx
// From a DOM element (recommended)
const el = document.getElementById('my-button')!;
await Button.show({
  id: 'my-button',
  element: el,
  minSize: 44,          // minimum size in CSS px (default: 44)
  systemIcon: 'plus',
  iconColor: '#007AFF',
});

// Or with an explicit frame
await Button.show({
  id: 'my-button',
  frame: { x: 20, y: 60, width: 44, height: 44 },
  systemIcon: 'plus',
  iconColor: '#007AFF',
});

// Hide the underlying web element so only the native button is visible
el.style.visibility = 'hidden';
```

The button shape follows the frame. A square frame produces a circle; a wider frame (e.g. 140x44) produces a pill.

### Listen for taps

Store the returned handle so you can clean up on destroy:

```tsx
private tapHandle?: PluginListenerHandle;

async ngOnInit() {
  this.tapHandle = await Button.addListener('tapped', ({ id }) => {
    if (id === 'my-button') { /* handle tap */ }
  });
}

async ngOnDestroy() {
  await this.tapHandle?.remove();
}
```

### Update

All fields except `id` are optional. Omit `frame` to update only visual properties without moving the button:

```tsx
// Icon only -- button stays in place
await Button.update({ id: 'my-button', systemIcon: 'xmark' });

// Re-position from element
await Button.update({ id: 'my-button', element: el });

// Full update
await Button.update({ id: 'my-button', systemIcon: 'plus', frame: newFrame });
```

`update` is a no-op while the button is hidden. Call `update` with correct coordinates before `show` if you need to reposition a hidden button before making it visible again.

### Hide and remove

```tsx
await Button.hide({ id: 'my-button' });   // hides, keeps registered
await Button.remove({ id: 'my-button' }); // removes entirely
```

Calling `show` on a hidden button re-shows it with the provided frame and options.

### frameFromElement utility

`frameFromElement` computes a `ButtonFrame` from a DOM element. Useful when you need to cache the frame or compute it manually:

```tsx
import { frameFromElement } from 'vitreous';

const frame = frameFromElement(el, 44); // el: Element, minSize: number (default 44)
await Button.show({ id: 'my-button', frame, systemIcon: 'plus' });
```

The frame is centered over the element. `minSize` applies independently to width and height, so a pill element stays pill-shaped.

### API reference

```tsx
interface ButtonOptions {
  id: string;
  label?: string;
  systemIcon?: string;  // SF Symbol name (e.g. 'plus', 'heart.fill')
  iconColor?: string;   // hex or RGBA; falls back to system default
  frame?: ButtonFrame;  // provide frame or element
  element?: Element;    // derive frame from this element
  minSize?: number;     // minimum size when deriving from element (default: 44)
}

interface ButtonUpdateOptions {
  id: string;
  label?: string;
  systemIcon?: string;
  iconColor?: string;
  frame?: ButtonFrame;  // omit to keep current position
  element?: Element;
  minSize?: number;
}

interface ButtonFrame {
  x: number;      // CSS pixels
  y: number;
  width: number;
  height: number;
}
```

---

## Roadmap & Contributing

Vitreous is actively extending the original stay-liquid proof-of-concept. More native Liquid Glass components are planned.

Feel free to report bugs, open discussions, or submit pull requests.
