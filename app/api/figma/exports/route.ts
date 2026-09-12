import {
    EXPORT_TTL_SECONDS, MAX_BODY_BYTES, clientIp, corsHeaders, createLimiter,
    exportKey, json, newExportId, redis, validateSpecs,
  } from "@/lib/figma-exports";
  
  export function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  export async function POST(request: Request) {
    const { success } = await createLimiter.limit(clientIp(request));
    if (!success) return json({ ok: false, error: "Too many exports — try again later." }, 429);
  
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Selection is too large to export." }, 413);
    }
  
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "Body must be JSON." }, 400);
    }
  
    const specs = (body as { specs?: unknown })?.specs;
    const problem = validateSpecs(specs);
    if (problem) return json({ ok: false, error: problem }, 400);
  
    const id = newExportId();
    await redis.set(exportKey(id), specs, { ex: EXPORT_TTL_SECONDS });
  
    return json({
      ok: true,
      id,
      expiresAt: new Date(Date.now() + EXPORT_TTL_SECONDS * 1000).toISOString(),
    }, 201);
  }