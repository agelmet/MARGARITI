/* Κοινά για τις functions. Όλο το περιεχόμενο ζει στο Netlify Blobs:
   κάθε αλλαγή από τον πίνακα φαίνεται αμέσως στο site και ΔΕΝ κάνει deploy. */
import { getStore } from "@netlify/blobs";
import { SEED } from "./_seed.mjs";
export const store = () => getStore({ name: "nm-content", consistency: "strong" });
export const files = () => getStore("nm-files");
export const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
async function sha256(t) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join(""); }
/* Ο κωδικός του πίνακα ζει ΜΟΝΟ στη μεταβλητή ADMIN_PASS του Netlify. Χωρίς αυτήν, καμία είσοδος. */
export async function checkPass(p) {
  const real = process.env.ADMIN_PASS || "";
  const ok = !!real && typeof p === "string" && p.length > 3 && (await sha256(p)) === (await sha256(real));
  if (!ok) await new Promise((r) => setTimeout(r, 700));
  return ok;
}
export async function getState() {
  const st = store(); const t = await st.get("state.json");
  if (!t) { await st.set("state.json", JSON.stringify(SEED)); return structuredClone(SEED); }
  return JSON.parse(t);
}
export async function putState(s) {
  const st = store(); s.updated = new Date().toISOString();
  const prev = await st.get("state.json");
  if (prev) { await st.set("state-prev.json", prev); await st.set("history/" + s.updated.slice(0, 13) + ".json", prev); }
  await st.set("state.json", JSON.stringify(s));
  try { const { purgeCache } = await import("@netlify/functions"); await purgeCache({ tags: ["nm"] }); } catch {}
  return s.updated;
}
