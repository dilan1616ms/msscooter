export async function onRequestGet({ env, next }) {
  const v = env.MS_KV ? await env.MS_KV.get("data.js") : null;
  if (!v) return next();
  return new Response(v, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
