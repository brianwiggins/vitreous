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

### Import

```tsx
import { Button } from 'vitreous';
```

### Show a button

This example is for a circular button.

```tsx
function frameFor(el: HTMLElement) {
  const MIN = 44;
  const rect = el.getBoundingClientRect();
  // Square frame centered on the element -- prevents a squished/ellipse appearance.
  const size = Math.max(rect.width, rect.height, MIN);
  return {
    x: rect.x + rect.width  / 2 - size / 2,
    y: rect.y + rect.height / 2 - size / 2,
    width: size,
    height: size,
  };
}

const el = document.getElementById('my-button')!;

await Button.show({
  id: 'my-button',
  systemIcon: 'plus',
  iconColor: '#007AFF',
  frame: frameFor(el)
});

// Use opacity rather than visibility to hide the web element.
// A child rule of `visibility: visible !important` can override `visibility: hidden`
// on a parent, but opacity cascades through the stacking context and cannot be overridden.
el.style.opacity = '0';
el.style.pointerEvents = 'none';
```

> Use SF Symbol names for `systemIcon`. Custom image icons are not recommended -- the Liquid Glass compositing effect heavily obscures custom imagery.

#### Unique IDs for multiple instances

If the same component is mounted more than once simultaneously (e.g. in an Ionic tab layout where multiple pages are kept alive), use a unique ID per instance to avoid conflicts:

```tsx
private static counter = 0;
private readonly buttonId = `my-button-${++MyComponent.counter}`;
```

### Listen for taps

Store the returned handle so you can clean up on destroy:

```tsx
private buttonListener?: PluginListenerHandle;

async ngOnInit() {
  this.buttonListener = await Button.addListener('tapped', ({ id }) => {
    if (id === 'my-button') {
      // handle tap
    }
  });
}

async ngOnDestroy() {
  await this.buttonListener?.remove();
}
```

### Update position

Call `update` whenever the button moves -- on scroll, layout changes, or keyboard appearance. `update` is a no-op while the button is hidden, so mid-animation coordinate changes will not cause a hidden button to flash at wrong coordinates.

```tsx
window.addEventListener('scroll', async () => {
  await Button.update({ id: 'my-button', frame: frameFor(el) });
}, { passive: true });
```

Call `update` with correct coordinates before calling `show` if you need to reposition a hidden button before making it visible again.

### Hide and remove

Restore the web element's visibility whenever the native button is hidden or removed, so the web element can serve as a fallback:

```tsx
await Button.hide({ id: 'my-button' });   // hides, keeps registered
el.style.opacity = '';
el.style.pointerEvents = '';

await Button.remove({ id: 'my-button' }); // removes entirely
el.style.opacity = '';
el.style.pointerEvents = '';
```

### Ionic page lifecycle

Ionic keeps multiple pages alive simultaneously and animates between them. If a button is managed inside a shared component used across many pages, a per-instance approach quickly becomes unworkable: multiple instances race to show, hide, and remove the same button ID, and `getBoundingClientRect()` called mid-animation returns wrong coordinates.

The recommended approach for apps with many pages is a root-scoped singleton service that owns exactly one native button for the app's lifetime.

```tsx
// glass-button.service.ts
@Injectable({ providedIn: 'root' })
export class GlassButtonService {
  private initialized = false;
  private ios26 = false;
  private cachedFrame?: ButtonFrame;
  private readonly webElements = new Set<HTMLElement>();

  constructor(private router: Router, private navCtrl: NavController) {}

  async initOnce(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const info = await Device.getInfo();
    if (info.platform !== 'ios' || !info.iOSVersion || info.iOSVersion < 260000) return;

    this.ios26 = true;

    // Hide any elements that attached before Device.getInfo() resolved.
    for (const el of this.webElements) this.hideWebEl(el);

    await new Promise<void>(r => setTimeout(r, 150)); // let layout settle

    if (!this.isHiddenRoute(this.router.url)) await this.showButton();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(async (e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        if (this.isHiddenRoute(url)) {
          await Button.hide({ id: 'my-singleton-button' }).catch(() => {});
        } else {
          await this.showButton();
        }
      });

    await Button.addListener('tapped', ({ id }) => {
      if (id === 'my-singleton-button') { /* handle tap */ }
    });

    window.addEventListener('resize', () => void this.showButton());
  }

  attach(el: HTMLElement): void {
    const wasEmpty = this.webElements.size === 0;
    this.webElements.add(el);
    if (this.ios26) {
      this.hideWebEl(el);
      if (wasEmpty && !this.isHiddenRoute(this.router.url)) void this.showButton();
    }
  }

  detach(el: HTMLElement): void {
    this.webElements.delete(el);
    this.showWebEl(el);
    if (this.ios26 && this.webElements.size === 0) {
      void Button.hide({ id: 'my-singleton-button' }).catch(() => {});
    }
  }

  private async showButton(): Promise<void> {
    const frame = this.resolveFrame();
    if (!frame) return;
    this.cachedFrame = frame;
    await Button.show({ id: 'my-singleton-button', systemIcon: 'plus', frame }).catch(() => {});
  }

  private resolveFrame(): ButtonFrame | null {
    for (const el of this.webElements) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const size = Math.max(rect.width, rect.height, 44);
        return {
          x: rect.x + rect.width  / 2 - size / 2,
          y: rect.y + rect.height / 2 - size / 2,
          width: size,
          height: size,
        };
      }
    }
    return this.cachedFrame ?? null;
  }

  private isHiddenRoute(url: string): boolean {
    return url.startsWith('/register'); // add any other pre-auth or incompatible routes
  }

  private hideWebEl(el: HTMLElement): void { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
  private showWebEl(el: HTMLElement): void { el.style.opacity = ''; el.style.pointerEvents = ''; }
}
```

Each page component then just calls `attach`/`detach`:

```tsx
export class MyPageComponent implements AfterViewInit, OnDestroy {
  private el: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private glassButton: GlassButtonService,
  ) {}

  ngAfterViewInit() {
    this.el = this.elementRef.nativeElement.querySelector('.my-button');
    if (this.el) this.glassButton.attach(this.el);
    void this.glassButton.initOnce();
  }

  ngOnDestroy() {
    if (this.el) this.glassButton.detach(this.el);
  }
}
```

Key properties of this pattern:

- `Button.show` is called with settled coordinates -- never mid-animation
- `Button.update` is never needed (the button re-shows with fresh coordinates on each navigation)
- The button hides automatically when no pages with the component are active
- Route-based filtering keeps the button off pre-auth and incompatible pages
- `isHiddenRoute` is the single place to add new exclusions

### API reference

```tsx
interface ButtonOptions {
  id: string;           // unique identifier
  label?: string;       // button text
  systemIcon?: string;  // SF Symbol name (e.g. 'plus', 'heart.fill')
  iconColor?: string;   // SF Symbol tint color (hex or RGBA); falls back to system default
  frame: {
    x: number;          // CSS pixels from getBoundingClientRect
    y: number;
    width: number;
    height: number;     // pass equal width and height for a circular button
  };
}
```

**Supported color formats:** `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `rgba(r,g,b,a)`, `rgb(r,g,b)`. Invalid values fall back silently to the iOS system default tint.

> iOS 26+ uses `UIGlassEffect` for the authentic Liquid Glass appearance. On older iOS versions the button falls back to a `UIBlurEffect` background.

---

## Roadmap & Contributing

Vitreous is actively extending the original stay-liquid proof-of-concept. More native Liquid Glass components are planned.

Feel free to report bugs, open discussions, or submit pull requests.
