/**
 * furnibloc-3d — R2 asset proxy.
 * Tier A rule (security.md §2.1): stream bytes + set headers ONLY.
 * No database, no auth, no writes, no business logic.
 * R2 is attached through the MY_BUCKET binding — there is no key in this file.
 */

// CORS is scoped to this client's own origins (security.md §5a), never "*".
const ALLOWED_ORIGINS = new Set([
  "https://www.furnibloc.com",
  "https://furnibloc.com",
  "https://___.pages.dev", // production pages.dev domain — fill in once the Pages project exists
]);
// Preview deployments of THIS project only: https://<hash>.<project>.pages.dev  (decision D9)
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.___\.pages\.dev$/; // replace ___ with the Pages project name

// Files sit at the ROOT of the bucket: https://<worker>/white_nightstand.glb  (no folder prefix).
const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(glb|usdz|mp4|webm)$/i;

// Dashboard uploads often arrive as application/octet-stream; iOS Quick Look cares, so set it here.
const CONTENT_TYPES = {
  glb: "model/gltf-binary",
  usdz: "model/vnd.usdz+zip",
  mp4: "video/mp4",
  webm: "video/webm",
};

function corsHeaders(origin) {
  const h = new Headers();
  h.set("Vary", "Origin");
  if (origin && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin))) {
    h.set("Access-Control-Allow-Origin", origin);
  }
  return h;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      cors.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      cors.set("Access-Control-Allow-Headers", "Range");
      cors.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      cors.set("Allow", "GET, HEAD, OPTIONS");
      return new Response("Method Not Allowed", { status: 405, headers: cors });
    }

    let key;
    try {
      key = decodeURIComponent(new URL(request.url).pathname.slice(1));
    } catch {
      return new Response("Bad Request", { status: 400, headers: cors });
    }
    if (!KEY_PATTERN.test(key) || key.includes("..")) {
      return new Response("Not Found", { status: 404, headers: cors });
    }

    // R2 parses Range / If-* straight from the request headers.
    const object = await env.MY_BUCKET.get(key, {
      range: request.headers,
      onlyIf: request.headers,
    });
    if (object === null) {
      return new Response("Not Found", { status: 404, headers: cors });
    }

    const headers = new Headers(cors);
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");
    headers.set("X-Content-Type-Options", "nosniff");
    const ext = key.split(".").pop().toLowerCase();
    headers.set("Content-Type", CONTENT_TYPES[ext] ?? "application/octet-stream");

    if (object.range) {
      const end = object.range.end ?? object.size - 1;
      headers.set("Content-Range", `bytes ${object.range.offset}-${end}/${object.size}`);
    }
    const status = object.body ? (request.headers.get("Range") ? 206 : 200) : 304;
    return new Response(object.body, { status, headers });
  },
};
