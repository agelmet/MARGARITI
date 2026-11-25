/* /api/*  — ο πίνακας διαχείρισης και τα μικρά της σελίδας.
   POST /api/save      {pass, action}: login | load | publish {state} | undo | feedback-list | feedback-del {id} | social-post {id}
   POST /api/upload    (x-pass, x-name, x-type, x-id, x-part, x-total) → σε κομμάτια ≤4MB, στο τέλος {url}
   GET  /files/<key>   ό,τι ανέβηκε από τον πίνακα (PDF, ήχος, εικόνες)
   POST /api/feedback  {msg, who, page}  δημόσιο: η φόρμα «Για πες…»
   GET  /api/status    τι είναι συνδεδεμένο                                                           */
import { store, files, json, checkPass, getState, putState } from "./_lib.mjs";
const clean = (s, n = 400) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n);
const TYPES = { "application/pdf": "pdf", "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/wav": "wav", "audio/aac": "aac", "application/octet-stream": "bin", "video/mp4": "mp4" };
const metaOn = () => !!(process.env.META_PAGE_TOKEN && process.env.META_PAGE_ID);

async function socialPost(state, item, origin) {
  /* Facebook σελίδα: ανάρτηση με σύνδεσμο. Instagram: μόνο αν υπάρχει εικόνα (το Instagram δεν δέχεται σκέτο κείμενο). */
  const tok = process.env.META_PAGE_TOKEN, page = process.env.META_PAGE_ID, ig = process.env.META_IG_USER_ID;
  const out = {};
  const link = origin + "/" + (item.u || "");
  const fb = await fetch(`https://graph.facebook.com/v21.0/${page}/feed`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: item.msg, link, access_token: tok }) }).then((r) => r.json()).catch((e) => ({ error: { message: String(e) } }));
  out.fb = fb.id ? "ok" : (fb.error && fb.error.message) || "error";
  if (ig && item.img) {
    const img = /^https?:/.test(item.img) ? item.img : origin + item.img;
    const c = await fetch(`https://graph.facebook.com/v21.0/${ig}/media`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image_url: img, caption: item.msg + "\n\n" + link, access_token: tok }) }).then((r) => r.json()).catch(() => ({}));
    if (c.id) { const p = await fetch(`https://graph.facebook.com/v21.0/${ig}/media_publish`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ creation_id: c.id, access_token: tok }) }).then((r) => r.json()).catch(() => ({})); out.ig = p.id ? "ok" : "error"; }
    else out.ig = (c.error && c.error.message) || "error";
  }
  return out;
}

async function handleSave(req) {
  let b; try { b = await req.json(); } catch { return json({ ok: false, error: "json" }, 400); }
  if (!(await checkPass(b.pass))) return json({ ok: false, error: "pass" }, 401);
  const st = store(); const origin = new URL(req.url).origin;
  if (b.action === "login") return json({ ok: true, meta: metaOn() });
  if (b.action === "load") { const s = await getState(); const fb = JSON.parse((await st.get("feedback.json")) || "[]"); return json({ ok: true, state: s, feedback: fb, meta: metaOn() }); }
  if (b.action === "publish") {
    const s = b.state; if (!s || !Array.isArray(s.posts) || !Array.isArray(s.books) || !s.settings) return json({ ok: false, error: "state" }, 400);
    const raw = JSON.stringify(s); if (raw.length > 5_000_000) return json({ ok: false, error: "size" }, 413);
    // μοιρασιά στα social για όσα μπήκαν στην ουρά με «αυτόματα»
    if (metaOn() && s.social && s.social.auto) {
      for (const it of (s.social.queue || []).filter((x) => x.st === "auto")) {
        it.res = await socialPost(s, it, origin); it.st = it.res.fb === "ok" ? "sent" : "error"; it.at = new Date().toISOString();
        s.social.log = [it, ...(s.social.log || [])].slice(0, 300);
      }
      s.social.queue = (s.social.queue || []).filter((x) => x.st !== "sent");
    }
    const when = await putState(s); return json({ ok: true, when, social: s.social });
  }
  if (b.action === "social-post") {
    if (!metaOn()) return json({ ok: false, error: "meta" }, 400);
    const s = await getState(); const it = (s.social.queue || []).find((x) => x.id === b.id) || b.item; if (!it) return json({ ok: false, error: "id" }, 404);
    it.res = await socialPost(s, it, origin); it.st = it.res.fb === "ok" ? "sent" : "error"; it.at = new Date().toISOString();
    s.social.log = [it, ...(s.social.log || [])].slice(0, 300); s.social.queue = (s.social.queue || []).filter((x) => x.id !== it.id || x.st !== "sent");
    const when = await putState(s); return json({ ok: true, when, item: it, social: s.social });
  }
  if (b.action === "undo") {
    const prev = await st.get("state-prev.json"); if (!prev) return json({ ok: false, error: "none" }, 404);
    const cur = await st.get("state.json"); await st.set("state.json", prev); if (cur) await st.set("state-prev.json", cur);
    try { const { purgeCache } = await import("@netlify/functions"); await purgeCache({ tags: ["nm"] }); } catch {}
    return json({ ok: true, state: JSON.parse(prev) });
  }
  if (b.action === "feedback-list") return json({ ok: true, feedback: JSON.parse((await st.get("feedback.json")) || "[]") });
  if (b.action === "feedback-save") { const list = Array.isArray(b.feedback) ? b.feedback.slice(0, 2000) : []; await st.set("feedback.json", JSON.stringify(list)); return json({ ok: true }); }
  return json({ ok: false, error: "action" }, 400);
}

const hits = new Map();
export default async (req) => {
  const u = new URL(req.url); const p = u.pathname.replace(/\/+$/, "");
  if (p === "/api/status") return json({ ok: true, live: true, meta: metaOn() });
  if (p === "/api/save") return req.method === "POST" ? handleSave(req) : json({ ok: false }, 405);
  if (p === "/api/feedback") {
    if (req.method !== "POST") return json({ ok: false }, 405);
    const ip = req.headers.get("x-nf-client-connection-ip") || "x"; const now = Date.now(); const h = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
    if (h.length > 8) return json({ ok: false, error: "slow" }, 429); h.push(now); hits.set(ip, h);
    let b; try { b = await req.json(); } catch { return json({ ok: false }, 400); }
    const msg = clean(b.msg, 1500).trim(); if (!msg || b.hp) return json({ ok: true });
    const st = store(); const list = JSON.parse((await st.get("feedback.json")) || "[]");
    list.unshift({ id: now.toString(36), at: new Date().toISOString(), msg, who: clean(b.who, 30), page: clean(b.page, 200), read: false });
    await st.set("feedback.json", JSON.stringify(list.slice(0, 2000))); return json({ ok: true });
  }
  if (p === "/api/upload") {
    if (req.method !== "POST") return json({ ok: false }, 405);
    if (!(await checkPass(req.headers.get("x-pass")))) return json({ ok: false, error: "pass" }, 401);
    const type = (req.headers.get("x-type") || "").split(";")[0]; if (!TYPES[type]) return json({ ok: false, error: "type" }, 415);
    const id = clean(req.headers.get("x-id"), 40), part = +req.headers.get("x-part") || 0, total = +req.headers.get("x-total") || 1;
    if (!/^[\w-]{6,40}$/.test(id) || total > 5 || part >= total) return json({ ok: false, error: "parts" }, 400);
    const buf = await req.arrayBuffer(); if (!buf.byteLength || buf.byteLength > 4.6 * 1024 * 1024) return json({ ok: false, error: "size" }, 413);
    const F = files(); await F.set("parts/" + id + "/" + part, buf);
    if (part < total - 1) return json({ ok: true, part });
    const chunks = []; let len = 0;
    for (let i = 0; i < total; i++) { const c = await F.get("parts/" + id + "/" + i, { type: "arrayBuffer" }); if (!c) return json({ ok: false, error: "missing " + i }, 400); chunks.push(new Uint8Array(c)); len += c.byteLength; }
    const all = new Uint8Array(len); let o = 0; for (const c of chunks) { all.set(c, o); o += c.byteLength; }
    const name = clean(req.headers.get("x-name"), 80).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "arxeio";
    const key = new Date().toISOString().slice(0, 7) + "/" + name + "-" + id.slice(-6) + "." + TYPES[type];
    await F.set(key, all.buffer, { metadata: { type } });
    for (let i = 0; i < total; i++) await F.delete("parts/" + id + "/" + i);
    return json({ ok: true, url: "/files/" + key, size: len });
  }
  if (p.startsWith("/files/")) {
    const key = decodeURIComponent(p.slice(7)); if (!/^[\w./-]+$/.test(key) || key.includes("..")) return new Response("", { status: 400 });
    const r = await files().getWithMetadata(key, { type: "stream" }); if (!r || !r.data) return new Response("Δεν βρέθηκε", { status: 404 });
    return new Response(r.data, { headers: { "content-type": (r.metadata && r.metadata.type) || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable", "access-control-allow-origin": "*" } });
  }
  return json({ ok: false }, 404);
};
export const config = { path: ["/api/*", "/files/*"] };
