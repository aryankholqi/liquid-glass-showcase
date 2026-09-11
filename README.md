# liquid-glass-showcase

> A React take on **Liquid Glass**, the translucent material Apple introduced in iOS 26 — real refraction, chromatic dispersion, and specular light, rendered on the web.

Add the component to your project shadcn style: the code is copied into your codebase, so you own it, can read it, and can change it. Nothing is added to your `dependencies` except the two tiny utilities the component itself imports.

```bash
npx liquid-glass-cli add liquid-glass
```

## What it does

Running `add liquid-glass` will:

- Write `components/ui/liquid-glass.tsx` (or `src/components/ui/...` when your project has a `src` directory)
- Write `lib/utils.ts` with the `cn` helper, if it isn't there already
- Install `clsx` and `tailwind-merge`

Existing files are never overwritten silently — pass `--overwrite` when you want to replace them.

## Requirements

- Node.js 18 or newer
- A React project with Tailwind CSS
- A `@/*` path alias pointing at your source root (the component imports `@/lib/utils`)

## Commands

| Command | Description |
|---|---|
| `add <component>` | Add a component to your project |
| `list` | List every component available in the registry |

### Options for `add`

| Option | Description |
|---|---|
| `--overwrite` | Replace files that already exist |
| `--skip-install` | Don't install npm dependencies automatically |

## The component

`<LiquidGlass>` wraps any content in a real refracting glass surface. The panel's outline is a superellipse — the continuous-curvature squircle Apple uses — and one shape definition drives everything: the silhouette, the rim stroke, the displacement map, and the browser's own `corner-shape`.

The map is rasterized per pixel from the shape's signed distance field, so every point in the edge band stores the *outward normal* of the outline scaled by how hard a ray bends there. That means the backdrop is pulled around the corners along the true surface direction rather than along the x and y axes. The bend itself follows a bevel modelled as a quarter-round of glass: Snell's law over the tilt gives a deviation that climbs steeply through the last few pixels before the rim, which is what reads as liquid. Each color channel is displaced by a slightly different amount for chromatic dispersion, and a frosted tint, a conic specular ring, and a crisp rim stroke sit on top. Everything is rebuilt through a `ResizeObserver`, so the effect stays correct at any size.

```tsx
import { LiquidGlass } from "@/components/ui/liquid-glass";

export function Card() {
  return (
    <LiquidGlass cornerRadius={24} tint="rgba(17, 21, 27, 0.6)" className="p-6">
      <h2 className="text-white">Liquid Glass</h2>
    </LiquidGlass>
  );
}
```

### Props

All standard `div` props are supported, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `tint` | `string` | `"rgba(17, 21, 27, 0.8)"` | Fill color layered over the refracted backdrop. Any CSS color. |
| `opacity` | `number` | `100` | Opacity of the tint alone (0–100). Scales the color's own alpha; frost and refraction are unaffected. |
| `cornerRadius` | `number` | `48` | Corner radius in pixels. |
| `cornerSmoothing` | `number` | `32` | Continuity of the corner curve. `0` is a plain circular arc, `100` the squircle Apple draws — identical to CSS `corner-shape: squircle`. |
| `refraction` | `number` | `100` | How strongly the backdrop bends at the edges (0–100). |
| `depth` | `number` | `85` | Thickness of the refracting edge band — the perceived glass depth (0–100). |
| `dispersion` | `number` | `100` | Chromatic aberration: how far the red and blue channels split (0–100). |
| `frost` | `number` | `3` | Backdrop blur in pixels. |
| `splay` | `number` | `38` | How far the bend spreads inward from the rim. `0` is a crisp lens, `100` a wide swell. |
| `lightAngle` | `number` | `45` | Direction the specular highlight comes from, in degrees. |
| `lightIntensity` | `number` | `38` | Strength of the specular ring and the rim stroke (0–100). |
| `borderWidth` | `number` | `1` | Width of the inside rim stroke. Use `0` to drop the stroke layer and draw your own border. |
| `elevation` | `number` | `22` | Height of the drop shadow cast behind the panel (0–100). `0` removes it. |
| `layerClassName` | `string` | — | Applied to each effect layer instead of the container — use it to mask the glass. |

> **Tuning the edge:** `depth` and `splay` are the two that decide whether the panel reads as glass or as a fisheye. Keep `depth` around 45–65 so the centre stays flat and the bend is confined to a rim, and keep `splay` low (0–35) so the compression concentrates in the last few pixels the way Apple's does. Pushing `depth` to 100 turns the whole panel into one lens.

> **Masking:** apply masks through `layerClassName`, not on the container. Anything that forms a backdrop root on the container (`isolation`, `filter`, `opacity`, `mask`, `contain: paint`) makes the layers sample an empty backdrop and blanks the effect out.

### Browser support

Chromium renders the full effect. Firefox and Safari treat `backdrop-filter: url()` as invalid, so the refraction layer stays inert there and the squircle silhouette, frost, tint, specular ring, and rim stroke carry the look on their own — it degrades gracefully rather than breaking.

The corner is shaped twice over, because a `backdrop-filter` is clipped by its own box rather than by whatever clips the rest of the element:

- **Chromium 139+** ships `corner-shape`, so the component hands the browser `corner-shape: superellipse(k)` for the same *k* `cornerSmoothing` feeds its own geometry. One curve then shapes every layer, its shadows, and its filtered backdrop at once.
- **Everywhere else** the superellipse is drawn as a path. `clip-path` shapes the layers, and the two filtered layers additionally carry a fill `mask-image` of that same path — the one clip WebKit applies to a backdrop. Without it the frost stays a rectangle and the panel reads square-cornered on Safari and iOS however smooth its outline is.
- **Shadows** are formed by a radius, never clipped by a path, so the fallback hands them the circular radius whose arc crosses the superellipse's own diagonal point. It hugs the squircle instead of pinching inside it, which keeps the bevel lit all the way into the corner.

## Author

**Aryan Kholghi**

- GitHub — [@aryankholqi](https://github.com/aryankholqi)
- LinkedIn — [aryan-kholqi](https://linkedin.com/in/aryan-kholqi-261480260)

## License

MIT © Aryan Kholghi

This project is an independent, unaffiliated reinterpretation of the Liquid Glass design language for the web. Apple and iOS are trademarks of Apple Inc.
