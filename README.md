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

## Tab Bar

### Import

```tsx
import { Device, DeviceInfo } from '@capacitor/device';
import { TabsBar } from 'vitreous';
import { filter, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
```

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

## Tab Bar

### Import

```tsx
import { Device, DeviceInfo } from '@capacitor/device';
import { TabsBar } from 'vitreous';
import { filter, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
```

### Setup

Add an `ionViewDidEnter()` method that initialises the native tab bar when running on iOS 26+:

```tsx
private sub?: Subscription;
private useNativeTabs: boolean = false;

async ionViewDidEnter() {
  const deviceInfo: DeviceInfo = await Device.getInfo();
  if (deviceInfo.platform !== 'ios') return; // keep Ionic tabs on web/Android
  if (deviceInfo.iOSVersion && deviceInfo.iOSVersion >= 260000) {
    this.useNativeTabs = true;
  } else {
    return;
  }

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
  await TabsBar.addListener('selected', ({ id }: { id: string }) => {
    this.router.navigateByUrl(`/tabs/${id}`);
  });

  // JS -> Native (keep native highlight in sync with route)
  this.sub = this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      const id = this.routeToTabId(this.router.url);
      if (id) TabsBar.select({ id });
    });
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

## Buttons

`Button` renders a native Liquid Glass button on top of the WKWebView at coordinates you provide. Only buttons you explicitly register are affected -- nothing in your project changes automatically.

### Import

```tsx
import { Button } from 'vitreous';
```

### Show a button

Pass the element's bounding rect directly from the DOM:

```tsx
const el = document.getElementById('my-button');
const rect = el.getBoundingClientRect();

await Button.show({
  id: 'my-button',
  label: 'Add',
  systemIcon: 'plus',
  frame: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
});

// Hide the underlying web button so only the native one is visible
el.style.visibility = 'hidden';
```

### Listen for taps

```tsx
await Button.addListener('tapped', ({ id }) => {
  if (id === 'my-button') {
    // handle tap
  }
});
```

### Update position

Call `update` whenever the button moves -- on scroll, layout changes, or keyboard appearance:

```tsx
window.addEventListener('scroll', async () => {
  const rect = el.getBoundingClientRect();
  await Button.update({
    id: 'my-button',
    frame: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  });
});
```

### Hide and remove

```tsx
await Button.hide({ id: 'my-button' });   // hides, keeps registered
await Button.remove({ id: 'my-button' }); // removes entirely
```

### API reference

```tsx
interface ButtonOptions {
  id: string;           // unique identifier
  label?: string;       // button text
  systemIcon?: string;  // SF Symbol name (e.g. 'plus', 'heart.fill')
  frame: {
    x: number;          // CSS pixels from getBoundingClientRect
    y: number;
    width: number;
    height: number;
  };
}
```

> iOS 26+ uses `UIGlassEffect` for the authentic Liquid Glass appearance. On older iOS versions the button falls back to a `UIBlurEffect` background.

## Roadmap & Contributing

Vitreous is actively extending the original stay-liquid proof-of-concept. More native Liquid Glass components are planned.

Feel free to report bugs, open discussions, or submit pull requests.


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

## Buttons

`Button` renders a native Liquid Glass button on top of the WKWebView at coordinates you provide. Only buttons you explicitly register are affected -- nothing in your project changes automatically.

### Import

```tsx
import { Button } from 'vitreous';
```

### Show a button

Enforce a minimum 44×44pt frame (the iOS HIG minimum touch target) centered on the element. Passing a smaller frame produces a visually squeezed button with an off-center icon.

```tsx
function frameFor(el: HTMLElement) {
  const MIN = 44;
  const rect = el.getBoundingClientRect();
  const w = Math.max(rect.width, MIN);
  const h = Math.max(rect.height, MIN);
  return {
    x: rect.x - (w - rect.width) / 2,
    y: rect.y - (h - rect.height) / 2,
    width: w,
    height: h,
  };
}

const el = document.getElementById('my-button')!;

await Button.show({
  id: 'my-button',
  systemIcon: 'plus',
  iconColor: '#007AFF', // optional SF Symbol tint color
  frame: frameFor(el)
});

// Hide the underlying web button so only the native one is visible
el.style.visibility = 'hidden';
```

> Use SF Symbol names for `systemIcon`. Custom image icons are not recommended -- the Liquid Glass compositing effect heavily obscures custom imagery.

#### Unique IDs for multiple instances

If the same component is mounted more than once simultaneously (e.g. in an Ionic tab layout where multiple pages are kept alive), use a unique ID per instance to avoid conflicts:

```tsx
private static counter = 0;
private readonly buttonId = `my-button-${++MyComponent.counter}`;
```

### Listen for taps

Store the returned handle so you can remove the listener on cleanup:

```tsx
private tapListener?: PluginListenerHandle;

this.tapListener = await Button.addListener('tapped', ({ id }) => {
  if (id === 'my-button') {
    // handle tap
  }
});
```

### Update position

Call `update` whenever the button moves -- on scroll, layout changes, or keyboard appearance:

```tsx
window.addEventListener('scroll', async () => {
  const rect = el.getBoundingClientRect();
  await Button.update({
    id: 'my-button',
    frame: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  });
});
```

### Hide and remove

Always restore `el.style.visibility` when hiding or removing the native button, so the web element can serve as a fallback:

```tsx
await Button.hide({ id: 'my-button' });   // hides, keeps registered
el.style.visibility = 'visible';

await Button.remove({ id: 'my-button' }); // removes entirely
el.style.visibility = 'visible';
```

### Ionic page lifecycle

Ionic keeps multiple pages alive simultaneously and animates between them. The native button overlay does not participate in these animations, so you must hide it when your page leaves and re-show it when it returns. Read the coordinates **after** the animation has settled, not mid-transition.

```tsx
private intersectionObserver?: IntersectionObserver;
private navSub?: Subscription;

async ngAfterViewInit() {
  // ... show button and hide web element as above ...

  // Hide immediately when the page leaves the viewport (tab switch, forward nav)
  this.intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        void Button.hide({ id: this.buttonId }).catch(() => {});
        el.style.visibility = 'visible';
      }
    }
  }, { threshold: 0 });
  this.intersectionObserver.observe(el);

  // Re-show after navigation settles (~400 ms covers Ionic's default transition)
  this.navSub = this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      setTimeout(async () => {
        if (!isOnScreen(el)) return; // skip inactive tab instances
        try {
          await Button.show({ id: this.buttonId, systemIcon: 'plus', frame: frameFor(el) });
          el.style.visibility = 'hidden';
        } catch {
          el.style.visibility = 'visible'; // fallback if show fails
        }
      }, 400);
    });
}

function isOnScreen(el: HTMLElement): boolean {
  if (el.offsetParent === null) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.x + rect.width > 0 && rect.x < window.innerWidth &&
    rect.y + rect.height > 0 && rect.y < window.innerHeight
  );
}

async ngOnDestroy() {
  this.navSub?.unsubscribe();
  this.intersectionObserver?.disconnect();
  await this.tapListener?.remove();
  await Button.remove({ id: this.buttonId }).catch(() => {});
  el.style.visibility = 'visible';
}
```

### API reference

```tsx
interface ButtonOptions {
  id: string;           // unique identifier
  label?: string;       // button text
  systemIcon?: string;  // SF Symbol name (e.g. 'plus', 'heart.fill')
  iconColor?: string;   // SF Symbol tint color (hex or rgba)
  frame: {
    x: number;          // CSS pixels from getBoundingClientRect
    y: number;
    width: number;
    height: number;     // minimum 44×44 recommended
  };
}
```

> iOS 26+ uses `UIGlassEffect` for the authentic Liquid Glass appearance. On older iOS versions the button falls back to a `UIBlurEffect` background.

## Roadmap & Contributing

Vitreous is actively extending the original stay-liquid proof-of-concept. More native Liquid Glass components are planned.

Feel free to report bugs, open discussions, or submit pull requests.
