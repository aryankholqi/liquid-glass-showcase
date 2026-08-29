import type { LiquidGlassProps } from "@/components/liquid-glass";

export type GlassConfig = Required<
  Pick<
    LiquidGlassProps,
    | "tint"
    | "cornerRadius"
    | "refraction"
    | "depth"
    | "dispersion"
    | "frost"
    | "splay"
    | "lightAngle"
    | "lightIntensity"
    | "borderWidth"
  >
> & { layerClassName: string };

/** Playground starting point. */
export const PLAYGROUND_DEFAULTS: GlassConfig = {
  tint: "rgba(145, 132, 217, 0.28)",
  cornerRadius: 32,
  refraction: 100,
  depth: 100,
  dispersion: 100,
  frost: 7,
  splay: 40,
  lightAngle: 70,
  lightIntensity: 30,
  borderWidth: 1,
  layerClassName: "",
};

export const HERO_CONFIG: GlassConfig = {
  tint: "rgba(17, 21, 27, 0.55)",
  cornerRadius: 26,
  refraction: 100,
  depth: 100,
  dispersion: 100,
  frost: 10,
  splay: 40,
  lightAngle: -35,
  lightIntensity: 90,
  borderWidth: 1,
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
  { key: "cornerRadius", min: 0, max: 64, step: 1, unit: "px" },
  { key: "refraction", min: 0, max: 100, step: 1, unit: "" },
  { key: "depth", min: 0, max: 100, step: 1, unit: "" },
  { key: "dispersion", min: 0, max: 100, step: 1, unit: "" },
  { key: "frost", min: 0, max: 24, step: 1, unit: "px" },
  { key: "splay", min: 0, max: 100, step: 1, unit: "" },
  { key: "lightAngle", min: -180, max: 180, step: 1, unit: "\u00b0" },
  { key: "lightIntensity", min: 0, max: 100, step: 1, unit: "" },
  { key: "borderWidth", min: 0, max: 4, step: 1, unit: "px" },
];

export const TINTS: { name: string; value: string }[] = [
  { name: "Blurple", value: "rgba(145, 132, 217, 0.28)" },
  { name: "Frost", value: "rgba(233, 233, 237, 0.14)" },
  { name: "Slate", value: "rgba(117, 121, 140, 0.32)" },
];

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
  { name: "cornerRadius", type: "number", def: "0", desc: "Corner radius in pixels." },
  {
    name: "refraction",
    type: "number",
    def: "100",
    desc: "How strongly the backdrop bends at the edges. 0–100.",
  },
  {
    name: "depth",
    type: "number",
    def: "100",
    desc: "Thickness of the refracting edge band — the perceived glass depth. 0–100.",
  },
  {
    name: "dispersion",
    type: "number",
    def: "100",
    desc: "Chromatic aberration: how far the red and blue channels split apart. 0–100.",
  },
  { name: "frost", type: "number", def: "7", desc: "Backdrop blur in pixels." },
  {
    name: "splay",
    type: "number",
    def: "40",
    desc: "How softly the refracting band fades into the flat centre. 0–100.",
  },
  {
    name: "lightAngle",
    type: "number",
    def: "-35",
    desc: "Direction the specular highlight comes from, in degrees.",
  },
  {
    name: "lightIntensity",
    type: "number",
    def: "50",
    desc: "Strength of the specular highlight and the gradient stroke. 0–100.",
  },
  {
    name: "borderWidth",
    type: "number",
    def: "1",
    desc: "Width of the inside gradient stroke in pixels. 0 drops the stroke layer, for when the wrapped element draws its own border.",
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
    note: "High corner radius, light frost, bright stroke.",
    code: "cornerRadius={999}\nfrost={4}\nlightIntensity={100}",
  },
  {
    title: "Sheet over photo",
    note: "Heavy frost so text stays legible on busy imagery.",
    code: "frost={20}\nrefraction={40}\ndepth={60}",
  },
  {
    title: "Water droplet",
    note: "Maximum bend and channel split, almost no blur.",
    code: "refraction={100}\ndispersion={100}\nfrost={0}",
  },
];

export function buildJsx(c: GlassConfig): string {
  return [
    'import { LiquidGlass } from "@/components/liquid-glass"',
    "",
    "export default function Panel() {",
    "  return (",
    "    <LiquidGlass",
    `      tint="${c.tint}"`,
    `      cornerRadius={${c.cornerRadius}}`,
    `      refraction={${c.refraction}}`,
    `      depth={${c.depth}}`,
    `      dispersion={${c.dispersion}}`,
    `      frost={${c.frost}}`,
    `      splay={${c.splay}}`,
    `      lightAngle={${c.lightAngle}}`,
    `      lightIntensity={${c.lightIntensity}}`,
    `      borderWidth={${c.borderWidth}}`,
    ...(c.layerClassName ? [`      layerClassName="${c.layerClassName}"`] : []),
    "    >",
    "      <h3>Liquid Glass</h3>",
    "      <p>Own the file, edit the file.</p>",
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
  '      tint="rgba(17, 21, 27, 0.8)"',
  "      cornerRadius={24}",
  "      refraction={100}",
  "      frost={7}",
  "    >",
  '      <div className="p-8">',
  "        <h3>Liquid Glass</h3>",
  "        <p>Own the file, edit the file.</p>",
  "      </div>",
  "    </LiquidGlass>",
  "  )",
  "}",
].join("\n");
