import type { LiquidGlassProps } from "@/components/liquid-glass";

export type GlassConfig = Required<
  Pick<
    LiquidGlassProps,
    | "tint"
    | "opacity"
    | "cornerRadius"
    | "cornerSmoothing"
    | "refraction"
    | "depth"
    | "dispersion"
    | "frost"
    | "splay"
    | "lightAngle"
    | "lightIntensity"
    | "borderWidth"
    | "elevation"
  >
> & { layerClassName: string };

/** Playground starting point. */
export const PLAYGROUND_DEFAULTS: GlassConfig = {
  tint: "rgba(145, 132, 217, 0.18)",
  opacity: 100,
  cornerRadius: 48,
  cornerSmoothing: 32,
  refraction: 100,
  depth: 85,
  dispersion: 100,
  frost: 3,
  splay: 38,
  lightAngle: 45,
  lightIntensity: 38,
  borderWidth: 1,
  elevation: 22,
  layerClassName: "",
};

export const HERO_CONFIG: GlassConfig = {
  tint: "rgba(145, 132, 217, 0.18)",
  opacity: 100,
  cornerRadius: 32,
  cornerSmoothing: 100,
  refraction: 100,
  depth: 60,
  dispersion: 70,
  frost: 7,
  splay: 30,
  lightAngle: 70,
  lightIntensity: 60,
  borderWidth: 1,
  elevation: 22,
  layerClassName: "",
};

export type SliderSpec = {
  key: keyof Omit<GlassConfig, "tint" | "layerClassName">;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export const SLIDERS: SliderSpec[] = [
  { key: "opacity", min: 0, max: 100, step: 1, unit: "%" },
  { key: "cornerRadius", min: 0, max: 64, step: 1, unit: "px" },
  { key: "cornerSmoothing", min: 0, max: 100, step: 1, unit: "" },
  { key: "refraction", min: 0, max: 100, step: 1, unit: "" },
  { key: "depth", min: 0, max: 100, step: 1, unit: "" },
  { key: "dispersion", min: 0, max: 100, step: 1, unit: "" },
  { key: "frost", min: 0, max: 24, step: 1, unit: "px" },
  { key: "splay", min: 0, max: 100, step: 1, unit: "" },
  { key: "lightAngle", min: -180, max: 180, step: 1, unit: "\u00b0" },
  { key: "lightIntensity", min: 0, max: 100, step: 1, unit: "" },
  { key: "borderWidth", min: 0, max: 4, step: 1, unit: "px" },
  { key: "elevation", min: 0, max: 60, step: 1, unit: "" },
];

export const TINTS: { name: string; value: string }[] = [
  { name: "Blurple", value: "rgba(145, 132, 217, 0.28)" },
  { name: "Frost", value: "rgba(233, 233, 237, 0.14)" },
  { name: "Slate", value: "rgba(117, 121, 140, 0.32)" },
];

/** `#RGB`, `#RRGGBB` or `#RRGGBBAA`, case-insensitive. */
export const isHexColor = (v: string): boolean =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);

/** Force a leading `#`, drop anything that is not a hex digit, clamp to 8
 *  digits and lowercase — what the custom-tint field accepts as it is typed. */
export const normalizeHex = (raw: string): string =>
  "#" + raw.replace(/[^0-9a-f]/gi, "").slice(0, 8).toLowerCase();

/** Best-effort CSS colour → hex, so a preset `rgba(...)` tint can be shown in
 *  the custom field. Hex passes through; `rgb()/rgba()` becomes `#rrggbb` plus
 *  an alpha byte when it is not fully opaque; anything else is returned as-is. */
export const colorToHex = (color: string): string => {
  const v = color.trim();
  if (isHexColor(v)) return v.toLowerCase();
  const m = v.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i,
  );
  if (!m) return v;
  const byte = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  const a = m[4] === undefined ? 1 : Number(m[4]);
  return "#" + byte(+m[1]) + byte(+m[2]) + byte(+m[3]) + (a < 1 ? byte(a * 255) : "");
};

/** Hue in degrees (0–360); saturation, value and alpha as 0–1. */
export type Hsva = { h: number; s: number; v: number; a: number };

/** `#RGB/#RRGGBB(AA)` → HSVA, or `null` when the string is not a hex colour. */
export const hexToHsva = (hex: string): Hsva | null => {
  if (!isHexColor(hex)) return null;
  let d = hex.slice(1);
  if (d.length === 3) d = d.replace(/./g, "$&$&");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(d.slice(i, i + 2), 16) / 255);
  const a = d.length === 8 ? parseInt(d.slice(6, 8), 16) / 255 : 1;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta) {
    if (max === r) h = (g - b) / delta;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? delta / max : 0, v: max, a };
};

/** HSVA → `#rrggbb`, plus an alpha byte when the colour is not fully opaque. */
export const hsvaToHex = ({ h, s, v, a }: Hsva): string => {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const byte = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  const alpha = byte(a);
  return "#" + byte(channel(5)) + byte(channel(3)) + byte(channel(1)) + (alpha === "ff" ? "" : alpha);
};

export const INSTALL_COMMAND = "npx liquid-glass-cli add liquid-glass";

export const PROP_ROWS: {
  name: string;
  type: string;
  def: string;
  desc: string;
}[] = [
  {
    name: "tint",
    type: "string",
    def: "rgba(17, 21, 27, 0.8)",
    desc: "Fill layered on top of the refracted backdrop. Any CSS colour — hex, rgb, hsl, oklch or a CSS variable.",
  },
  {
    name: "opacity",
    type: "number",
    def: "100",
    desc: "Opacity of the tint alone, 0–100. Scales the colour's own alpha, so the frost and refraction underneath stay as they are.",
  },
  { name: "cornerRadius", type: "number", def: "48", desc: "Corner radius in pixels." },
  {
    name: "cornerSmoothing",
    type: "number",
    def: "32",
    desc: "Continuity of the corner curve. 0 is a plain circular arc, 100 the squircle Apple draws — the same superellipse drives the silhouette, the rim stroke, the displacement map and the browser's own corner-shape.",
  },
  {
    name: "refraction",
    type: "number",
    def: "100",
    desc: "How strongly the backdrop bends at the edges. 0–100.",
  },
  {
    name: "depth",
    type: "number",
    def: "85",
    desc: "Thickness of the refracting edge band — the perceived glass depth. 0–100.",
  },
  {
    name: "dispersion",
    type: "number",
    def: "100",
    desc: "Chromatic aberration: how far the red and blue channels split apart. 0–100.",
  },
  { name: "frost", type: "number", def: "3", desc: "Backdrop blur in pixels." },
  {
    name: "splay",
    type: "number",
    def: "38",
    desc: "How far the bend spreads inward from the rim. 0 is a crisp lens, 100 a wide swell. 0–100.",
  },
  {
    name: "lightAngle",
    type: "number",
    def: "45",
    desc: "Direction the specular highlight comes from, in degrees.",
  },
  {
    name: "lightIntensity",
    type: "number",
    def: "38",
    desc: "Strength of the specular highlight and the rim stroke. 0–100.",
  },
  {
    name: "borderWidth",
    type: "number",
    def: "1",
    desc: "Width of the inside rim stroke in pixels. 0 drops the stroke layer, for when the wrapped element draws its own border.",
  },
  {
    name: "elevation",
    type: "number",
    def: "22",
    desc: "Height of the drop shadow cast behind the panel. 0–100, and 0 removes the shadow entirely.",
  },
  {
    name: "layerClassName",
    type: "string",
    def: "—",
    desc: "Applied to each effect layer rather than to the container. Use it to mask the glass — a mask on the container would form a backdrop root and blank the effect out.",
  },
];

export const RECIPES = [
  {
    title: "Pill button",
    note: "Fully rounded, light frost, bright rim.",
    code: "cornerRadius={999}\nfrost={4}\nlightIntensity={100}",
  },
  {
    title: "Sheet over photo",
    note: "Heavy frost so text stays legible on busy imagery.",
    code: "frost={20}\nrefraction={40}\ndepth={40}",
  },
  {
    title: "Water droplet",
    note: "Maximum bend and channel split, almost no blur.",
    code: "refraction={100}\ndispersion={100}\nfrost={0}",
  },
  {
    title: "Apple squircle",
    note: "Continuous corners, a thin bevel and a tight rim — the iOS 26 panel.",
    code: "cornerRadius={28}\ncornerSmoothing={100}\ndepth={45}\nsplay={25}",
  },
];

/**
 * What the playground puts under the glass. Each preset carries the geometry
 * that suits its shape — picking one sets those props and leaves tint, light
 * and the rest as they were — plus the markup the Code tab wraps in
 * `<LiquidGlass>`. The preview draws the same element with the showcase's own
 * CSS, so it renders before the in-browser Tailwind compiler has loaded.
 */
export type PresetId = "card" | "button" | "navbar" | "notification" | "player";

export type PresetGeometry = Pick<
  GlassConfig,
  "cornerRadius" | "cornerSmoothing" | "depth" | "splay" | "frost" | "elevation"
>;

export type Preset = {
  id: PresetId;
  name: string;
  /** Function name in the generated snippet. */
  component: string;
  config: PresetGeometry;
  /** `className` on `<LiquidGlass>` in the generated snippet. */
  className?: string;
  /** Children of `<LiquidGlass>` in the generated snippet, one line each. */
  children: string[];
};

export const PRESETS: Preset[] = [
  {
    id: "card",
    name: "Card",
    component: "Panel",
    config: { cornerRadius: 48, cornerSmoothing: 32, depth: 85, splay: 38, frost: 4, elevation: 22 },
    children: ["<h3>Liquid Glass</h3>", "<p>Own the file, edit the file.</p>"],
  },
  {
    id: "button",
    name: "Button",
    component: "GlassButton",
    config: { cornerRadius: 64, cornerSmoothing: 0, depth: 85, splay: 38, frost: 3, elevation: 16 },
    className: "inline-block",
    children: [
      '<button className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-white">',
      "  Get started",
      "  <span aria-hidden>→</span>",
      "</button>",
    ],
  },
  {
    id: "navbar",
    name: "Navbar",
    component: "Navbar",
    config: { cornerRadius: 64, cornerSmoothing: 0, depth: 85, splay: 38, frost: 4, elevation: 20 },
    className: "w-full max-w-xl",
    children: [
      '<nav className="flex items-center justify-between gap-6 py-2 pl-5 pr-2 text-sm text-white">',
      '  <a href="/" className="flex items-center gap-2 font-semibold">',
      '    <span className="size-5 rounded-full bg-gradient-to-br from-violet-400 to-sky-400" />',
      "    Glass",
      "  </a>",
      '  <div className="flex gap-5 text-white/70">',
      '    <a href="/" className="text-white">Home</a>',
      '    <a href="/docs">Docs</a>',
      '    <a href="/pricing">Pricing</a>',
      "  </div>",
      '  <a href="/login" className="rounded-full bg-white px-4 py-2 font-medium text-black">',
      "    Sign in",
      "  </a>",
      "</nav>",
    ],
  },
  {
    id: "notification",
    name: "Notification",
    component: "Notification",
    config: { cornerRadius: 30, cornerSmoothing: 60, depth: 85, splay: 38, frost: 4, elevation: 28 },
    className: "w-full max-w-sm",
    children: [
      '<div className="flex items-start gap-3 p-3.5 text-white">',
      '  <div className="size-10 shrink-0 rounded-xl bg-gradient-to-b from-emerald-400 to-green-600" />',
      '  <div className="min-w-0 flex-1 text-sm">',
      '    <div className="flex justify-between">',
      '      <strong className="font-semibold">Messages</strong>',
      '      <span className="text-white/60">now</span>',
      "    </div>",
      '    <p className="text-white/80">Sam: The glass build is live — take a look?</p>',
      "  </div>",
      "</div>",
    ],
  },
  {
    id: "player",
    name: "Player",
    component: "NowPlaying",
    config: { cornerRadius: 40, cornerSmoothing: 60, depth: 85, splay: 38, frost: 5, elevation: 30 },
    className: "w-full max-w-xs",
    children: [
      '<div className="p-4 text-white">',
      '  <div className="flex items-center gap-3">',
      '    <div className="size-12 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600" />',
      '    <div className="min-w-0">',
      '      <p className="truncate text-sm font-semibold">Refraction</p>',
      '      <p className="truncate text-xs text-white/60">Glass Arcade</p>',
      "    </div>",
      "  </div>",
      '  <div className="mt-4 h-1 rounded-full bg-white/20">',
      '    <div className="h-full w-2/5 rounded-full bg-white" />',
      "  </div>",
      '  <div className="mt-3 flex justify-center gap-8 text-lg">',
      '    <button aria-label="Previous">⏮︎</button>',
      '    <button aria-label="Pause">⏸︎</button>',
      '    <button aria-label="Next">⏭︎</button>',
      "  </div>",
      "</div>",
    ],
  },
];

export function buildJsx(c: GlassConfig, preset: Preset = PRESETS[0]): string {
  return [
    'import { LiquidGlass } from "@/components/liquid-glass"',
    "",
    `export default function ${preset.component}() {`,
    "  return (",
    "    <LiquidGlass",
    ...(preset.className ? [`      className="${preset.className}"`] : []),
    `      tint="${c.tint}"`,
    `      opacity={${c.opacity}}`,
    `      cornerRadius={${c.cornerRadius}}`,
    `      cornerSmoothing={${c.cornerSmoothing}}`,
    `      refraction={${c.refraction}}`,
    `      depth={${c.depth}}`,
    `      dispersion={${c.dispersion}}`,
    `      frost={${c.frost}}`,
    `      splay={${c.splay}}`,
    `      lightAngle={${c.lightAngle}}`,
    `      lightIntensity={${c.lightIntensity}}`,
    `      borderWidth={${c.borderWidth}}`,
    `      elevation={${c.elevation}}`,
    ...(c.layerClassName ? [`      layerClassName="${c.layerClassName}"`] : []),
    "    >",
    ...preset.children.map((line) => `      ${line}`),
    "    </LiquidGlass>",
    "  )",
    "}",
  ].join("\n");
}

export const USAGE_SNIPPET = [
  'import { LiquidGlass } from "@/components/liquid-glass"',
  "",
  "export function Sheet() {",
  "  return (",
  "    <LiquidGlass",
  '      tint="rgba(17, 21, 27, 0.4)"',
  "      cornerRadius={24}",
  "      cornerSmoothing={60}",
  "      refraction={100}",
  "      frost={8}",
  "    >",
  '      <div className="p-8">',
  "        <h3>Liquid Glass</h3>",
  "        <p>Own the file, edit the file.</p>",
  "      </div>",
  "    </LiquidGlass>",
  "  )",
  "}",
].join("\n");

/**
 * Preview backdrops for the playground stage. Each one paints a canvas larger
 * than the stage so the surface can be panned behind a glass panel that never
 * moves — the rim, the bevel and the dispersion all read as the content slides
 * underneath. `note` is shown in the stage caption.
 */
export type BackdropId = "aurora" | "mesh" | "grid" | "type" | "paper";

export const BACKDROPS: { id: BackdropId; name: string; note: string }[] = [
  { id: "aurora", name: "Aurora", note: "soft drifting light" },
  { id: "mesh", name: "Mesh", note: "saturated colour field" },
  { id: "grid", name: "Grid", note: "straight lines bend at the rim" },
  { id: "type", name: "Type", note: "letterforms smear through the bevel" },
  { id: "paper", name: "Paper", note: "light ground, dark glass" },
];

/** Rows painted by the "type" backdrop. */
export const BACKDROP_WORDS = [
  "LIQUID",
  "REFRACT",
  "GLASS",
  "DISPERSE",
  "BEVEL",
  "SPLAY",
  "FROST",
];
