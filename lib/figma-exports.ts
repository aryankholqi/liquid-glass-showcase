import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const EXPORT_TTL_SECONDS = 60 * 60 * 24 * 7;
export const MAX_BODY_BYTES = 1024 * 1024;
const MAX_CARDS = 20;
const SPEC_VERSION = 1;

export const redis = new Redis({
  url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)!,
  token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)!,
});

export const createLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  prefix: "lg:rl:create",
});

export const readLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 h"),
  prefix: "lg:rl:read",
});

export const exportKey = (id: string) => `lg:figma-export:${id}`;

/** 32 characters with no look-alikes (no l, o, 0, 1), so each byte maps evenly. */
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function newExportId(length = 12) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const isExportId = (id: string) => /^[a-z2-9]{12}$/.test(id);

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function validateSpecs(specs: unknown): string | null {
  if (!Array.isArray(specs) || specs.length === 0) return "Nothing to export."
  if (specs.length > MAX_CARDS) return `Export at most ${MAX_CARDS} cards at a time.`;
  for (const spec of specs) {
    if (!isObject(spec)) return "Each card must be an object.";
    if (spec.version !== SPEC_VERSION) return "This plugin version is not supported — update the plugin.";
    if (!isObject(spec.glass)) return "A card has no glass effect.";
    if (!isObject(spec.content)) return "A card has no content.";
    if (typeof spec.name !== "string" || spec.name.length > 200) return "A card has an invalid name.";
  }
  return null;
}