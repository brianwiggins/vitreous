# Vitreous: Native Liquid Glass for Ionic & Capacitor Applications

Apple's Liquid Glass design language poses a real challenge for Ionic and Capacitor developers. The effect relies on techniques that CSS cannot replicate -- it composites light from the layers physically behind the element in the native render pipeline, not a visual approximation.

Vitreous solves this by rendering true native Liquid Glass components as overlays on top of Ionic's WKWebView. You call the plugin from TypeScript or JavaScript, and when a native component fires an event it is passed back to Ionic for you to handle. No Swift required in your project.

Vitreous is a fork of [stay-liquid](https://github.com/alistairheath/stay-liquid), extended with additional components and capabilities. The tab navigation bar is the first component available, with more planned.

## Installation

Install directly from GitHub using npm:

```powershell
npm i https://github.com/brianwiggins/vitreous
```

Then sync it to your Ionic or Capacitor build:

```powershell
ionic cap sync ios
```

## Usage

In `tabs.page.ts` import `TabsBar` from vitreous. The example below uses Angular, but the same approach applies to React and Vue.

```tsx
import { Device, DeviceInfo } from '@capacitor/device';
import { TabsBar } from 'vitreous';
import { filter, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
```

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

## Color Customization

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

Invalid color values log a warning and fall back to iOS system defaults. Colors are validated on both the TypeScript and native sides.

## Image Icons

The `imageIcon` property lets you use custom images -- remote URLs or base64 data URIs -- in place of SF Symbols.

```tsx
interface ImageIcon {
  shape: 'circle' | 'square';        // icon container shape
  size:  'cover'  | 'fit' | 'stretch'; // image scaling behaviour
  image: string;                     // base64 data URI or HTTPS URL
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
// Base64 image
await TabsBar.configure({
  items: [{
    id: 'home', title: 'Home', systemIcon: 'house',
    imageIcon: { shape: 'circle', size: 'cover', image: 'data:image/png;base64,...' }
  }]
});

// Remote URL
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

## Roadmap & Contributing

Vitreous is actively extending the original stay-liquid proof-of-concept. The tab bar is the first component; more native Liquid Glass components are planned.

Feel free to report bugs, open discussions, or submit pull requests.
