/* Νίκη Μαργαρίτη — κοινός renderer.
   Τρέχει (α) στο build για τις στατικές σελίδες του draft και (β) στη Netlify Function στο live,
   οπότε κάθε αλλαγή από τον πίνακα φαίνεται αμέσως χωρίς deploy. */

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const MONTHS = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
const MGEN = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου", "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];
export const fmtDate = (d) => { const x = new Date(d); return x.getDate() + " " + MGEN[x.getMonth()] + " " + x.getFullYear(); };
const shortDate = (d) => { const x = new Date(d); return String(x.getDate()).padStart(2, "0") + "." + String(x.getMonth() + 1).padStart(2, "0") + "." + x.getFullYear(); };
export const fmtSize = (b) => !b ? "" : b > 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1e3)) + " KB";

/* ---------- κείμενα σελίδων: απλή γραφή (κενή γραμμή = νέα παράγραφος, «- » = λίστα, «## » = τίτλος, [κείμενο](link)) ---------- */
export function md(t) {
  if (!t) return "";
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, h) => `<a href="${h.replace(/"/g, "")}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ""}>${a}</a>`);
  const out = []; let list = null;
  for (const raw of String(t).split(/\n/)) {
    const l = raw.trim();
    if (/^[-•●]\s+/.test(l)) { (list ||= []).push("<li>" + inline(l.replace(/^[-•●]\s+/, "")) + "</li>"); continue; }
    if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
    if (!l) continue;
    if (/^##\s+/.test(l)) out.push("<h3>" + inline(l.replace(/^##\s+/, "")) + "</h3>");
    else out.push("<p>" + inline(l) + "</p>");
  }
  if (list) out.push("<ul>" + list.join("") + "</ul>");
  return out.join("");
}

/* ---------- σύνδεσμοι (draft: /MARGARITI/…, live: /…) ---------- */
export function links(ctx) {
  const b = ctx.base;
  const fb = (ctx.state && ctx.state.settings.filesBase) || "";
  return {
    home: b, yliko: (f = {}) => b + "yliko/" + qs(f), subj: (k) => b + "yliko/" + k + "/", type: (k) => b + "eidos/" + k + "/", lvl: (k) => b + "taxi/" + k + "/",
    post: (p) => b + "anartisi/" + p.slug + "/", books: b + "vivlia/", book: (x) => b + "vivlia/" + x.slug + "/",
    hist: (y) => b + "istoriko/" + (y ? y + "/" : ""), search: (q) => b + "anazitisi/" + (q ? "?q=" + encodeURIComponent(q) : ""),
    page: (k) => b + k + "/", asset: (u) => (u && /^(https?:|blob:|data:|\/)/.test(u)) ? u : b + u,
    file: (u) => !u ? "" : /^(https?:|blob:|data:|\/)/.test(u) ? u : fb + u, admin: b + "admin.html",
  };
}
const qs = (f) => { const k = Object.entries(f).filter(([, v]) => v); return k.length ? "?" + k.map(([a, v]) => a + "=" + encodeURIComponent(v)).join("&") : ""; };

/* ---------- εικονίδια (απλές γραμμές) ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  dl: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>', phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.2A8 8 0 1 1 21 12z"/>',
  play: '<path d="M7 4v16l13-8z"/>', pause: '<path d="M7 4h4v16H7zM14 4h4v16h-4z"/>', head: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', down: '<path d="m6 9 6 6 6-6"/>', star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>', send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  fb: '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5v4h3v7h4v-7h3l1-4h-4V7.5a1 1 0 0 1 1-1h3z"/>', ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
  tw: '<path d="M4 4l16 16M20 4 4 20"/>', yt: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>', li: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  tt: '<path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.5 2.5 4.5 5 4.5"/>', teams: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M7 9h4M9 9v6"/><circle cx="18.5" cy="7.5" r="2"/><path d="M16 11h4.5v4a2.5 2.5 0 0 1-4.5 1.5"/>',
  check: '<path d="m5 12 5 5 9-10"/>', pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
};
export const icon = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n] || ""}</svg>`;

/* ---------- βοηθητικά περιεχομένου ---------- */
export const visible = (state) => state.posts.filter((p) => !p.draft && !p.empty);
const S = (state, k) => state.subjects.find((x) => x.k === k) || { k, t: k, c: "#888" };
const L = (state, k) => state.levels.find((x) => x.k === k) || { k, t: k };
const T = (state, k) => state.types.find((x) => x.k === k) || { k, t: k, s: k };
export const lookups = (state) => ({ S: (k) => S(state, k), L: (k) => L(state, k), T: (k) => T(state, k) });
function potd(state) {
  const st = state.settings.potd || {};
  if (st.mode === "off") return null;
  const all = visible(state);
  if (st.mode === "pick" && st.id) { const p = all.find((x) => x.id === st.id); if (p) return p; }
  return all.find((p) => !p.lock && p.files && p.files.length) || all[0];
}
const filesCount = (state) => visible(state).reduce((a, p) => a + (p.files || []).length, 0);
const thumbOf = (p) => (p.files || []).find((f) => f.th);
/* μικρή εικόνα κάρτας: οι 320px εκδοχές μένουν μέσα στο site (γρήγορες), όσες ανέβηκαν από τον πίνακα έρχονται όπως είναι */
export const smallTh = (Ln, th) => /^t\//.test(th.th) ? Ln.asset("assets/th/" + th.th.slice(2)) : Ln.file(th.th);
const TYPE_ICON = { panellinies: "cap", diagonismata: "clock", askiseis: "spark", methodologia: "star", erotiseis: "chat", theoria: "book", diagrammata: "eye", arthra: "spark" };

/* ---------- κάρτες ---------- */
function chips(state, p) {
  const sub = (p.subj || []).filter((k) => k !== "epistimi").slice(0, 1).map((k) => `<span class="chip" style="--c:${S(state, k).c}"><i></i>${esc(S(state, k).t)}</span>`).join("");
  const lv = (p.lvl || []).slice(0, 2).map((k) => `<span class="chip chip--l">${esc(L(state, k).t)}</span>`).join("");
  return sub + lv;
}
export function postCard(state, ctx, p, opt = {}) {
  const Ln = links(ctx); const th = thumbOf(p); const t = T(state, p.type); const col = S(state, (p.subj || [])[0]).c;
  const n = (p.files || []).length;
  const land = th && (th.tw || 480) > (th.tht || 680);
  const media = th ? `<span class="pc-th${land ? " pc-th--land" : ""}"><img src="${esc(smallTh(Ln, th))}" alt="" width="${th.tw || 480}" height="${th.tht || 680}" loading="${opt.eager ? "eager" : "lazy"}" decoding="async"></span>`
    : `<span class="pc-th pc-th--ph" style="--c:${col}">${icon(p.lock ? "lock" : TYPE_ICON[p.type] || "file")}<b>${esc(t.s)}</b></span>`;
  const meta = p.lock ? `<span class="pc-lock">${icon("lock")}Με κωδικό</span>` : n ? `<span>${icon("file")}${n > 1 ? n + " αρχεία" : (p.files[0].n ? p.files[0].n + " σελ." : "PDF")}</span>` : "";
  return `<article class="pc${opt.big ? " pc--big" : ""}${p.lock ? " is-locked" : ""}" data-id="${esc(p.id)}" style="--c:${col}">
<a class="pc-a" href="${Ln.post(p)}">${media}<span class="pc-b"><span class="pc-type">${esc(t.s)}${p.year ? " · " + p.year : ""}</span><h3 class="pc-t">${esc(p.title)}</h3>
<span class="pc-m"><time datetime="${esc(p.date)}">${shortDate(p.date)}</time>${meta}</span></span></a><span class="pc-chips">${chips(state, p)}</span></article>`;
}
function coverHtml(b, ctx, cls = "") {
  const Ln = links(ctx);
  if (b.cover && b.cover.u) {
    const full = Ln.asset(b.cover.u), sm = /^assets\/img\/vivlio-.+\.webp$/.test(b.cover.u) && !cls.includes("fl-cover") ? Ln.asset(b.cover.u.replace(/\.webp$/, "-sm.webp")) : "";
    return `<img class="bk-img ${cls}" src="${esc(sm || full)}"${sm ? ` srcset="${esc(sm)} ${Math.round((b.cover.w || 600) * 440 / (b.cover.h || 840))}w, ${esc(full)} ${b.cover.w || 600}w" sizes="(max-width:640px) 40vw, 230px"` : ""} alt="Εξώφυλλο: ${esc(b.title)}" width="${b.cover.w || 600}" height="${b.cover.h || 840}" loading="lazy" decoding="async">`;
  }
  return `<span class="bk-gen ${cls}" style="--c1:${esc(b.c1 || "#2fae74")};--c2:${esc(b.c2 || "#1f7a52")}"><small>Νικολέττα Μαργαρίτη</small><b>${esc(b.title)}</b><em>${esc(b.grade || "")}</em><i class="bk-dna" aria-hidden="true"></i></span>`;
}
export function bookCard(state, ctx, b, i = 0) {
  const Ln = links(ctx); const col = ["coral", "sun", "leaf", "blue", "violet", "teal"][i % 6];
  const st = b.lock ? (b.lock.pending ? "Με κωδικό" : "Με κωδικό") : (b.files && b.files.length) ? "Ελεύθερο · " + b.files.length + " αρχεία" : b.sample ? "Δείγμα σελίδων" : "Στα βιβλιοπωλεία";
  return `<article class="bk bk--${col}"><a href="${Ln.book(b)}" class="bk-a"><span class="bk-stage"><span class="bk-cover" style="aspect-ratio:${b.cover && b.cover.u ? (b.cover.w || 7) + "/" + (b.cover.h || 10) : "7/10"};--r:${b.cover && b.cover.u ? ((b.cover.w || 7) / (b.cover.h || 10)).toFixed(4) : ".7"}">${coverHtml(b, ctx)}</span></span>
${b.isNew ? '<span class="bk-new">Νέα κυκλοφορία</span>' : ""}<h3 class="bk-t">${esc(b.title)}</h3><span class="bk-m">${esc([b.grade, b.publisher ? "Εκδ. " + b.publisher : ""].filter(Boolean).join(" · "))}</span>
<span class="bk-s${b.lock ? " is-lock" : ""}">${b.lock ? icon("lock") : "<i></i>"}${esc(st)}</span></a></article>`;
}

/* ---------- σταθερά μέρη ---------- */
export const NAV = [
  { t: "Υλικό", k: "yliko", mega: "yliko" },
  { t: "Τα βιβλία μου", k: "vivlia", mega: "vivlia" },
  { t: "Online μαθήματα", k: "online-mathimata", sub: [["online-mathimata", "Με τη Νίκη Μαργαρίτη", "Ατομικά online μαθήματα Βιολογίας, Χημείας, Ανατομίας & Υγιεινής"], ["kathodigisi", "Ολοκληρωμένο πακέτο καθοδήγησης", "Πλάνο, υλικό και παρακολούθηση ως τις εξετάσεις"], ["epaggelmatikos-prosanatolismos", "Επαγγελματικός προσανατολισμός", "Τεστ και συνεδρία για να διαλέξεις σωστά σχολή"]] },
  { t: "Celly", k: "celly" },
  { t: "Είσαι μαθητής;", k: "mathites", sub: [["mathites/gel", "Είσαι στο ΓΕΛ", "Α΄, Β΄ και Γ΄ Λυκείου, Βιολογία & Χημεία"], ["mathites/epal", "Είσαι στο ΕΠΑΛ", "Ανατομία & Φυσιολογία ΙΙ, Υγιεινή"], ["mathites/gymnasio", "Είσαι στο Γυμνάσιο", "Χημεία, Φυσική, Βιολογία"], ["mathites/ib-eb", "Υποψήφιος IB / EB", "Βιολογία για διεθνή απολυτήρια"], ["mathites/foitites", "Είσαι φοιτητής", "Βιολογία & Ανατομία για τη σχολή"], ["mathites/taxidepse-kai-mathe", "Ταξίδεψε και μάθε", "Επιλεγμένες ιστοσελίδες για την επιστήμη"], ["mathites/ola-xreiazontai", "Όλα χρειάζονται!", "Πρόγραμμα μελέτης, ξεκούραση, άσκηση"]] },
  { t: "Είσαι καθηγητής;", k: "kathigites" },
  { t: "Νίκη Μαργαρίτη", k: "niki", sub: [["niki", "Ποια είμαι", "Βιογραφικό, σπουδές, συγγραφικό έργο"], ["ti-nea", "Τι νέα;", "Οι τελευταίες αναρτήσεις και τα νέα των εξετάσεων"], ["ti-eipame-ti-kaname", "Τι είπαμε; Τι κάναμε;", "Άρθρα στον Τύπο, συνέδρια, social"], ["gia-pes", "Για πες…", "Πες μου τη γνώμη σου για το site και το υλικό"]] },
  { t: "Επικοινωνία", k: "epikoinonia" },
];

function megaYliko(state, ctx) {
  const Ln = links(ctx); const all = visible(state);
  const cnt = (f) => all.filter(f).length;
  const lv = state.levels.filter((l) => l.k !== "oloi").map((l) => `<a href="${Ln.lvl(l.k)}"><b>${esc(l.t)}</b><span>${cnt((p) => (p.lvl || []).includes(l.k))} αναρτήσεις</span></a>`).join("");
  const ty = state.types.map((t) => `<a href="${Ln.type(t.k)}"><i style="--c:var(--blue)">${icon(TYPE_ICON[t.k] || "file")}</i>${esc(t.t)}</a>`).join("");
  const sj = state.subjects.map((s) => `<a href="${Ln.subj(s.k)}"><i class="dot" style="--c:${s.c}"></i>${esc(s.t)}</a>`).join("");
  return `<div class="mega mega--3"><div><p class="mega-h">Ανά τάξη</p><div class="mega-lv">${lv}</div></div><div><p class="mega-h">Ανά είδος</p><div class="mega-ls">${ty}</div></div>
<div><p class="mega-h">Ανά μάθημα</p><div class="mega-ls">${sj}</div><a class="mega-all" href="${Ln.yliko()}">Όλο το υλικό ${icon("arrow")}</a><a class="mega-all mega-all--2" href="${Ln.hist()}">${icon("cal")} Ιστορικό ανά ημερομηνία</a></div></div>`;
}
function megaBooks(state, ctx) {
  const Ln = links(ctx);
  const bs = orderedBooks(state).slice(0, 8).map((b) => `<a class="mega-bk" href="${Ln.book(b)}"><span>${coverHtml(b, ctx, "mini")}</span><b>${esc(b.title)}</b><small>${esc(b.grade || "")}${b.lock ? " · " + "κωδικός" : ""}</small></a>`).join("");
  return `<div class="mega mega--books">${bs}<a class="mega-all" href="${Ln.books}">Όλα τα βιβλία ${icon("arrow")}</a></div>`;
}
export const orderedBooks = (state) => { const o = state.settings.bookOrder || []; return state.books.filter((b) => !b.hidden).slice().sort((a, b) => (o.indexOf(a.id) + 1 || 999) - (o.indexOf(b.id) + 1 || 999)); };

const logo = (ctx) => `<a class="logo" href="${ctx.base}"><span class="logo-m" aria-hidden="true"><i>A</i><i>T</i><i>G</i><i>C</i></span><span class="logo-t"><b>Νίκη Μαργαρίτη</b><small>Deep Learning · Βιολογία & Χημεία</small></span></a>`;

export function header(state, ctx, cur) {
  const Ln = links(ctx);
  const items = NAV.map((n) => {
    const on = cur === n.k || (n.sub || []).some((s) => s[0] === cur) ? " is-cur" : "";
    if (n.mega || n.sub) {
      const panel = n.mega === "yliko" ? megaYliko(state, ctx) : n.mega === "vivlia" ? megaBooks(state, ctx)
        : `<div class="mega mega--list">${n.sub.map(([k, t, d]) => `<a href="${Ln.page(k)}"><b>${esc(t)}</b><span>${esc(d)}</span></a>`).join("")}</div>`;
      const href = n.k === "yliko" ? Ln.yliko() : n.k === "vivlia" ? Ln.books : Ln.page(n.k);
      return `<li class="nv${on}"><a class="nv-a" href="${href}" aria-haspopup="true" aria-expanded="false">${esc(n.t)}${icon("down", "nv-d")}</a><div class="nv-p">${panel}</div></li>`;
    }
    return `<li class="nv${on}"><a class="nv-a" href="${Ln.page(n.k)}">${esc(n.t)}</a></li>`;
  }).join("");
  const mob = NAV.map((n) => {
    const href = n.k === "yliko" ? Ln.yliko() : n.k === "vivlia" ? Ln.books : Ln.page(n.k);
    let sub = n.sub ? n.sub.map(([k, t]) => `<a href="${Ln.page(k)}">${esc(t)}</a>`).join("") : "";
    if (n.k === "yliko") sub = state.levels.filter((l) => l.k !== "oloi").map((l) => `<a href="${Ln.lvl(l.k)}">${esc(l.t)}</a>`).join("") + state.types.slice(0, 4).map((t) => `<a href="${Ln.type(t.k)}">${esc(t.t)}</a>`).join("") + `<a href="${Ln.yliko()}">Όλο το υλικό</a><a href="${Ln.hist()}">Ιστορικό ανά ημερομηνία</a>`;
    if (n.k === "vivlia") sub = orderedBooks(state).map((b) => `<a href="${Ln.book(b)}">${esc(b.title)}</a>`).join("");
    return sub ? `<details class="mm-g"><summary>${esc(n.t)}${icon("down")}</summary><div><a href="${href}" class="mm-all">${n.k === "yliko" || n.k === "vivlia" ? "Δες όλα" : "Η σελίδα"} ${icon("arrow")}</a>${sub}</div></details>` : `<a class="mm-a" href="${href}">${esc(n.t)}</a>`;
  }).join("");
  const ann = state.settings.announce ? `<div class="ann">${md(state.settings.announce).replace(/<\/?p>/g, "")}</div>` : "";
  return `${ann}<header class="top" id="top"><div class="top-in">${logo(ctx)}<nav class="nav" aria-label="Κύριο μενού"><ul>${items}</ul></nav>
<button class="sbtn" type="button" data-search aria-label="Αναζήτηση">${icon("search")}<span>Αναζήτηση υλικού…</span><kbd>/</kbd></button>
<button class="burger" type="button" aria-label="Μενού" aria-expanded="false" aria-controls="mm">${icon("menu")}</button></div></header>
<div class="mm" id="mm" hidden><div class="mm-top">${logo(ctx)}<button class="mm-x" type="button" aria-label="Κλείσιμο μενού">${icon("x")}</button></div>
<button class="mm-search" type="button" data-search>${icon("search")}Τι ψάχνεις; Γράψε εδώ</button><nav class="mm-nav">${mob}</nav>
<div class="mm-cta"><a href="tel:${esc(state.settings.phone.replace(/\s/g, ""))}" class="btn btn--line-ink">${icon("phone")} ${esc(state.settings.phone)}</a></div></div>`;
}

function socials(st) {
  const L2 = [["facebook", "fb", "Facebook"], ["instagram", "ig", "Instagram"], ["x", "tw", "X"], ["linkedin", "li", "LinkedIn"], ["tiktok", "tt", "TikTok"], ["youtube", "yt", "YouTube"]];
  const h = L2.filter(([k]) => st[k]).map(([k, i, t]) => `<a href="${esc(st[k])}" target="_blank" rel="noopener" aria-label="${t}">${icon(i)}</a>`).join("");
  return h ? `<div class="soc">${h}</div>` : "";
}
export function footer(state, ctx) {
  const Ln = links(ctx); const st = state.settings;
  return `<footer class="foot"><div class="dna dna--thin" aria-hidden="true"></div><div class="wrap foot-in">
<div class="foot-a">${logo(ctx)}<p>Ένα ιστολόγιο για τη διδασκαλία της Βιολογίας και της Χημείας, αλλά και της Ανατομίας & Φυσιολογίας και της Υγιεινής. Δωρεάν υλικό για μαθητές, φοιτητές και καθηγητές.</p>${socials(st)}</div>
<div><p class="foot-h">Υλικό</p>${state.levels.filter((l) => l.k !== "oloi").map((l) => `<a href="${Ln.lvl(l.k)}">${esc(l.t)}</a>`).join("")}<a href="${Ln.type("panellinies")}">Θέματα Πανελληνίων</a><a href="${Ln.hist()}">Ιστορικό αναρτήσεων</a></div>
<div><p class="foot-h">Νίκη Μαργαρίτη</p><a href="${Ln.page("niki")}">Ποια είμαι</a><a href="${Ln.books}">Τα βιβλία μου</a><a href="${Ln.page("online-mathimata")}">Online μαθήματα</a><a href="${Ln.page("celly")}">Celly</a><a href="${Ln.page("gia-pes")}">Για πες…</a></div>
<div><p class="foot-h">Επικοινωνία</p><a href="tel:${esc(st.phone.replace(/\s/g, ""))}">${icon("phone")}${esc(st.phone)}</a>${st.phone2 ? `<a href="tel:${esc(st.phone2.replace(/\s/g, ""))}">${icon("phone")}${esc(st.phone2)}</a>` : ""}<a href="mailto:${esc(st.email)}">${icon("mail")}${esc(st.email)}</a>${st.teams ? `<span class="foot-t">${icon("teams")}Teams: ${esc(st.teams)}</span>` : ""}${st.address ? `<span class="foot-t">${icon("pin")}${esc(st.address)}</span>` : ""}</div>
</div><div class="wrap foot-b"><span>© ${new Date().getFullYear()} Νικολέττα (Νίκη) Μαργαρίτη. Όλο το υλικό προστατεύεται (Ν. 2121/1993).</span><span><a href="${Ln.page("pnevmatiki-idioktisia")}">Πνευματική ιδιοκτησία</a> · <a href="${Ln.page("aporrito")}">Απόρρητο & cookies</a></span>
<a class="credit" href="https://advonmedia.com" target="_blank" rel="noopener">Designed by <b class="adv">Advon Media</b></a></div></footer>`;
}

function bubbles(state, ctx) {
  const Ln = links(ctx); const pc = state.settings.podcast || {};
  const purl = pc.url ? (/^assets\//.test(pc.url) ? Ln.asset(pc.url) : Ln.file(pc.url)) : "";
  return `<div class="bub" role="group" aria-label="Βοήθεια">
<button class="bub-b bub-pod" type="button" data-pod aria-expanded="false" aria-controls="pod" aria-label="Άκου τον οδηγό του site"><span class="bub-ic">${icon("head")}</span><span class="bub-l">Άκου τον οδηγό</span><span class="bub-eq" aria-hidden="true"><i></i><i></i><i></i></span></button>
<button class="bub-b bub-celly" type="button" data-celly aria-label="Έχεις απορίες; Ρώτα την Celly"><span class="bub-l">Έχεις απορίες;</span><img src="${esc(Ln.asset(state.photos.cellyAvatar.u))}" alt="" width="46" height="46"></button></div>
<section class="pod" id="pod" hidden aria-label="Ηχητικός οδηγός"><div class="pod-h"><span class="pod-ic">${icon("head")}</span><div><b>${esc(pc.title || "Ο ηχητικός οδηγός του site")}</b><small>με τη φωνή της ${esc(pc.by || "Νίκης Μαργαρίτη")}</small></div><button type="button" class="pod-x" aria-label="Κλείσιμο">${icon("x")}</button></div>
${pc.url ? `<audio preload="none" src="${esc(purl)}"></audio>` : ""}
<div class="pod-p"><button type="button" class="pod-play" aria-label="Αναπαραγωγή"${pc.url ? "" : " disabled"}>${icon("play", "i-play")}${icon("pause", "i-pause")}</button><div class="pod-bar"><input type="range" min="0" max="1000" value="0" aria-label="Θέση"${pc.url ? "" : " disabled"}><span class="pod-time"><span data-t>0:00</span> / <span data-d>${pc.url ? "–:––" : "0:00"}</span></span></div><button type="button" class="pod-rate" aria-label="Ταχύτητα">1×</button></div>
${(pc.chapters || []).length ? `<ol class="pod-ch">${pc.chapters.map((c) => `<li><button type="button" data-at="${+c.at || 0}"><span>${esc(c.t)}</span><time>${Math.floor((+c.at || 0) / 60)}:${String((+c.at || 0) % 60).padStart(2, "0")}</time></button></li>`).join("")}</ol>` : ""}
${pc.url && pc.demo ? `<p class="pod-demo"><b>Δείγμα</b> Προς το παρόν παίζει ενδεικτική μουσική, για να δεις ότι το κουμπί λειτουργεί. Σύντομα εδώ θα ακούγεται η αφήγηση της Νίκης.</p>` : ""}${pc.url ? "" : `<p class="pod-empty">Ο ηχητικός οδηγός ανεβαίνει σε λίγο: μια σύντομη ξενάγηση με τη φωνή της Νίκης για το πού θα βρεις κάθε υλικό.</p>`}</section>
<aside class="drawer" id="drawer" aria-label="Celly" hidden><div class="drawer-h"><img src="${esc(Ln.asset(state.photos.cellyAvatar.u))}" alt="" width="40" height="40"><div><b>Celly</b><small>Η βοηθός τεχνητής νοημοσύνης της Νίκης</small></div><a href="${esc(state.settings.celly)}" target="_blank" rel="noopener" class="drawer-new">Νέα καρτέλα ↗</a><button type="button" class="drawer-x" aria-label="Κλείσιμο Celly">${icon("x")}</button></div><div class="drawer-b"><iframe title="Celly" data-src="${esc(state.settings.celly)}" allow="microphone; clipboard-write"></iframe></div></aside>
<div class="sx" id="sx" hidden role="dialog" aria-modal="true" aria-label="Αναζήτηση"><div class="sx-box"><div class="sx-in">${icon("search")}<input type="search" placeholder="Τι ψάχνεις; π.χ. θέματα πανελληνίων 2025, ανατομία, χημεία γυμνασίου…" autocomplete="off" spellcheck="false" aria-label="Αναζήτηση"><button type="button" class="sx-x" aria-label="Κλείσιμο">Esc</button></div><div class="sx-r" aria-live="polite"></div></div></div>
<div class="pv" id="pv" hidden role="dialog" aria-modal="true" aria-label="Προβολή αρχείου"><div class="pv-h"><b class="pv-t"></b><a class="pv-dl btn btn--sun btn--sm" href="#pv" download>${icon("dl")} Λήψη</a><a class="pv-new" href="#pv" target="_blank" rel="noopener">Νέα καρτέλα ↗</a><button type="button" class="pv-x" aria-label="Κλείσιμο">${icon("x")}</button></div><div class="pv-b"></div></div>`;
}

/* ---------- σελίδες ---------- */
function crumbs(ctx, list) {
  return `<nav class="crumbs" aria-label="Διαδρομή"><a href="${ctx.base}">${icon("home")}<span class="sr">Αρχική</span></a>${list.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join("")}</nav>`;
}
function filterBar(state, ctx, f) {
  const opt = (arr, cur, all) => `<option value="">${all}</option>` + arr.map((x) => `<option value="${x.k}"${cur === x.k ? " selected" : ""}>${esc(x.t)}</option>`).join("");
  return `<form class="fb" data-filter role="search" action="${links(ctx).yliko()}" method="get"><label class="fb-q">${icon("search")}<input name="q" type="search" value="${esc(f.q || "")}" placeholder="Φίλτραρε με λέξη, π.χ. «γενετική»…" autocomplete="off"></label>
<select name="t" aria-label="Τάξη">${opt(state.levels, f.l, "Όλες οι τάξεις")}</select><select name="m" aria-label="Μάθημα">${opt(state.subjects, f.m, "Όλα τα μαθήματα")}</select><select name="e" aria-label="Είδος">${opt(state.types, f.e, "Όλα τα είδη")}</select>
<select name="o" aria-label="Σειρά"><option value="">Νεότερα πρώτα</option><option value="old"${f.o === "old" ? " selected" : ""}>Παλαιότερα πρώτα</option><option value="az"${f.o === "az" ? " selected" : ""}>Αλφαβητικά</option></select></form>`;
}
function listing(state, ctx, opts) {
  const all = visible(state); const f = opts.f || {};
  let items = all.filter((p) => (!f.l || (p.lvl || []).includes(f.l)) && (!f.m || (p.subj || []).includes(f.m)) && (!f.e || p.type === f.e));
  const total = items.length;
  const per = 24; const shown = items.slice(0, per);
  const quick = state.types.map((t) => { const n = items.filter((p) => p.type === t.k).length; return n ? `<button type="button" class="qf" data-e="${t.k}"${f.e === t.k ? ' aria-pressed="true"' : ""}>${esc(t.s)} <small>${n}</small></button>` : ""; }).join("");
  return `<div class="lst" data-list data-f='${esc(JSON.stringify(f))}'>${filterBar(state, ctx, f)}<div class="qfs" role="group" aria-label="Γρήγορο φίλτρο">${quick}</div>
<h2 class="sr">Αναρτήσεις</h2><p class="lst-n"><b data-n>${total}</b> αναρτήσεις</p><div class="grid" data-grid>${shown.map((p, i) => postCard(state, ctx, p, { eager: i < 4 })).join("")}</div>
${total > per ? `<div class="more"><button type="button" class="btn btn--ink" data-more>Δείξε κι άλλα</button></div>` : ""}<p class="lst-empty" hidden>Δεν βρέθηκε τίποτα με αυτά τα φίλτρα. Δοκίμασε άλλη λέξη ή <a href="${links(ctx).yliko()}">καθάρισε τα φίλτρα</a>.</p></div>`;
}
function pageHero(eyebrow, title, lead, extra = "") {
  return `<section class="ph"><div class="wrap"><p class="eyebrow">${esc(eyebrow)}</p><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}${extra}</div><div class="dna dna--thin" aria-hidden="true"></div></section>`;
}

function homePage(state, ctx) {
  const Ln = links(ctx); const all = visible(state); const st = state.settings; const d = potd(state);
  const nFiles = filesCount(state); const books = orderedBooks(state);
  const sugg = ["θέματα πανελληνίων 2025", "διαγωνίσματα γ λυκείου", "ανατομία επαλ", "χημεία γυμνασίου", "γενετική", "κλειστού τύπου"];
  const dCard = d ? `<a class="potd-c" href="${Ln.post(d)}">${thumbOf(d) ? `<span class="potd-img"><img src="${esc(Ln.file(thumbOf(d).th))}" alt="" width="${thumbOf(d).tw}" height="${thumbOf(d).tht}" fetchpriority="high"></span>` : `<span class="potd-img potd-img--ph">${icon(TYPE_ICON[d.type] || "file")}</span>`}
<span class="potd-txt"><span class="potd-type">${esc(T(state, d.type).s)}</span><b>${esc(d.title)}</b><small>${fmtDate(d.date)}</small>${st.potd && st.potd.note ? `<em>${esc(st.potd.note)}</em>` : ""}<span class="potd-go">Άνοιξέ το ${icon("arrow")}</span></span></a>` : "";
  const rot = books.filter((b) => b.cover && b.cover.u).slice(0, 8);
  const shelf = rot.map((b, i) => `<a class="rb${i === 0 ? " is-on" : ""}" href="${Ln.book(b)}" aria-hidden="${i ? "true" : "false"}" tabindex="${i ? -1 : 0}"><span class="rb-c">${coverHtml(b, ctx)}</span><span class="rb-t"><b>${esc(b.title)}</b><small>${esc([b.grade, b.publisher && "Εκδ. " + b.publisher].filter(Boolean).join(" · "))}</small></span></a>`).join("");
  const levelTiles = state.levels.filter((l) => l.k !== "oloi").map((l, i) => { const n = all.filter((p) => (p.lvl || []).includes(l.k)).length; return `<a class="lt lt--${["coral", "sun", "leaf", "blue", "violet"][i]}" href="${Ln.lvl(l.k)}"><span class="lt-l">${esc(({ gymnasio: "Γυμ", "a-lykeiou": "Α΄", "b-lykeiou": "Β΄", "g-lykeiou": "Γ΄", epal: "ΕΠΑΛ" })[l.k] || l.t.charAt(0))}</span><b>${esc(l.t)}</b><small>${n} αναρτήσεις</small>${icon("arrow")}</a>`; }).join("");
  const years = [...new Set(all.filter((p) => p.type === "panellinies" && p.year).map((p) => p.year))].sort((a, b) => b - a);
  const latest = all.slice(0, 8).map((p) => postCard(state, ctx, p)).join("");
  return `<section class="hero"><div class="amb" aria-hidden="true"><i class="am am--h1"><svg viewBox="0 0 60 66" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M30 3 56 18v30L30 63 4 48V18z"/><path d="M30 13 47 23v20L30 53" opacity=".55"/></svg></i><i class="am am--h2"><svg viewBox="0 0 60 66" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M30 3 56 18v30L30 63 4 48V18z"/><path d="M30 13 47 23v20L30 53" opacity=".55"/></svg></i><i class="am am--t am--a">A</i><i class="am am--t am--tt">T</i><i class="am am--t am--g">G</i><i class="am am--t am--c">C</i><i class="am am--d1"></i><i class="am am--d2"></i></div><div class="wrap hero-g">
${d && dCard ? `<aside class="hc hc--potd" aria-label="Post ημέρας"><p class="hc-h"><span class="pulse"></span>Post ημέρας</p>${dCard}</aside>` : `<span></span>`}
<div class="hero-c"><h1 class="eyebrow h1-ey">Νίκη Μαργαρίτη · καθηγήτρια Βιολογίας & Χημείας</h1><p class="h1-big">Deep Learning στη <span class="hl hl--leaf">Βιολογία</span> και τη <span class="hl hl--blue">Χημεία</span></p>
<p class="lead">Θέματα Πανελληνίων, διαγωνίσματα, ασκήσεις και θεωρία, όλα σε ένα μέρος.</p>
<form class="hs" action="${Ln.search()}" method="get" role="search" data-hs><label class="sr" for="hs-q">Αναζήτηση υλικού</label>${icon("search")}<input id="hs-q" name="q" type="search" placeholder="Τι ψάχνεις; π.χ. «θεματα πανελληνιων»" autocomplete="off" spellcheck="false"><button class="btn btn--ink" type="submit">Βρες το</button><div class="hs-r" hidden></div></form>
<div class="sugg">${sugg.slice(0, 3).map((s) => `<a href="${Ln.search(s)}">${esc(s)}</a>`).join("")}</div></div>
<aside class="hc hc--books" aria-label="Τα βιβλία μου"><p class="hc-h">${icon("book")}Τα βιβλία μου</p><div class="rbs" data-rotate>${shelf}</div><div class="rb-dots" aria-hidden="true">${rot.map((_, i) => `<i${i ? "" : ' class="is-on"'}></i>`).join("")}</div></aside>
</div></section>
<div class="trust"><div class="wrap trust-in"><span>${icon("file")}<b data-cu="${all.length}">${all.length}</b> αναρτήσεις</span><span>${icon("dl")}<b data-cu="${nFiles}">${nFiles}</b> αρχεία PDF</span><span>${icon("cap")}Θέματα Πανελληνίων <b>2000–${years[0] || ""}</b></span><span>${icon("book")}<b data-cu="${books.length}">${books.length}</b> βιβλία</span><span>${icon("spark")}Δωρεάν, χωρίς εγγραφή</span></div></div>
<div class="dna" aria-hidden="true"></div>
<section class="sec"><div class="wrap"><div class="sec-h"><div><p class="eyebrow">Βρες γρήγορα</p><h2>Σε ποια τάξη είσαι;</h2></div><a class="lnk" href="${Ln.yliko()}">Όλο το υλικό ${icon("arrow")}</a></div><div class="lts">${levelTiles}</div>
<div class="tys tys--rail">${state.types.map((t) => `<a href="${Ln.type(t.k)}">${icon(TYPE_ICON[t.k] || "file")}${esc(t.t)}<small>${all.filter((p) => p.type === t.k).length}</small></a>`).join("")}</div></div></section>
<section class="sec sec--paper"><div class="wrap"><div class="sec-h"><div><p class="eyebrow">Τι νέα;</p><h2>Οι τελευταίες αναρτήσεις</h2></div><a class="lnk" href="${Ln.hist()}">${icon("cal")} Ιστορικό ανά ημερομηνία</a></div><div class="grid grid--4 grid--rail">${latest}</div></div></section>
${years.length ? `<section class="sec sec--ink"><div class="wrap"><div class="sec-h"><div><p class="eyebrow">Πανελλήνιες</p><h2>Θέματα & απαντήσεις, χρονιά προς χρονιά</h2></div><a class="lnk lnk--l" href="${Ln.type("panellinies")}">Όλα τα θέματα ${icon("arrow")}</a></div>
<div class="yrs">${years.map((y) => `<a href="${Ln.type("panellinies")}?y=${y}"><b>${y}</b><small>${all.filter((p) => p.type === "panellinies" && p.year === y).length} αρχεία</small></a>`).join("")}<a class="yrs-ch" href="${Ln.search("θέματα πανελληνίων ανά κεφάλαιο")}"><b>Ανά κεφάλαιο</b><small>από το 2000</small></a></div></div></section>` : ""}
<section class="sec" id="vivlia"><div class="wrap"><div class="sec-h"><div><p class="eyebrow">Τα βιβλία μου</p><h2>Διάλεξε ένα και ξεφύλλισέ το</h2></div><p class="sec-p">Κάθε βιβλίο ανοίγει στη σελίδα του: εξώφυλλο, περιεχόμενα, δείγματα σελίδων και τα αρχεία του, με τον κωδικό σου όπου χρειάζεται.</p></div>
<div class="bks">${books.slice(0, 5).map((b, i) => bookCard(state, ctx, b, i)).join("")}</div><div class="more"><a class="btn btn--ink btn--count" href="${Ln.books}">Δες όλα τα βιβλία <span>${books.length}</span></a></div></div></section>

<section class="sec"><div class="wrap"><div class="celx"><a class="celx-img" href="${Ln.page("celly")}" aria-label="Η Celly"><img src="${esc(Ln.asset(state.photos.celly.u))}" alt="Η Celly, η βοηθός τεχνητής νοημοσύνης για Βιολογία, Χημεία, Ανατομία και Υγιεινή" width="${state.photos.celly.w}" height="${state.photos.celly.h}" loading="lazy" decoding="async"></a>
<div class="celx-t"><p class="eyebrow">Η βοηθός σου</p><h2>Διάβασε μαζί με την Celly</h2><p class="lead">Η βοηθός τεχνητής νοημοσύνης που έφτιαξα για τους μαθητές μου, για Βιολογία, Χημεία, Ανατομία και Υγιεινή.</p>
<ul class="celx-l"><li>${icon("check")}Λύνει κάθε άσκηση με πλήρη αιτιολόγηση</li><li>${icon("check")}Σε καθοδηγεί βήμα βήμα στη θεωρία</li><li>${icon("check")}Σε εξετάζει σαν διορθωτής</li><li>${icon("check")}Σε ακούει ή σε διαβάζει, στα ελληνικά και στα αγγλικά</li></ul>
<div class="btns"><button type="button" class="btn btn--ink" data-celly>Άνοιξε την Celly</button><button type="button" class="btn btn--line-ink" data-pod>${icon("head")} Άκου τον οδηγό του site</button></div></div></div></div></section>
<section class="sec"><div class="wrap me"><img class="me-img" src="${esc(Ln.asset(state.photos.niki.u))}" alt="Η Νίκη Μαργαρίτη, βιοτεχνολόγος και καθηγήτρια Βιολογίας και Χημείας" width="${state.photos.niki.w}" height="${state.photos.niki.h}" loading="lazy">
<div><p class="eyebrow">Ποια είμαι</p><h2>Νίκη Μαργαρίτη</h2><p class="lead">Βιοτεχνολόγος με μεταπτυχιακά στη Μοριακή Μικροβιολογία, τη Βιομηχανική Χημεία και τη Γενετική. Εκατοντάδες μαθητές της σπουδάζουν σήμερα σε ιατρικές, οδοντιατρικές, φαρμακευτικές και πολυτεχνικές σχολές, στην Ελλάδα και την Ευρώπη.</p><div class="btns"><a class="btn btn--ink" href="${Ln.page("niki")}">Το βιογραφικό μου</a><a class="btn btn--line-ink" href="${Ln.page("online-mathimata")}">Online μαθήματα</a></div></div></div></section>
${homeFaq(state, ctx)}${feedbackBar(state, ctx)}`;
}

export const HOME_FAQ = [
  ["Είναι δωρεάν το υλικό;", "Ναι. Τα διαγωνίσματα, τα θέματα Πανελληνίων με τις απαντήσεις, οι ασκήσεις και η θεωρία ανοίγουν ελεύθερα, χωρίς εγγραφή. Μόνο το υλικό των βιβλίων και κάποιες ενότητες για τους μαθητές μου ανοίγουν με κωδικό."],
  ["Πού βρίσκω τα θέματα των Πανελληνίων;", "Στο «Υλικό», στο είδος «Θέματα & απαντήσεις Πανελληνίων», χρονιά προς χρονιά. Γράψε επίσης στην αναζήτηση «θέματα πανελληνίων» και τη χρονιά, π.χ. «θέματα πανελληνίων 2025»."],
  ["Πώς ανοίγει ένα υλικό με κωδικό;", "Γράψε τον κωδικό που σου έδωσα στο πλαίσιο της ανάρτησης ή του βιβλίου και πάτα «Ξεκλείδωσε». Η συσκευή σου τον θυμάται. Αν δεν τον έχεις, ζήτησέ τον με email."],
  ["Κάνεις online μαθήματα;", "Ναι. Ατομικά online μαθήματα Βιολογίας και Χημείας Λυκείου, Ανατομίας & Φυσιολογίας ΙΙ και Υγιεινής του ΕΠΑΛ, μέσω Microsoft Teams, σε όλη την Ελλάδα και το εξωτερικό, με μια πρώτη γνωριμία 20 λεπτών χωρίς δέσμευση."],
  ["Τι είναι η Celly;", "Η Celly είναι η βοηθός τεχνητής νοημοσύνης που έφτιαξα για τους μαθητές: λύνει ασκήσεις με πλήρη αιτιολόγηση, εξηγεί τη θεωρία βήμα βήμα και σε εξετάζει σαν διορθωτής, στα ελληνικά και στα αγγλικά."],
  ["Πώς βρίσκω μια παλιότερη ανάρτηση;", "Στο «Ιστορικό αναρτήσεων» διαλέγεις χρονιά και μήνα και βλέπεις ό,τι ανέβηκε τότε. Ή γράψε δυο λέξεις στην αναζήτηση: καταλαβαίνει και λάθη και greeklish."],
];
function homeFaq(state, ctx) {
  const st = state.settings; const Ln = links(ctx);
  return `<section class="sec sec--paper" id="faq"><div class="wrap faq-g"><div><p class="eyebrow">Συχνές ερωτήσεις</p><h2>Ό,τι ρωτάτε πιο συχνά</h2><div class="faq">${HOME_FAQ.map(([q, a], i) => `<details${i ? "" : " open"}><summary>${esc(q)}${icon("down")}</summary><p>${esc(a)}</p></details>`).join("")}</div></div>
<aside class="glance"><p class="eyebrow">Με μια ματιά</p><dl><dt>Ποια</dt><dd>Νικολέττα (Νίκη) Μαργαρίτη, βιοτεχνολόγος, MSc in Genetics, καθηγήτρια Βιολογίας & Χημείας, συγγραφέας</dd><dt>Μαθήματα</dt><dd>Βιολογία & Χημεία Λυκείου, Ανατομία & Φυσιολογία ΙΙ και Υγιεινή ΕΠΑΛ</dd><dt>Πού</dt><dd>Σύρος και Νάξος, και online σε όλη την Ελλάδα και το εξωτερικό</dd><dt>Γλώσσες</dt><dd>Ελληνικά, αγγλικά (IB & EB)</dd><dt>Βιβλία</dt><dd>Εκδόσεις Κόσμος και Λιβάνη</dd><dt>Επικοινωνία</dt><dd><a href="tel:${esc(st.phone.replace(/\s/g, ""))}">${esc(st.phone)}</a> · <a href="mailto:${esc(st.email)}">${esc(st.email)}</a></dd></dl><a class="btn btn--ink" href="${Ln.page("online-mathimata")}">Online μαθήματα</a></aside></div></section>`;
}
export function feedbackBar(state, ctx) {
  return `<section class="fbk" aria-label="Για πες"><div class="wrap"><form class="fbk-f" data-feedback><span class="fbk-who"><img src="${esc(links(ctx).asset(state.photos.niki.u))}" alt="" width="44" height="44" loading="lazy"><span><b>Νίκη Μαργαρίτη</b><small>Όλοι μαθαίνουμε από όλους! Πες μου τη γνώμη σου!</small></span></span>
<label class="sr" for="fbk-t">Το μήνυμά σου</label><input id="fbk-t" name="msg" type="text" maxlength="1500" placeholder="Για πες…" required><select name="who" aria-label="Είσαι"><option>Μαθητής</option><option>Φοιτητής</option><option>Γονέας</option><option>Καθηγητής</option></select><input type="text" name="hp" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true"><button class="btn btn--ink" type="submit">${icon("send")}<span>Στείλε</span></button><p class="fbk-ok" hidden role="status">Ευχαριστώ! Το διαβάζω σίγουρα.</p></form></div></section>`;
}

function postPage(state, ctx, p) {
  const Ln = links(ctx); const all = visible(state); const i = all.indexOf(p);
  const newer = i > 0 ? all[i - 1] : null, older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  const t = T(state, p.type);
  const files = (p.files || []).map((f, k) => fileCard(ctx, f, k)).join("");
  const rel = all.filter((x) => x !== p && x.type === p.type && (x.lvl || []).some((l) => (p.lvl || []).includes(l)) && (x.subj || []).some((s) => (p.subj || []).includes(s))).slice(0, 4);
  const lock = p.lock ? lockBox(p.lock, "ανάρτηση", p.id) : "";
  return `${crumbs(ctx, [["Υλικό", Ln.yliko()], [L(state, (p.lvl || [])[0]).t, Ln.lvl((p.lvl || [])[0])], [p.title]])}
<article class="post"><div class="wrap post-g"><div class="post-main"><header class="post-h"><p class="post-type"><a href="${Ln.type(p.type)}">${esc(t.t)}</a>${p.year ? " · " + p.year : ""}</p><h1>${esc(p.title)}</h1>
<p class="post-m"><span>${icon("cal")}<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></span>${p.upd ? `<span class="post-upd">ενημερώθηκε ${shortDate(p.upd)}</span>` : ""}<span class="post-chips">${chips(state, p)}</span></p></header>
${p.ex ? `<p class="post-lead">${esc(p.ex)}</p>` : ""}${p.body ? `<div class="prose">${p.body}</div>` : ""}${lock}
${files ? `<div class="files">${files}</div>` : ""}
<div class="post-share"><span>Μοιράσου το:</span><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((ctx.origin || "") + Ln.post(p))}" target="_blank" rel="noopener" aria-label="Facebook">${icon("fb")}</a><a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + " " + (ctx.origin || "") + Ln.post(p))}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon("chat")}</a><button type="button" data-copy="${esc((ctx.origin || "") + Ln.post(p))}">Αντιγραφή συνδέσμου</button></div>
<nav class="pn" aria-label="Χρονολογική πλοήγηση">${older ? `<a class="pn-o" href="${Ln.post(older)}"><small>${icon("back")} Προηγούμενη ανάρτηση · ${shortDate(older.date)}</small><b>${esc(older.title)}</b></a>` : "<span></span>"}${newer ? `<a class="pn-n" href="${Ln.post(newer)}"><small>Επόμενη ανάρτηση · ${shortDate(newer.date)} ${icon("arrow")}</small><b>${esc(newer.title)}</b></a>` : "<span></span>"}</nav></div>
<aside class="post-side"><div class="ps-box"><p class="ps-h">Μάθε κι αυτά</p>${rel.length ? rel.map((x) => `<a class="ps-l" href="${Ln.post(x)}"><b>${esc(x.title)}</b><small>${shortDate(x.date)}</small></a>`).join("") : `<p class="muted">Δες όλο το υλικό της τάξης σου.</p>`}<a class="lnk" href="${Ln.lvl((p.lvl || [])[0])}">Όλα για ${esc(L(state, (p.lvl || [])[0]).t)} ${icon("arrow")}</a></div>
<div class="ps-box ps-box--celly"><img src="${esc(Ln.asset(state.photos.cellyAvatar.u))}" alt="" width="54" height="54" loading="lazy"><p><b>Κόλλησες κάπου;</b> Ρώτα την Celly: σου εξηγεί τη λύση βήμα βήμα.</p><button type="button" class="btn btn--celly btn--sm" data-celly>Ρώτα την Celly</button></div></aside></div></article>`;
}
export function fileCard(ctx, f, k = 0) {
  const Ln = links(ctx); const u = Ln.file(f.u);
  return `<div class="fc"><button type="button" class="fc-v" data-view="${esc(u)}" data-title="${esc(f.t)}" aria-label="Άνοιγμα: ${esc(f.t)}">${f.th ? `<img src="${esc(Ln.file(f.th))}" alt="" width="${f.tw || 480}" height="${f.tht || 680}" loading="${k < 2 ? "eager" : "lazy"}">` : `<span class="fc-ph">${icon("file")}<b>${esc((f.x || "pdf").toUpperCase())}</b></span>`}<span class="fc-eye">${icon("eye")} Άνοιγμα</span></button>
<div class="fc-b"><b>${esc(f.t)}</b><small>${esc((f.x || "pdf").toUpperCase())}${f.n ? " · " + f.n + " σελίδες" : ""}${f.s ? " · " + fmtSize(f.s) : ""}</small><div class="fc-a"><button type="button" class="btn btn--ink btn--sm" data-view="${esc(u)}" data-title="${esc(f.t)}">${icon("eye")} Διάβασέ το</button><a class="btn btn--line-ink btn--sm" href="${esc(u)}" download>${icon("dl")} Λήψη</a></div></div></div>`;
}
function lockBox(lock, what, id) {
  const pending = lock.pending || !lock.enc;
  return `<div class="lock" data-lock='${esc(JSON.stringify({ id, enc: lock.enc || null, iv: lock.iv || null, salt: lock.salt || null, n: lock.n || 0 }))}'><div class="lock-ic">${icon("lock")}</div><div class="lock-b"><b>Αυτό το υλικό ανοίγει με κωδικό</b><p>${pending ? "Είναι για τους μαθητές και τους αναγνώστες των βιβλίων μου. Ζήτησέ μου τον κωδικό και θα σου τον στείλω." : "Γράψε τον κωδικό που σου έδωσα για να ανοίξουν τα αρχεία."}</p>
<form class="lock-f" data-unlock><label class="sr" for="lk-${esc(id)}">Κωδικός</label><input id="lk-${esc(id)}" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Κωδικός" required><button class="btn btn--ink" type="submit">${icon("unlock")} Ξεκλείδωσε</button></form><p class="lock-err" role="alert" hidden></p>
<a class="lock-ask" href="mailto:nikoletta.margariti@gmail.com?subject=${encodeURIComponent("Αίτημα κωδικού: " + what)}">Ζήτα τον κωδικό με email ${icon("arrow")}</a></div><div class="lock-out" hidden></div></div>`;
}

function booksPage(state, ctx) {
  const Ln = links(ctx); const bs = orderedBooks(state);
  const groups = [["Για το ΓΕΛ", (b) => !/ΕΠΑΛ/.test(b.grade || "") && b.kind !== "ebook" && b.kind !== "part"], ["Για το ΕΠΑΛ", (b) => /ΕΠΑΛ/.test(b.grade || "")], ["e-books", (b) => b.kind === "ebook"], ["Συμμετοχές", (b) => b.kind === "part"]];
  return `${pageHero("Συγγραφικό έργο", "Τα βιβλία μου", "Βιβλία για το Γενικό Λύκειο και το ΕΠΑΛ, από τις εκδόσεις Κόσμος και Λιβάνη, και e-books με τα θέματα των εξετάσεων. Άνοιξε ένα και δες τι περιέχει.")}
<section class="sec"><div class="wrap">${groups.map(([t, f]) => { const g = bs.filter(f); return g.length ? `<h2 class="grp">${esc(t)}</h2><div class="bks">${g.map((b, i) => bookCard(state, ctx, b, i)).join("")}</div>` : ""; }).join("")}</div></section>`;
}
function bookPage(state, ctx, b) {
  const Ln = links(ctx);
  const files = (b.files || []).map((f, k) => fileCard(ctx, f, k)).join("");
  return `${crumbs(ctx, [["Τα βιβλία μου", Ln.books], [b.title]])}<section class="bp"><div class="wrap bp-g">
<div class="bp-book" data-flip><div class="fl" style="aspect-ratio:${b.cover && b.cover.u ? (b.cover.w || 7) + "/" + (b.cover.h || 10) : "7/10"};--r:${b.cover && b.cover.u ? ((b.cover.w || 7) / (b.cover.h || 10)).toFixed(4) : ".7"}"><div class="fl-page fl-front">${coverHtml(b, ctx, "fl-cover")}</div><div class="fl-page fl-back">${b.back && b.back.u ? `<img src="${esc(Ln.asset(b.back.u))}" alt="Οπισθόφυλλο: ${esc(b.title)}" width="${b.back.w}" height="${b.back.h}" loading="lazy">` : `<div class="fl-toc"><p>Περιεχόμενα</p><ol>${(b.toc || []).map((t) => `<li>${esc(t)}</li>`).join("") || "<li>Θεωρία, ασκήσεις και διαγωνίσματα</li>"}</ol></div>`}</div></div>
<button type="button" class="btn btn--line-ink btn--sm fl-btn" data-flip-btn>${b.back && b.back.u ? "Δες το οπισθόφυλλο" : "Δες τα περιεχόμενα"}</button></div>
<div class="bp-t"><p class="eyebrow">${esc([b.grade, b.subj].filter(Boolean).join(" · "))}</p><h1>${esc(b.title)}</h1><p class="bp-meta">${esc(b.authors || "Νικολέττα Μαργαρίτη")}${b.publisher ? " · Εκδόσεις " + esc(b.publisher) : ""}${b.year ? " · " + esc(b.year) : ""}</p>
${b.summary ? md(b.summary) : ""}${(b.toc || []).length ? `<ul class="bp-toc">${b.toc.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
<div class="btns">${b.buy ? `<a class="btn btn--sun" href="${esc(b.buy)}" target="_blank" rel="noopener">Αγόρασέ το ${icon("arrow")}</a>` : ""}${b.sample ? `<button type="button" class="btn btn--ink" data-view="${esc(Ln.file(b.sample.u))}" data-title="${esc(b.title + ": " + b.sample.t)}">${icon("eye")} ${esc(b.sample.t)}</button>` : ""}<button type="button" class="btn btn--celly" data-celly>Ρώτα την Celly για το βιβλίο</button></div></div></div></section>
${b.lock || files ? `<section class="sec sec--paper"><div class="wrap"><h2 class="grp">Τα αρχεία του βιβλίου</h2>${b.lock ? lockBox(b.lock, b.title, b.id) : ""}${files ? `<div class="files">${files}</div>` : ""}</div></section>` : ""}
<section class="sec"><div class="wrap"><h2 class="grp">Κι άλλα βιβλία</h2><div class="bks">${orderedBooks(state).filter((x) => x !== b).slice(0, 5).map((x, i) => bookCard(state, ctx, x, i)).join("")}</div></div></section>`;
}
function histPage(state, ctx, y) {
  const Ln = links(ctx); const all = visible(state);
  const ys = [...new Set(all.map((p) => +p.date.slice(0, 4)))].sort((a, b) => b - a);
  const yr = y ? +y : null; const list = yr ? all.filter((p) => +p.date.slice(0, 4) === yr) : all;
  const byM = {}; list.forEach((p) => { const k = p.date.slice(0, 7); (byM[k] ||= []).push(p); });
  const tl = Object.keys(byM).sort().reverse().map((k) => { const [yy, mm] = k.split("-"); return `<section class="tl-m" id="m-${k}"><h2 class="tl-h"><span>${MONTHS[+mm - 1]}</span> ${yy}<small>${byM[k].length}</small></h2><ol class="tl-l">${byM[k].map((p) => `<li><time datetime="${esc(p.date)}">${new Date(p.date).getDate()}</time><a href="${Ln.post(p)}"><b>${esc(p.title)}</b><span>${esc(T(state, p.type).s)} · ${esc((p.lvl || []).map((l) => L(state, l).t).join(", "))}${p.lock ? " · με κωδικό" : ""}</span></a></li>`).join("")}</ol></section>`; }).join("");
  const months = Object.keys(byM).sort().reverse();
  return `${pageHero("Ιστορικό αναρτήσεων", yr ? "Οι αναρτήσεις του " + yr : "Όλες οι αναρτήσεις, ανά ημερομηνία", "Πήγαινε πίσω στον χρόνο: διάλεξε χρονιά και μήνα και βρες ό,τι ανέβηκε τότε.")}
<section class="sec hist"><div class="wrap hist-g"><aside class="hist-side"><nav class="yrs-nav" aria-label="Χρονιές"><a href="${Ln.hist()}"${!yr ? ' aria-current="page"' : ""}>Όλες</a>${ys.map((v) => `<a href="${Ln.hist(v)}"${v === yr ? ' aria-current="page"' : ""}>${v}<small>${all.filter((p) => +p.date.slice(0, 4) === v).length}</small></a>`).join("")}</nav>
<nav class="ms-nav" aria-label="Μήνες">${months.map((k) => `<a href="#m-${k}">${MONTHS[+k.slice(5) - 1].slice(0, 3)} ${k.slice(0, 4)}</a>`).join("")}</nav></aside><div class="tl">${tl}</div></div></section>`;
}
function searchPage(state, ctx, q) {
  return `${pageHero("Αναζήτηση", "Τι ψάχνεις;", "Γράψε όπως σου έρχεται: η αναζήτηση καταλαβαίνει και ορθογραφικά λάθη, χωρίς τόνους ή με greeklish.")}<section class="sec"><div class="wrap"><form class="hs hs--page" action="" method="get" role="search" data-hs data-full><label class="sr" for="sq">Αναζήτηση</label>${icon("search")}<input id="sq" name="q" type="search" value="${esc(q || "")}" placeholder="π.χ. «απαντησεις πανελληνιων 2024», «ανατομια επαλ»" autocomplete="off" spellcheck="false" autofocus><button class="btn btn--ink" type="submit">Βρες το</button></form><div class="sr-out" data-sr></div></div></section>`;
}

/* στατικές σελίδες */
export const PAGES = {
  niki: { t: "Ποια είμαι", e: "Νίκη Μαργαρίτη" }, "ti-nea": { t: "Τι νέα;", e: "Νίκη Μαργαρίτη" }, "ti-eipame-ti-kaname": { t: "Τι είπαμε; Τι κάναμε;", e: "Νίκη Μαργαρίτη" },
  "gia-pes": { t: "Για πες…", e: "Νίκη Μαργαρίτη" }, "online-mathimata": { t: "Online μαθήματα με τη Νίκη Μαργαρίτη", e: "Online μαθήματα" }, kathodigisi: { t: "Ολοκληρωμένο πακέτο καθοδήγησης", e: "Online μαθήματα" },
  "epaggelmatikos-prosanatolismos": { t: "Επαγγελματικός προσανατολισμός", e: "Online μαθήματα" }, celly: { t: "Celly", e: "Η βοηθός τεχνητής νοημοσύνης" },
  mathites: { t: "Είσαι μαθητής;", e: "Για μαθητές" }, "mathites/gel": { t: "Είσαι στο Γενικό Λύκειο", e: "Είσαι μαθητής;" }, "mathites/epal": { t: "Είσαι στο ΕΠΑΛ", e: "Είσαι μαθητής;" },
  "mathites/gymnasio": { t: "Είσαι στο Γυμνάσιο", e: "Είσαι μαθητής;" }, "mathites/ib-eb": { t: "Υποψήφιος IB / EB", e: "Είσαι μαθητής;" }, "mathites/foitites": { t: "Είσαι φοιτητής", e: "Είσαι μαθητής;" },
  "mathites/taxidepse-kai-mathe": { t: "Ταξίδεψε και μάθε", e: "Είσαι μαθητής;" }, "mathites/ola-xreiazontai": { t: "Όλα χρειάζονται!", e: "Είσαι μαθητής;" },
  kathigites: { t: "Είσαι καθηγητής;", e: "Για συναδέλφους" }, epikoinonia: { t: "Συνομιλία με τη συγγραφέα", e: "Επικοινωνία" },
  aporrito: { t: "Πολιτική απορρήτου & cookies", e: "Νομικά" }, "pnevmatiki-idioktisia": { t: "Πνευματική ιδιοκτησία", e: "Νομικά" },
};
function contactBlock(state) {
  const st = state.settings;
  return `<div class="cts"><a class="ct ct--coral" href="tel:${esc(st.phone.replace(/\s/g, ""))}"><small>Κινητό</small><b>${esc(st.phone)}</b></a>${st.phone2 ? `<a class="ct ct--sun" href="tel:${esc(st.phone2.replace(/\s/g, ""))}"><small>Σταθερό</small><b>${esc(st.phone2)}</b></a>` : ""}<a class="ct ct--leaf" href="mailto:${esc(st.email)}"><small>Email</small><b>${esc(st.email)}</b></a>${st.teams ? `<span class="ct ct--blue"><small>Microsoft Teams</small><b>${esc(st.teams)}</b></span>` : ""}</div>`;
}
function staticPage(state, ctx, k) {
  const Ln = links(ctx); const meta = PAGES[k]; const pg = (state.pages && state.pages[k]) || {}; const all = visible(state);
  let body = md(pg.body || ""); let extra = "";
  const lvlLinks = (lv, subs) => `<div class="lts lts--sm">${subs.map(([t, h, d]) => `<a class="lt lt--${["coral", "sun", "leaf", "blue", "violet"][Math.abs(t.length) % 5]}" href="${h}"><b>${esc(t)}</b><small>${esc(d)}</small>${icon("arrow")}</a>`).join("")}</div>`;
  if (k === "niki") {
    const paras = String(state.texts.bio || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
    const bib = state.texts.bibliography || [];
    const tag = (x) => /e-book/i.test(x) ? "e-book" : /Κόσμος/.test(x) ? "Εκδ. Κόσμος" : /Λιβάνη/.test(x) ? "Εκδ. Λιβάνη" : "Βιβλίο";
    const clean = (x) => x.replace(/\s*\((e-book|Εκδοτικός οίκος [^)]+)\)/gi, "").replace(/-(?=\S)/g, " – ");
    const st = state.settings;
    extra = `<div class="nk"><figure class="nk-ph"><img class="nk-img" src="${esc(Ln.asset(state.photos.niki2.u))}" alt="Η Νίκη Μαργαρίτη στο γραφείο της" width="${state.photos.niki2.w}" height="${state.photos.niki2.h}" loading="eager" decoding="async"><figcaption><b>Νικολέττα (Νίκη) Μαργαρίτη</b><span>Βιοτεχνολόγος · MSc in Genetics</span></figcaption></figure>
<div class="nk-t">${paras[0] ? `<p class="nk-lead">${esc(paras[0])}</p>` : ""}<ul class="nk-chips"><li>Μοριακή Μικροβιολογία</li><li>Βιομηχανική Χημεία</li><li>MSc in Genetics</li><li>Υπ. Διδάκτορας Μοριακής Βιολογίας – Γενωματικής</li></ul>${paras.slice(1).map((x) => `<p>${esc(x)}</p>`).join("")}</div></div>
<div class="nk-facts"><div class="nkf nkf--coral">${icon("cap")}<b>Εκατοντάδες μαθητές</b><span>σε ιατρικές, οδοντιατρικές, φαρμακευτικές, κτηνιατρικές, πολυτεχνικές και νομικές σχολές, στην Ελλάδα και στην Ευρώπη</span></div><div class="nkf nkf--leaf">${icon("pin")}<b>Σύρος · Νάξος · online</b><span>διδασκαλία σε όλη την Ελλάδα και στο εξωτερικό, με μαθητές από πολλά σχολεία</span></div><div class="nkf nkf--blue">${icon("book")}<b>Συγγραφέας</b><span>βιβλία Βιολογίας και Ανατομίας & Φυσιολογίας ΙΙ, στις εκδόσεις Κόσμος και Λιβάνη</span></div></div>
${bib.length ? `<div class="sec-h nk-bh"><div><p class="eyebrow">Συγγραφικό έργο</p><h2>Βιβλία και e-books</h2></div></div><ol class="nk-bib">${bib.map((x, n) => `<li><span class="nk-n">${String(n + 1).padStart(2, "0")}</span><span class="nk-bt">${esc(clean(x))}</span><em>${esc(tag(x))}</em></li>`).join("")}</ol>` : ""}
<div class="nk-cta"><div><p class="eyebrow">Επικοινωνία</p><h2>Θες να κάνουμε μάθημα;</h2>${st.hours ? `<p>${esc(st.hours)}</p>` : ""}</div><div class="btns"><a class="btn btn--ink" href="tel:${esc((st.phone || "").replace(/\s/g, ""))}">${icon("phone")} ${esc(st.phone || "")}</a><a class="btn btn--line-ink" href="${Ln.page("online-mathimata")}">Online μαθήματα</a><a class="btn btn--line-ink" href="${Ln.books}">Τα βιβλία μου</a></div></div>`;
  }
  if (k === "ti-nea") extra = `<div class="grid grid--4">${all.slice(0, 16).map((p) => postCard(state, ctx, p)).join("")}</div><div class="more"><a class="btn btn--ink" href="${Ln.hist()}">${icon("cal")} Όλο το ιστορικό</a></div>`;
  if (k === "ti-eipame-ti-kaname") extra = `<h2 class="grp">Επιστημονικά δίλεπτα: η επιστήμη στην αιχμή της</h2><div class="grid grid--4">${all.filter((p) => p.type === "arthra").map((p) => postCard(state, ctx, p)).join("")}</div>`;
  if (k === "gia-pes") extra = md(state.texts.feedback) + feedbackBar(state, ctx);
  if (k === "celly") {
    const items = String(state.texts.celly || "").split(/\n/).map((x) => x.replace(/^\s*[-*]\s*/, "").trim()).filter(Boolean);
    const ics = ["head", "check", "spark", "star", "book", "cap", "file"];
    const first = items[0] || "";
    extra = `<div class="celx celx--page"><span class="celx-img"><img src="${esc(Ln.asset(state.photos.celly.u))}" alt="Η Celly, η βοηθός τεχνητής νοημοσύνης" width="${state.photos.celly.w}" height="${state.photos.celly.h}" loading="eager" decoding="async"></span><div class="celx-t"><p class="eyebrow">Η βοηθός σου στη μελέτη</p><h2>Ρωτάς, κατανοείς, αριστεύεις.</h2><p class="lead">Η Celly είναι η βοηθός τεχνητής νοημοσύνης που έφτιαξε η Νίκη για τους μαθητές της: για Βιολογία, Χημεία, Ανατομία & Φυσιολογία και Υγιεινή, πάντα πάνω στο σχολικό βιβλίο.</p>${first ? `<p class="celx-hi">${icon("head")}<span>${esc(first)}</span></p>` : ""}<div class="btns"><button type="button" class="btn btn--ink" data-celly>Άνοιξε την Celly εδώ</button><a class="btn btn--line-ink" href="${esc(state.settings.celly)}" target="_blank" rel="noopener">Σε νέα καρτέλα ↗</a></div></div></div>
<div class="sec-h cf-h"><div><p class="eyebrow">Τι κάνει για σένα</p><h2>Μαζί της, η μελέτη γίνεται διάλογος</h2></div></div>
<div class="cf">${items.slice(1).map((x, n) => `<div class="cf-c cf-c--${["coral", "sun", "leaf", "blue", "violet", "teal"][n % 6]}"><span class="cf-i">${icon(ics[n + 1] || "spark")}</span><p>${esc(x)}</p></div>`).join("")}</div>
<div class="cs"><p class="eyebrow">Πώς ξεκινάς</p><ol class="cs-l"><li><b>Άνοιξε την Celly</b><span>από το κουμπί «Έχεις απορίες;» σε κάθε σελίδα ή από εδώ.</span></li><li><b>Πες ή γράψε την απορία σου</b><span>στα ελληνικά ή στα αγγλικά, όπως θα ρωτούσες στο μάθημα.</span></li><li><b>Μάθε βήμα βήμα</b><span>ζήτα εξήγηση, άσκηση ή ένα μικρό διαγώνισμα πάνω στην ύλη σου.</span></li></ol></div>`;
  }
  if (k === "kathigites") extra = `<div class="prose">${md(state.texts.teachers)}</div>`;
  if (k === "epaggelmatikos-prosanatolismos") extra = `<div class="prose">${md(state.texts.career)}</div>${contactBlock(state)}`;
  if (k === "online-mathimata" || k === "kathodigisi") extra = contactBlock(state);
  if (k === "epikoinonia") extra = `${state.texts.contactQuote ? `<blockquote class="qt">${esc(state.texts.contactQuote)}</blockquote>` : ""}${contactBlock(state)}${state.settings.address ? `<p class="addr">${icon("pin")}${esc(state.settings.address)}</p>` : ""}${feedbackBar(state, ctx)}`;
  if (k === "pnevmatiki-idioktisia") extra = `<div class="prose">${md(state.texts.copyright)}</div>`;
  if (k === "mathites") extra = lvlLinks(null, NAV.find((n) => n.k === "mathites").sub.map(([kk, t, d]) => [t, Ln.page(kk), d]));
  if (k === "mathites/gel") extra = ["g-lykeiou", "b-lykeiou", "a-lykeiou"].map((l) => `<h2 class="grp">Πας στην ${esc(L(state, l).t)}</h2>${lvlLinks(l, [["Βιολογία", Ln.lvl(l) + "?m=biologia", all.filter((p) => p.lvl.includes(l) && p.subj.includes("biologia")).length + " αναρτήσεις"], ["Χημεία", Ln.lvl(l) + "?m=chimeia", all.filter((p) => p.lvl.includes(l) && p.subj.includes("chimeia")).length + " αναρτήσεις"], ["Ολοκληρωμένο πακέτο καθοδήγησης", Ln.page("kathodigisi"), "Πλάνο και υποστήριξη ως τις εξετάσεις"]])}`).join("");
  if (k === "mathites/epal") extra = lvlLinks("epal", [["Ανατομία & Φυσιολογία ΙΙ", Ln.lvl("epal") + "?m=anatomia", all.filter((p) => p.lvl.includes("epal") && p.subj.includes("anatomia")).length + " αναρτήσεις"], ["Υγιεινή", Ln.lvl("epal") + "?m=ygieini", all.filter((p) => p.lvl.includes("epal") && p.subj.includes("ygieini")).length + " αναρτήσεις"], ["Το βιβλίο μου για το ΕΠΑΛ", Ln.book(state.books[0]), "Ανατομία & Φυσιολογία ΙΙ, εκδ. Κόσμος"]]);
  if (k === "mathites/ib-eb" || k === "mathites/foitites") extra = lvlLinks("", [["Βιολογία: θεωρία & κατανόηση", Ln.type("theoria") + "?m=biologia", "Γενετική, Μοριακή, Ανοσολογία"], ["Ανατομία & Φυσιολογία", Ln.subj("anatomia"), all.filter((p) => p.subj.includes("anatomia")).length + " αναρτήσεις"], ["Χημεία", Ln.subj("chimeia"), all.filter((p) => p.subj.includes("chimeia")).length + " αναρτήσεις"], ["Online μαθήματα", Ln.page("online-mathimata"), "Στα ελληνικά ή στα αγγλικά"]]);
  if (k === "mathites/gymnasio") extra = `<div class="grid grid--4">${all.filter((p) => p.lvl.includes("gymnasio")).map((p) => postCard(state, ctx, p)).join("")}</div>`;
  if (k === "mathites/ola-xreiazontai" && state.texts.studyFile) extra = `<div class="files">${fileCard(ctx, state.texts.studyFile)}</div>`;
  if (k === "aporrito") extra = privacyBody(state);
  const sub = k.startsWith("mathites/") ? [["Είσαι μαθητής;", Ln.page("mathites")], [meta.t]] : [[meta.t]];
  return `${crumbs(ctx, sub)}${pageHero(meta.e, esc(pg.title || meta.t), pg.lead ? esc(pg.lead) : "")}<section class="sec"><div class="wrap page">${body ? `<div class="prose">${body}</div>` : ""}${extra}</div></section>`;
}
function privacyBody(state) {
  const st = state.settings;
  return `<div class="prose"><p>Υπεύθυνη επεξεργασίας: Νικολέττα (Νίκη) Μαργαρίτη, ${esc(st.address)}, τηλ. ${esc(st.phone)}, ${esc(st.email)}.</p>
<h3>Τι συλλέγουμε</h3><p>Η σελίδα δεν χρησιμοποιεί cookies διαφήμισης ή παρακολούθησης και δεν φορτώνει τίποτα από άλλες εταιρείες όταν την ανοίγεις. Οι γραμματοσειρές και οι εικόνες φιλοξενούνται στον δικό μας χώρο.</p>
<h3>Φόρμα «Για πες…»</h3><p>Όταν μου στέλνεις μήνυμα, κρατάμε το κείμενο, την ιδιότητα που επέλεξες και την ημερομηνία, μόνο για να το διαβάσω και να βελτιώσω το site. Δεν ζητάμε όνομα ή email.</p>
<h3>Celly</h3><p>Η Celly είναι ξεχωριστή εφαρμογή (ai.nikimargariti.gr). Φορτώνεται μόνο όταν πατήσεις «Άνοιξε την Celly».</p>
<h3>Αποθήκευση στη συσκευή σου</h3><p>Για να μη γράφεις ξανά τον κωδικό ενός βιβλίου, αποθηκεύονται στοιχεία μόνο στη δική σου συσκευή (localStorage). Τα σβήνεις όποτε θέλεις από τις ρυθμίσεις του browser.</p>
<h3>Φιλοξενία</h3><p>Η σελίδα και τα αρχεία φιλοξενούνται σε πάροχο φιλοξενίας (hosting) που καταγράφει τεχνικά στοιχεία (διεύθυνση IP, ώρα) για την ασφάλεια της υπηρεσίας.</p>
<h3>Τα δικαιώματά σου</h3><p>Έχεις δικαίωμα πρόσβασης, διόρθωσης και διαγραφής των στοιχείων σου. Επικοινώνησε στο ${esc(st.email)}. Μπορείς επίσης να απευθυνθείς στην Αρχή Προστασίας Δεδομένων (dpa.gr).</p></div>`;
}

/* ---------- δρομολόγηση ---------- */
export function route(state, ctx, path, q = {}) {
  const Ln = links(ctx); const all = visible(state);
  let m;
  const desc = state.settings.description;
  if (path === "" || path === "index") return { key: "home", title: "Νίκη Μαργαρίτη | Καθηγήτρια Βιολογίας & Χημείας, θέματα Πανελληνίων", desc, body: homePage(state, ctx), cur: "home" };
  if (path === "yliko") return { key: "yliko", title: "Όλο το υλικό: Βιολογία, Χημεία, Ανατομία, Υγιεινή | Νίκη Μαργαρίτη", desc, cur: "yliko", body: `${pageHero("Εκπαιδευτικό υλικό", "Όλο το υλικό", "Διαγωνίσματα, θέματα Πανελληνίων, ασκήσεις και θεωρία. Φίλτραρε ανά τάξη, μάθημα και είδος.")}<section class="sec"><div class="wrap">${listing(state, ctx, { f: { l: q.t, m: q.m, e: q.e, q: q.q, o: q.o } })}</div></section>` };
  if ((m = path.match(/^yliko\/([a-z-]+)$/)) && state.subjects.find((s) => s.k === m[1])) { const s = S(state, m[1]); return { key: "subj", title: `${s.t}: διαγωνίσματα, θέματα, ασκήσεις | Νίκη Μαργαρίτη`, desc: `Όλο το υλικό ${s.t} της Νίκης Μαργαρίτη: διαγωνίσματα, θέματα Πανελληνίων, ασκήσεις και θεωρία.`, cur: "yliko", body: `${crumbs(ctx, [["Υλικό", Ln.yliko()], [s.t]])}${pageHero("Μάθημα", esc(s.t), all.filter((p) => p.subj.includes(s.k)).length + " αναρτήσεις με αρχεία για κάθε τάξη.")}<section class="sec"><div class="wrap">${listing(state, ctx, { f: { m: s.k, l: q.t, e: q.e } })}</div></section>` }; }
  if ((m = path.match(/^eidos\/([a-z-]+)$/)) && state.types.find((s) => s.k === m[1])) { const t = T(state, m[1]); return { key: "type", title: `${t.t} | Νίκη Μαργαρίτη`, desc: `${t.t} Βιολογίας, Χημείας, Ανατομίας και Υγιεινής, δωρεάν από τη Νίκη Μαργαρίτη.`, cur: "yliko", body: `${crumbs(ctx, [["Υλικό", Ln.yliko()], [t.t]])}${pageHero("Είδος υλικού", esc(t.t), "")}<section class="sec"><div class="wrap">${listing(state, ctx, { f: { e: t.k, l: q.t, m: q.m, y: q.y } })}</div></section>` }; }
  if ((m = path.match(/^taxi\/([a-z-]+)$/)) && state.levels.find((s) => s.k === m[1])) { const l = L(state, m[1]); return { key: "lvl", title: `${l.t}: Βιολογία & Χημεία, διαγωνίσματα και θέματα | Νίκη Μαργαρίτη`, desc: `Υλικό για ${l.t}: διαγωνίσματα, θέματα, ασκήσεις και θεωρία από τη Νίκη Μαργαρίτη.`, cur: "yliko", body: `${crumbs(ctx, [["Υλικό", Ln.yliko()], [l.t]])}${pageHero("Τάξη", esc(l.t), "")}<section class="sec"><div class="wrap">${listing(state, ctx, { f: { l: l.k, m: q.m, e: q.e } })}</div></section>` }; }
  if ((m = path.match(/^anartisi\/([a-z0-9-]+)$/))) { const p = all.find((x) => x.slug === m[1]) || state.posts.find((x) => x.slug === m[1]); if (p) return { key: "post", post: p, title: `${p.title} | Νίκη Μαργαρίτη`, desc: (p.ex || `${T(state, p.type).t} για ${(p.lvl || []).map((l) => L(state, l).t).join(", ")}.`).slice(0, 158), cur: "yliko", body: postPage(state, ctx, p), image: thumbOf(p) && Ln.file(thumbOf(p).th) }; }
  if (path === "vivlia") return { key: "books", title: "Τα βιβλία μου: Βιολογία, Ανατομία & Φυσιολογία | Νίκη Μαργαρίτη", desc: "Τα βιβλία της Νικολέττας Μαργαρίτη για τη Βιολογία του Λυκείου και την Ανατομία & Φυσιολογία ΙΙ του ΕΠΑΛ (εκδόσεις Κόσμος, Λιβάνη).", cur: "vivlia", body: booksPage(state, ctx) };
  if ((m = path.match(/^vivlia\/([a-z0-9-]+)$/))) { const b = state.books.find((x) => x.slug === m[1]); if (b) return { key: "book", book: b, title: `${b.title} | Νικολέττα Μαργαρίτη`, desc: (b.summary || b.title).replace(/\s+/g, " ").slice(0, 158), cur: "vivlia", body: bookPage(state, ctx, b), image: b.cover && Ln.asset(b.cover.u) }; }
  if (path === "istoriko" || (m = path.match(/^istoriko\/(20\d\d)$/))) return { key: "hist", title: (m ? "Αναρτήσεις " + m[1] : "Ιστορικό αναρτήσεων") + " | Νίκη Μαργαρίτη", desc, cur: "yliko", body: histPage(state, ctx, m && m[1]) };
  if (path === "anazitisi") return { key: "search", title: "Αναζήτηση | Νίκη Μαργαρίτη", desc, cur: "", body: searchPage(state, ctx, q.q), noindex: true };
  if (PAGES[path]) return { key: "page", title: `${(state.pages[path] && state.pages[path].title) || PAGES[path].t} | Νίκη Μαργαρίτη`, desc: (state.pages[path] && state.pages[path].lead) || desc, cur: path, body: staticPage(state, ctx, path) };
  return { key: "404", status: 404, title: "Δεν βρέθηκε | Νίκη Μαργαρίτη", desc, cur: "", noindex: true, body: `${pageHero("404", "Αυτή η σελίδα δεν υπάρχει", "Ίσως άλλαξε θέση. Δοκίμασε την αναζήτηση:")}<section class="sec"><div class="wrap">${searchPage(state, ctx, "").split('<section class="sec"><div class="wrap">')[1]}</section>` };
}

/* όλα τα paths για prerender & sitemap */
export function allPaths(state) {
  const p = ["", "yliko", "vivlia", "istoriko", "anazitisi"];
  state.subjects.forEach((s) => p.push("yliko/" + s.k)); state.types.forEach((t) => p.push("eidos/" + t.k)); state.levels.forEach((l) => p.push("taxi/" + l.k));
  visible(state).forEach((x) => p.push("anartisi/" + x.slug)); state.books.forEach((b) => p.push("vivlia/" + b.slug));
  [...new Set(visible(state).map((x) => x.date.slice(0, 4)))].forEach((y) => p.push("istoriko/" + y));
  Object.keys(PAGES).forEach((k) => p.push(k));
  return p;
}

/* ---------- ολόκληρη η σελίδα ---------- */
export function schema(state, ctx, r) {
  const st = state.settings; const origin = ctx.origin || ""; const Ln = links(ctx);
  const person = { "@type": "Person", "@id": origin + "/#niki", name: "Νίκη Μαργαρίτη", alternateName: ["Νικολέττα Μαργαρίτη", "Niki Margariti", "Nikoletta Margariti"], jobTitle: "Καθηγήτρια Βιολογίας και Χημείας, συγγραφέας", email: "mailto:" + st.email, telephone: "+30" + st.phone.replace(/\s/g, ""), image: origin + Ln.asset(state.photos.niki.u), knowsAbout: ["Βιολογία", "Χημεία", "Ανατομία και Φυσιολογία ΙΙ", "Υγιεινή", "Πανελλήνιες εξετάσεις", "Γενετική", "Μοριακή Βιολογία"], url: origin + ctx.base };
  person.hasCredential = [{ "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "MSc in Genetics" }, { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "Μεταπτυχιακές σπουδές στη Μοριακή Μικροβιολογία" }, { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "Μεταπτυχιακές σπουδές στη Βιομηχανική Χημεία" }];
  person.knowsLanguage = ["el", "en"]; person.worksFor = { "@id": origin + "/#biz" };
  const sameAs = ["facebook", "instagram", "x", "linkedin", "tiktok", "youtube"].map((k) => st[k]).filter(Boolean);
  if (sameAs.length) person.sameAs = sameAs;
  const biz = { "@type": ["LocalBusiness", "EducationalOrganization"], "@id": origin + "/#biz", name: "Νίκη Μαργαρίτη · Μαθήματα Βιολογίας & Χημείας", alternateName: "Niki Margariti Biology & Chemistry", description: st.description, url: origin + ctx.base, image: origin + Ln.asset("assets/img/og.jpg"), telephone: "+30" + st.phone.replace(/\s/g, ""), email: st.email, founder: { "@id": origin + "/#niki" },
    address: { "@type": "PostalAddress", streetAddress: "Εμμ. Ροΐδη 13", addressLocality: "Ερμούπολη", addressRegion: "Σύρος", postalCode: "84100", addressCountry: "GR" }, areaServed: ["Σύρος", "Νάξος", "Ελλάδα"], knowsAbout: person.knowsAbout, knowsLanguage: ["el", "en"], ...(sameAs.length ? { sameAs } : {}) };
  const g = [{ "@type": "WebSite", "@id": origin + "/#site", name: "Νίκη Μαργαρίτη · Deep Learning Βιολογία & Χημεία", alternateName: ["nikimargariti.gr", "Niki Margariti"], url: origin + ctx.base, inLanguage: "el", publisher: { "@id": origin + "/#niki" }, potentialAction: { "@type": "SearchAction", target: origin + Ln.search() + "?q={q}", "query-input": "required name=q" } }, person, biz];
  if (r.key === "home") g.push({ "@type": "FAQPage", mainEntity: HOME_FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  if (r.key === "post") { const p = r.post; g.push({ "@type": "LearningResource", name: p.title, headline: p.title, datePublished: p.date, dateModified: p.upd || p.date, author: { "@id": origin + "/#niki" }, inLanguage: "el", learningResourceType: T(state, p.type).t, educationalLevel: (p.lvl || []).map((l) => L(state, l).t).join(", "), about: (p.subj || []).map((s) => S(state, s).t), isAccessibleForFree: !p.lock, url: origin + Ln.post(p), ...(p.files && p.files.length ? { encoding: p.files.map((f) => ({ "@type": "MediaObject", name: f.t, encodingFormat: "application/pdf", contentUrl: Ln.file(f.u) })) } : {}) }); }
  if (r.key === "book") { const b = r.book; g.push({ "@type": "Book", name: b.title, author: { "@type": "Person", name: b.authors || "Νικολέττα Μαργαρίτη" }, publisher: b.publisher ? { "@type": "Organization", name: "Εκδόσεις " + b.publisher } : undefined, datePublished: b.year || undefined, inLanguage: "el", image: b.cover ? origin + Ln.asset(b.cover.u) : undefined, description: b.summary || undefined, educationalLevel: b.grade }); }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": g });
}
export function docHtml(state, ctx, r, opt = {}) {
  const Ln = links(ctx); const origin = ctx.origin || ""; const v = opt.v || "1";
  const canon = origin && r.canon !== false ? origin + (ctx.canonPath || "") : "";
  return `<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cut">
<title>${esc(r.title)}</title><meta name="description" content="${esc(r.desc)}"><meta name="robots" content="${r.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}">
<script id="advon-draft-guard">(function(){var h=location.hostname;if(/drafts\\.advonmedia\\.com$|github\\.io$|netlify\\.app$/.test(h)){var m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow';document.head.appendChild(m)}})();</script>
${canon ? `<link rel="canonical" href="${esc(canon)}">` : ""}<meta property="og:type" content="${r.key === "post" ? "article" : "website"}"><meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.desc)}"><meta property="og:locale" content="el_GR"><meta property="og:site_name" content="Νίκη Μαργαρίτη">
<meta property="og:image" content="${esc(r.image && /^https?:/.test(r.image) ? r.image : origin + (r.image || Ln.asset("assets/img/og.jpg")))}">${canon ? `<meta property="og:url" content="${esc(canon)}">` : ""}<meta name="theme-color" content="#fbf6ea">
<link rel="preload" href="${Ln.asset("assets/fonts/inter-tight-greek-800-normal.woff2")}" as="font" type="font/woff2" crossorigin>${opt.css ? `<style>${opt.css.replace(/__BASE__/g, ctx.base)}</style>` : `<link rel="stylesheet" href="${Ln.asset("assets/css/site.css")}?v=${v}">`}
<!-- advon-icons --><link rel="icon" href="${Ln.asset("favicon.ico")}?v=246b6eda" sizes="32x32"><link rel="icon" href="${Ln.asset("assets/icons/favicon.svg")}?v=246b6eda" type="image/svg+xml"><link rel="icon" href="${Ln.asset("assets/icons/favicon-96.png")}?v=246b6eda" type="image/png" sizes="96x96"><link rel="icon" href="${Ln.asset("assets/icons/favicon-48.png")}?v=246b6eda" type="image/png" sizes="48x48"><link rel="apple-touch-icon" href="${Ln.asset("assets/icons/apple-touch-icon.png")}?v=246b6eda"><link rel="manifest" href="${Ln.asset("site.webmanifest")}?v=246b6eda"><!-- /advon-icons -->
<link rel="alternate" type="application/rss+xml" title="Νίκη Μαργαρίτη" href="${Ln.asset("rss.xml")}">
<script type="application/ld+json">${schema(state, ctx, r).replace(/</g, "\\u003c")}</script>
<script>window.NM={base:${JSON.stringify(ctx.base)},files:${JSON.stringify(state.settings.filesBase)},mode:${JSON.stringify(ctx.mode)},page:${JSON.stringify(r.key)},v:${JSON.stringify(v)}}</script></head>
<body class="pg-${esc(r.key)}"><a class="skip" href="#main">Μετάβαση στο περιεχόμενο</a>${r.key === "home" ? header(state, ctx, r.cur).split('class="logo" href="' + links(ctx).home + '"').join('class="logo" href="#top"') : header(state, ctx, r.cur)}<main id="main">${r.body}</main>${r.key === "home" ? footer(state, ctx).split('class="logo" href="' + links(ctx).home + '"').join('class="logo" href="#top"') : footer(state, ctx)}${bubbles(state, ctx)}
<script src="${Ln.asset("assets/js/site.js")}?v=${v}" defer></script></body></html>`;
}

/* ευρετήριο αναζήτησης + ελαφριά λίστα αναρτήσεων (ίδιο στο build και στο live) */
const plainText = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
export function searchIndex(state, v = "") {
  const Lk = lookups(state); const docs = []; const vis = visible(state);
  for (const p of vis) docs.push({ g: "p", id: p.id, t: p.title, u: "anartisi/" + p.slug + "/", d: String(p.date).slice(0, 10), y: p.year || "", e: Lk.T(p.type).t, c: (p.subj || []).map((k) => Lk.S(k).t).join(" "), k: [(p.lvl || []).map((k) => Lk.L(k).t).join(" "), (p.cats || []).join(" "), p.ex || "", plainText(p.body).slice(0, 400)].join(" "), f: (p.files || []).map((f) => f.t).join(" "), th: ((p.files || []).find((f) => f.th) || {}).th || "", lk: p.lock ? 1 : 0 });
  for (const b of state.books.filter((x) => !x.hidden)) docs.push({ g: "b", id: b.id, t: b.title, u: "vivlia/" + b.slug + "/", e: "Βιβλίο", c: b.subj || "", k: [b.grade, b.publisher, b.authors, b.summary, (b.toc || []).join(" ")].join(" "), f: (b.files || []).map((f) => f.t).join(" "), cv: (b.cover && b.cover.u) || "" });
  for (const [k, m] of Object.entries(PAGES)) { const pg = (state.pages || {})[k] || {}; docs.push({ g: "s", id: k, t: pg.title || m.t, u: k + "/", e: m.e, c: "", k: [pg.lead, plainText(md(pg.body || "")).slice(0, 500)].join(" "), f: "" }); }
  const posts = vis.map((p) => ({ id: p.id, slug: p.slug, title: p.title, date: p.date, subj: p.subj, lvl: p.lvl, type: p.type, year: p.year || undefined, lock: p.lock ? 1 : undefined, files: (p.files || []).map((f) => ({ th: f.th, tw: f.tw, tht: f.tht, n: f.n })) }));
  return { v, docs, posts, state: { subjects: state.subjects, levels: state.levels, types: state.types, settings: { filesBase: state.settings.filesBase } } };
}
export function rssXml(state, abs) {
  const vis = visible(state);
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Νίκη Μαργαρίτη</title><link>${abs("")}</link><description>${esc(state.settings.description)}</description><language>el</language>${vis.slice(0, 40).map((p) => `<item><title>${esc(p.title)}</title><link>${abs("anartisi/" + p.slug + "/")}</link><guid>${abs("anartisi/" + p.slug + "/")}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate>${p.ex ? `<description>${esc(p.ex)}</description>` : ""}</item>`).join("")}</channel></rss>`;
}
export function sitemapXml(state, abs) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPaths(state).filter((p) => p !== "anazitisi").map((p) => `<url><loc>${abs(p ? p + "/" : "")}</loc></url>`).join("\n")}\n</urlset>\n`;
}
