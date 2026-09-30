import {
  BACKDROPS,
  PLAYGROUND_DEFAULTS,
  PRESETS,
  SLIDERS,
  TINTS,
  isHexColor,
  type BackdropId,
  type GlassConfig,
  type PresetId,
} from "@/lib/props";

/**
 * Playground state as a query string, so a tuned panel can be shared by link.
 * Params use the prop names themselves (`?preset=button&frost=8`) and only
 * values that differ from the playground's defaults are written, which keeps
 * links short and readable. Decoding is defensive: unknown keys are ignored,
 * numbers are clamped to their slider's range, and anything that does not
 * parse falls back to the default.
 */
export type PlaygroundState = {
  config: GlassConfig;
  presetId: PresetId;
  backdrop: BackdropId;
};

export const PLAYGROUND_STATE_DEFAULTS: PlaygroundState = {
  config: PLAYGROUND_DEFAULTS,
  presetId: "card",
  backdrop: "aurora",
};

/** Every param this module owns — cleared before writing, so stale keys go. */
export const PLAYGROUND_PARAMS = [
  "preset",
  "bg",
  "tint",
  "layerClassName",
  ...SLIDERS.map((s) => s.key),
];

const LAYER_MAX = 200;

/** Named tints travel by name, hex without its `#`, anything else verbatim. */
const encodeTint = (tint: string): string => {
  const named = TINTS.find((t) => t.value === tint);
  if (named) return named.name.toLowerCase();
  return isHexColor(tint) ? tint.slice(1).toLowerCase() : tint;
};

const decodeTint = (raw: string): string | null => {
  const named = TINTS.find((t) => t.name.toLowerCase() === raw.toLowerCase());
  if (named) return named.value;
  if (isHexColor(`#${raw}`)) return `#${raw.toLowerCase()}`;
  if (typeof CSS !== "undefined" && CSS.supports("color", raw)) return raw;
  return null;
};

export function encodePlaygroundState({ config, presetId, backdrop }: PlaygroundState): URLSearchParams {
  const params = new URLSearchParams();
  const base = PLAYGROUND_STATE_DEFAULTS;
  if (presetId !== base.presetId) params.set("preset", presetId);
  if (backdrop !== base.backdrop) params.set("bg", backdrop);
  if (config.tint !== base.config.tint) params.set("tint", encodeTint(config.tint));
  for (const { key } of SLIDERS) {
    if (config[key] !== base.config[key]) params.set(key, String(config[key]));
  }
  if (config.layerClassName) params.set("layerClassName", config.layerClassName);
  return params;
}

/** `null` when the query carries none of the playground's params. */
export function decodePlaygroundState(params: URLSearchParams): PlaygroundState | null {
  if (!PLAYGROUND_PARAMS.some((key) => params.has(key))) return null;

  const base = PLAYGROUND_STATE_DEFAULTS;
  const config: GlassConfig = { ...base.config };

  const tint = params.get("tint");
  if (tint) config.tint = decodeTint(tint) ?? config.tint;

  for (const { key, min, max } of SLIDERS) {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n)) config[key] = Math.min(max, Math.max(min, Math.round(n)));
  }

  const layer = params.get("layerClassName");
  if (layer) config.layerClassName = layer.replace(/["<>]/g, "").slice(0, LAYER_MAX);

  const preset = params.get("preset");
  const bg = params.get("bg");
  return {
    config,
    presetId: PRESETS.find((p) => p.id === preset)?.id ?? base.presetId,
    backdrop: BACKDROPS.find((b) => b.id === bg)?.id ?? base.backdrop,
  };
}
