// Cloudflare Pages Function : sert /data.js
//  - ventes récentes : base KV (liée sous le nom MS_KV, remplie automatiquement par l'application)
//  - anciennes ventes : data.js statique du dépôt (elles restent consultables par n° de série)
// Les deux listes sont fusionnées ; en cas de doublon (même n° de série), la version de l'application gagne.
const key = s => String(s || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
 
function arrayBounds(txt, marker) {
  const i = txt.indexOf(marker);
  if (i < 0) return null;
  const start = i + marker.length;
  if (txt[start] !== "[") return null;
  let depth = 0, inStr = false, esc = false;
  for (let k = start; k < txt.length; k++) {
    const c = txt[k];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) return { start, end: k + 1 }; }
  }
  return null;
}
 
export async function onRequestGet({ env, next }) {
  const headers = {
    "Content-Type": "text/javascript; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  };
  const kv = env.MS_KV ? await env.MS_KV.get("data.js") : null;
  let old = "";
  try { const r = await next(); if (r.ok) old = await r.text(); } catch (e) {}
  if (!kv) return new Response(old, { status: old ? 200 : 404, headers });
  if (!old) return new Response(kv, { headers });
  try {
    const M = "window.MS_DATA=";
    const a = arrayBounds(kv, M), b = arrayBounds(old, M);
    if (!a || !b) return new Response(kv, { headers });
    const fresh = JSON.parse(kv.slice(a.start, a.end));
    const legacy = JSON.parse(old.slice(b.start, b.end));
    const seen = new Set(fresh.map(x => key(x.s)));
    const extra = legacy.filter(x => x && x.s && !seen.has(key(x.s)));
    const merged = fresh.concat(extra);
    let out = kv.slice(0, a.start) + JSON.stringify(merged) + kv.slice(a.end);
    out = out.replace(/("count"\s*:\s*)\d+/, "$1" + merged.length);
    return new Response(out, { headers });
  } catch (e) {
    return new Response(kv, { headers });
  }
}
 
