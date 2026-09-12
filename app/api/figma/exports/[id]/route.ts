import type { NextRequest } from "next/server";
import { clientIp, corsHeaders, exportKey, isExportId, json, readLimiter, redis } from "@/lib/figma-exports";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest, ctx: RouteContext<"/api/figma/exports/[id]">) {
  const { id } = await ctx.params;
  if (!isExportId(id)) return json({ ok: false, error: "That is not an export ID." }, 400);

  const { success } = await readLimiter.limit(clientIp(request));
  if (!success) return json({ ok: false, error: "Too many requests — try again later." }, 429);

  const specs = await redis.get(exportKey(id));
  if (!specs) return json({ ok: false, error: "Export not found or expired." }, 404);

  return json({ ok: true, specs });
}