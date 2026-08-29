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

`<LiquidGlass>` wraps any content in a real refracting glass surface: an SVG displacement filter bends the backdrop at the edges, each color channel is displaced by a slightly different amount to produce chromatic dispersion, and a frosted tint plus a light-angled gradient stroke sit on top. The displacement map is rebuilt through a `ResizeObserver`, so the effect stays correct at any size.

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
| `cornerRadius` | `number` | `0` | Corner radius in pixels. |
| `refraction` | `number` | `100` | How strongly the backdrop bends at the edges (0–100). |
| `depth` | `number` | `100` | Thickness of the refracting edge band — the perceived glass depth (0–100). |
| `dispersion` | `number` | `100` | Chromatic aberration: how far the red and blue channels split (0–100). |
| `frost` | `number` | `7` | Backdrop blur in pixels. |
| `splay` | `number` | `40` | How softly the refracting band fades into the flat center (0–100). |
| `lightAngle` | `number` | `-35` | Direction the specular highlight comes from, in degrees. |
| `lightIntensity` | `number` | `50` | Strength of the highlight and the gradient stroke (0–100). |
| `borderWidth` | `number` | `1` | Width of the inside gradient stroke. Use `0` to drop the stroke layer and draw your own border. |
| `layerClassName` | `string` | — | Applied to each effect layer instead of the container — use it to mask the glass. |

> **Masking:** apply masks through `layerClassName`, not on the container. Anything that forms a backdrop root on the container (`isolation`, `filter`, `opacity`, `mask`, `contain: paint`) makes the layers sample an empty backdrop and blanks the effect out.

### Browser support

Chromium renders the full effect. Firefox and Safari treat `backdrop-filter: url()` as invalid, so the refraction layer stays inert there and the frost, tint, and gradient stroke carry the look on their own — it degrades gracefully rather than breaking.

## Author

**Aryan Kholghi**

- GitHub — [@aryankholqi](https://github.com/aryankholqi)
- LinkedIn — [aryan-kholqi](https://linkedin.com/in/aryan-kholqi-261480260)

## License

MIT © Aryan Kholghi

This project is an independent, unaffiliated reinterpretation of the Liquid Glass design language for the web. Apple and iOS are trademarks of Apple Inc.
