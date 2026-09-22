export const FIGMA_PLUGIN_URL = "https://www.figma.com/community/plugin/1680753076274840907";

export const PULL_COMMAND = "npx liquid-glass-cli@latest figma pull <export-id>";
export const PULL_EXAMPLE = "npx liquid-glass-cli@latest figma pull k7x9q2mhw4ra";

export const FIGMA_STEPS = [
  {
    title: "Select your cards",
    body: "Pick one or more layers that use Figma's Glass effect — on the layer itself or on a background layer inside it.",
  },
  {
    title: "Press Export",
    body: "The plugin uploads the cards and hands back a pull command with a short export ID. Send it to whoever builds the UI.",
  },
  {
    title: "Pull in the project",
    body: "The CLI adds liquid-glass if it's missing, then writes each card to components/glass/<layer-name>.tsx.",
  },
];

export const PULL_OPTIONS = [
  { name: "--out <dir>", desc: "Where generated components go. Defaults to components/glass." },
  { name: "--overwrite", desc: "Replace components that already exist. Without it they are skipped." },
  {
    name: "--skip-install",
    desc: "Don't install dependencies if liquid-glass has to be added first.",
  },
];

export const FIGMA_MAPPING = [
  { figma: "Refraction (0–1)", prop: "refraction × 100" },
  { figma: "Depth", prop: "depth, clamped to 0–100" },
  { figma: "Dispersion (0–1)", prop: "dispersion × 100" },
  {
    figma: "Frost",
    prop: "frost, halved — Figma's blur radius reads about twice as strong as CSS blur()",
  },
  { figma: "Splay", prop: "splay, when Figma exposes it to plugins; otherwise the default" },
  { figma: "Light angle", prop: "lightAngle, sign flipped — Figma measures y-up" },
  { figma: "Light intensity (0–1)", prop: "lightIntensity × 100" },
  { figma: "Fill", prop: "tint" },
  {
    figma: "Corner radius / smoothing",
    prop: "cornerRadius / cornerSmoothing, with Figma's 60% “iOS” smoothing as 100",
  },
  { figma: "Drop shadow", prop: "elevation from its blur, 0 when there is none" },
];
