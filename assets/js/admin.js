/* Πίνακας διαχείρισης · Νίκη Μαργαρίτη
   Ό,τι αλλάζει εδώ γράφεται με «Δημοσίευση» στο live (Netlify Blobs) και φαίνεται αμέσως στο site, χωρίς deploy.
   Στο draft (drafts.advonmedia.com) δουλεύει σε δοκιμαστική λειτουργία: αποθηκεύει μόνο σε αυτόν τον browser. */
import * as S from "./shared.mjs";
const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
const esc = S.esc;
const BASE = location.pathname.replace(/[^/]*$/, "");
const TRIAL = /drafts\.advonmedia\.com$|github\.io$|^localhost$|^127\./.test(location.hostname);
let PASS = "", ST = null, SAVED = "", FB = [], META = false, VIEW = "home", EDIT = null;
const LS = "nm-admin-draft-v1";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString();
const toast = (t, bad) => { const e = $("#toast"); e.textContent = t; e.className = "toast" + (bad ? " is-bad" : ""); e.hidden = false; clearTimeout(e._t); e._t = setTimeout(() => (e.hidden = true), 3400); };
const SL = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const slugify = (t) => { const M = { α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o" }; return SL(t).replace(/ου/g, "ou").replace(/αι/g, "ai").replace(/ει/g, "ei").replace(/οι/g, "oi").replace(/μπ/g, "b").replace(/ντ/g, "nt").replace(/[α-ω]/g, (c) => M[c] || "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "anartisi"; };
const uniqSlug = (s, id) => { let x = s, i = 2; while (ST.posts.some((p) => p.slug === x && p.id !== id)) x = s + "-" + i++; return x; };
const ic = (n) => S.icon(n);
const dirty = () => JSON.stringify(ST) !== SAVED;
function mark() { const on = dirty(); $("#pubB").disabled = !on; $("#saveS").textContent = on ? "Υπάρχουν αλλαγές που δεν δημοσιεύτηκαν" : "Όλα δημοσιευμένα"; $("#saveS").classList.toggle("is-on", on); try { localStorage.setItem(LS, JSON.stringify({ at: today(), state: ST })); } catch (e) {} }
addEventListener("beforeunload", (e) => { if (ST && dirty() && !TRIAL) { e.preventDefault(); e.returnValue = ""; } });

/* ---------------- είσοδος ---------------- */
async function api(action, extra = {}) {
  const r = await fetch(BASE + "api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pass: PASS, action, ...extra }) });
  const j = await r.json().catch(() => ({ ok: false })); if (!j.ok) throw new Error(j.error || r.status); return j;
}
if (TRIAL) { $("#trialB").hidden = false; $("#loginP").textContent = "Αυτή είναι η προεπισκόπηση. Δοκίμασε ελεύθερα τον πίνακα: τίποτα δεν χαλάει."; $("#pw").required = false; }
$("#trialB").addEventListener("click", () => start(true));
$("#loginF").addEventListener("submit", async (e) => {
  e.preventDefault(); if (TRIAL && !$("#pw").value) return start(true);
  PASS = $("#pw").value; $("#loginE").hidden = true;
  try { const j = await api("load"); ST = j.state; FB = j.feedback || []; META = j.meta; SAVED = JSON.stringify(ST); start(false); }
  catch (er) { $("#loginE").hidden = false; $("#loginE").textContent = String(er.message) === "pass" ? "Λάθος κωδικός. Δοκίμασε ξανά." : "Δεν βρέθηκε σύνδεση με τον server" + (TRIAL ? "· μπες σε δοκιμαστική λειτουργία." : "."); }
});
async function start(trial) {
  if (trial) {
    const base = await fetch(BASE + "assets/data/state.json?v=" + Date.now()).then((r) => r.json());
    SAVED = JSON.stringify(base); let saved = null; try { saved = JSON.parse(localStorage.getItem(LS) || "null"); } catch (e) {}
    ST = saved && saved.state ? saved.state : base;
    try { FB = JSON.parse(localStorage.getItem("nm-fb-demo") || "[]").map((x, i) => ({ id: "d" + i, read: false, ...x })); } catch (e) { FB = []; }
    $("#trialBar").hidden = false; $("#modeL").textContent = "Δοκιμαστική λειτουργία";
  } else $("#modeL").textContent = "Συνδεδεμένη · live";
  norm(ST); if (trial) SAVED = JSON.stringify(norm(JSON.parse(SAVED))); else SAVED = JSON.stringify(ST);
  $("#login").hidden = true; $("#app").hidden = false; tabs(); go(location.hash.slice(1) || "home"); mark();
}

function norm(s) {
  s.social ||= { connected: false, auto: true, queue: [], log: [] }; s.trash ||= []; s.pages ||= {}; s.texts ||= {};
  for (const o of s.posts.concat(s.books)) if (o.lock && !o.lock.files) { o.lock.files = (o.files || []).splice(0); }
  return s;
}
/* ---------------- πλοήγηση ---------------- */
const TABS = [["home", "Αρχική", "home"], ["posts", "Αναρτήσεις", "file"], ["books", "Βιβλία", "book"], ["pages", "Σελίδες & κείμενα", "star"], ["social", "Social (Meta)", "send"], ["podcast", "Ηχητικός οδηγός", "head"], ["msgs", "Μηνύματα", "chat"], ["settings", "Ρυθμίσεις", "spark"]];
function tabs() { const un = FB.filter((x) => !x.read).length; $("#tabs").innerHTML = TABS.map(([k, t, i]) => `<a href="#${k}" data-v="${k}" class="${VIEW === k ? "is-on" : ""}">${ic(i)}<span>${t}</span>${k === "msgs" && un ? `<em>${un}</em>` : ""}${k === "social" && (ST.social.queue || []).length ? `<em class="q">${ST.social.queue.length}</em>` : ""}</a>`).join(""); }
addEventListener("hashchange", () => go(location.hash.slice(1) || "home"));
function go(v) { const [k, id] = v.split("/"); VIEW = TABS.some((t) => t[0] === k) ? k : "home"; EDIT = id || null; tabs(); render(); scrollTo(0, 0); }
function render() { const f = { home: vHome, posts: EDIT ? vPost : vPosts, books: EDIT ? vBook : vBooks, pages: EDIT ? vPage : vPages, social: vSocial, podcast: vPod, msgs: vMsgs, settings: vSettings }[VIEW]; $("#view").innerHTML = f(); bind[VIEW] && bind[VIEW](); }
const bind = {};
const L = () => S.lookups(ST);
const vis = () => ST.posts.filter((p) => !p.empty);
const fmt = (x) => { const t = new Date(x); return isNaN(t) ? "" : t.toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" }); };
const head = (t, sub, act = "") => `<header class="vh"><div><h1>${t}</h1>${sub ? `<p>${sub}</p>` : ""}</div><div class="vh-a">${act}</div></header>`;

/* ---------------- Αρχική ---------------- */
function vHome() {
  const P = ST.settings.potd || (ST.settings.potd = { mode: "latest", id: "", note: "" });
  const all = vis().filter((p) => !p.draft); const cur = P.mode === "pick" ? ST.posts.find((p) => p.id === P.id) : all.find((p) => !p.lock && (p.files || []).length);
  const books = S.orderedBooks(ST).concat(ST.books.filter((b) => b.hidden));
  return head("Καλημέρα, Νίκη", "Ό,τι αλλάζεις εδώ φαίνεται στο site με ένα πάτημα στο «Δημοσίευση».", `<a class="b b--ink" href="#posts/new">${ic("file")} Νέα ανάρτηση</a>`)
  + `<div class="kp"><a href="#posts"><b>${all.length}</b><span>αναρτήσεις</span></a><a href="#books"><b>${ST.books.length}</b><span>βιβλία</span></a><a href="#msgs"><b>${FB.filter((x) => !x.read).length}</b><span>νέα μηνύματα</span></a><a href="#social"><b>${(ST.social.queue || []).length}</b><span>για τα social</span></a></div>
  <section class="card"><h2>${ic("star")} Post ημέρας</h2><p class="hint">Το πλαίσιο αριστερά στην αρχική σελίδα. Διάλεξε τι δείχνει ή κλείσ' το.</p>
  <div class="seg" role="radiogroup">${[["latest", "Αυτόματα το πιο πρόσφατο"], ["pick", "Διαλέγω εγώ"], ["off", "Κρυφό"]].map(([k, t]) => `<label><input type="radio" name="potd" value="${k}"${P.mode === k ? " checked" : ""}><span>${t}</span></label>`).join("")}</div>
  <div class="potd-pick"${P.mode === "pick" ? "" : " hidden"}><label class="f"><span>Ανάρτηση</span><input list="postsDL" id="potdQ" placeholder="Γράψε για να βρεις…" value="${esc(cur && P.mode === "pick" ? cur.title : "")}"><datalist id="postsDL">${all.slice(0, 400).map((p) => `<option value="${esc(p.title)}">`).join("")}</datalist></label></div>
  <label class="f"><span>Μικρό σημείωμα (προαιρετικό)</span><input id="potdN" maxlength="140" value="${esc(P.note || "")}" placeholder="π.χ. Ιδανικό για επανάληψη πριν τις εξετάσεις!"></label>
  ${cur && P.mode !== "off" ? `<p class="now">Τώρα δείχνει: <b>${esc(cur.title)}</b></p>` : ""}</section>
  <section class="card"><h2>${ic("spark")} Ανακοίνωση στην κορυφή</h2><p class="hint">Μια γραμμή πάνω από το μενού σε όλες τις σελίδες. Άδειο = δεν φαίνεται. Για σύνδεσμο γράψε [κείμενο](διεύθυνση).</p><label class="f"><span>Κείμενο</span><input id="ann" maxlength="200" value="${esc(ST.settings.announce || "")}" placeholder="π.χ. Ανέβηκαν τα θέματα των Πανελληνίων 2026!"></label></section>
  <section class="card"><h2>${ic("book")} Τα βιβλία στην αρχική</h2><p class="hint">Με αυτή τη σειρά εναλλάσσονται στο πλαίσιο δεξιά και στη βιτρίνα. Τα πρώτα 5 φαίνονται στη βιτρίνα.</p>
  <ol class="ord" id="bkOrd">${books.map((b) => `<li data-id="${esc(b.id)}"${b.hidden ? ' class="is-off"' : ""}><span class="ord-c">${b.cover && b.cover.u ? `<img src="${esc(BASE + b.cover.u)}" alt="">` : ""}</span><b>${esc(b.title)}</b>${b.hidden ? "<small>κρυφό</small>" : ""}<span class="ord-a"><button type="button" data-mv="-1" aria-label="Πάνω">↑</button><button type="button" data-mv="1" aria-label="Κάτω">↓</button></span></li>`).join("")}</ol></section>`;
}
bind.home = () => {
  const P = ST.settings.potd;
  $$("input[name=potd]").forEach((r) => r.addEventListener("change", () => { P.mode = r.value; $(".potd-pick").hidden = r.value !== "pick"; mark(); }));
  $("#potdQ").addEventListener("change", (e) => { const p = ST.posts.find((x) => x.title === e.target.value); if (p) { P.id = p.id; mark(); toast("Post ημέρας: " + p.title); } });
  $("#potdN").addEventListener("input", (e) => { P.note = e.target.value; mark(); });
  $("#ann").addEventListener("input", (e) => { ST.settings.announce = e.target.value; mark(); });
  $("#bkOrd").addEventListener("click", (e) => { const b = e.target.closest("[data-mv]"); if (!b) return; const li = b.closest("li"); const o = $$("#bkOrd li").map((x) => x.dataset.id); const i = o.indexOf(li.dataset.id), j = i + +b.dataset.mv; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; ST.settings.bookOrder = o; mark(); render(); });
};

/* ---------------- Αναρτήσεις ---------------- */
let PF = { q: "", l: "", m: "", e: "", n: 60 };
function vPosts() {
  const Lk = L(); let items = ST.posts.filter((p) => !p.empty);
  const q = SL(PF.q.trim());
  items = items.filter((p) => (!PF.l || (p.lvl || []).includes(PF.l)) && (!PF.m || (p.subj || []).includes(PF.m)) && (!PF.e || p.type === PF.e) && (!q || SL(p.title + " " + (p.ex || "")).includes(q)));
  const opt = (arr, v, all) => `<option value="">${all}</option>` + arr.map((x) => `<option value="${x.k}"${v === x.k ? " selected" : ""}>${esc(x.t)}</option>`).join("");
  return head("Αναρτήσεις", `${items.length} από ${ST.posts.length}. Πάτα μια ανάρτηση για να την αλλάξεις.`, `<a class="b b--ink" href="#posts/new">${ic("file")} Νέα ανάρτηση</a>`)
  + `<div class="flt"><label class="f f--q">${ic("search")}<input id="pq" type="search" placeholder="Βρες ανάρτηση…" value="${esc(PF.q)}"></label><select id="pl">${opt(ST.levels, PF.l, "Όλες οι τάξεις")}</select><select id="pm">${opt(ST.subjects, PF.m, "Όλα τα μαθήματα")}</select><select id="pe">${opt(ST.types, PF.e, "Όλα τα είδη")}</select></div>
  <div class="rows">${items.slice(0, PF.n).map((p) => { const th = (p.files || []).find((f) => f.th); return `<a class="row${p.draft ? " is-draft" : ""}" href="#posts/${esc(p.id)}"><span class="row-t">${th ? `<img src="${esc(S.links({ base: BASE, state: ST }).file(th.th))}" alt="" loading="lazy">` : `<i>${ic(p.lock ? "lock" : "file")}</i>`}</span><span class="row-b"><b>${esc(p.title)}</b><small>${fmt(p.date)} · ${esc(Lk.T(p.type).s)} · ${esc((p.lvl || []).map((x) => Lk.L(x).t).join(", "))}${(p.files || []).length ? " · " + p.files.length + " αρχεία" : ""}${p.lock ? " · με κωδικό" + (p.lock.code ? "" : " (χωρίς κωδικό ακόμη)") : ""}${p.draft ? " · <em>πρόχειρο</em>" : ""}</small></span>${ic("arrow")}</a>`; }).join("")}</div>
  ${items.length > PF.n ? `<div class="more"><button class="b b--line" type="button" id="pMore">Δείξε κι άλλες</button></div>` : ""}
  ${(ST.trash || []).length ? `<details class="card trash"><summary>Κάδος (${ST.trash.length})</summary>${ST.trash.map((p) => `<div class="tr"><span>${esc(p.title)}</span><button class="b b--line b--sm" type="button" data-rs="${esc(p.id)}">Επαναφορά</button></div>`).join("")}</details>` : ""}`;
}
bind.posts = () => {
  if (EDIT) return bindPost();
  let t; $("#pq").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { PF.q = e.target.value; PF.n = 60; render(); const i = $("#pq"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 200); });
  [["#pl", "l"], ["#pm", "m"], ["#pe", "e"]].forEach(([s, k]) => $(s).addEventListener("change", (e) => { PF[k] = e.target.value; render(); }));
  const m = $("#pMore"); m && m.addEventListener("click", () => { PF.n += 60; render(); });
  $$("[data-rs]").forEach((b) => b.addEventListener("click", () => { const i = ST.trash.findIndex((x) => x.id === b.dataset.rs); const p = ST.trash.splice(i, 1)[0]; delete p.deleted; ST.posts.unshift(p); sortPosts(); mark(); render(); toast("Επανήλθε: " + p.title); }));
};
const sortPosts = () => ST.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
function chipSet(name, arr, sel, multi = true) { return `<div class="chips" data-chips="${name}">${arr.map((x) => `<label><input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${x.k}"${(multi ? sel.includes(x.k) : sel === x.k) ? " checked" : ""}><span${x.c ? ` style="--c:${x.c}"` : ""}>${esc(x.t)}</span></label>`).join("")}</div>`; }
function filesEd(list, key) {
  return `<div class="fl" data-files="${key}">${list.map((f, i) => `<div class="fi" data-i="${i}"><span class="fi-t">${f.th ? `<img src="${esc(S.links({ base: BASE, state: ST }).file(f.th))}" alt="">` : ic("file")}</span><div class="fi-b"><input data-ft="${i}" value="${esc(f.t)}" aria-label="Τίτλος αρχείου"><small>${esc((f.x || "pdf").toUpperCase())}${f.n ? " · " + f.n + " σελ." : ""}${f.s ? " · " + S.fmtSize(f.s) : ""}${String(f.u).startsWith("blob:") ? " · <em>μόνο για δοκιμή</em>" : ""}</small></div><span class="fi-a"><button type="button" data-fv="${i}" aria-label="Δες το">${ic("eye")}</button><button type="button" data-fm="${i}" data-d="-1" aria-label="Πάνω">↑</button><button type="button" data-fm="${i}" data-d="1" aria-label="Κάτω">↓</button><button type="button" data-fx="${i}" aria-label="Αφαίρεση">${ic("x")}</button></span></div>`).join("")}
  <label class="drop"><input type="file" accept="application/pdf,image/*" multiple data-up="${key}"><b>${ic("dl")} Πρόσθεσε αρχεία</b><span>Σύρε εδώ τα PDF ή πάτα για να τα διαλέξεις · έως 20 MB το καθένα</span></label></div>`;
}
function lockEd(lock, what) {
  const on = !!lock;
  return `<section class="card"><h2>${ic("lock")} Κωδικός</h2><label class="sw"><input type="checkbox" id="lkOn"${on ? " checked" : ""}><span></span>Τα αρχεία ${what} ανοίγουν μόνο με κωδικό</label>
  <div class="lk"${on ? "" : " hidden"}><label class="f"><span>Κωδικός για τους μαθητές</span><input id="lkCode" value="${esc((lock && lock.code) || "")}" placeholder="π.χ. BIO2026" autocomplete="off" spellcheck="false"></label><p class="hint">Δεν έχουν σημασία κεφαλαία/μικρά ή κενά. Τα αρχεία παρακάτω κρύβονται και ανοίγουν μόνο με τον κωδικό. ${lock && !lock.code ? "<b>Δεν έχει οριστεί ακόμη κωδικός.</b>" : ""}</p></div></section>`;
}
function vPost() {
  const isNew = EDIT === "new"; let p = isNew ? null : ST.posts.find((x) => x.id === EDIT);
  if (!p && !isNew) return head("Δεν βρέθηκε", "", `<a class="b b--line" href="#posts">Πίσω</a>`);
  if (isNew) { p = { id: "n" + uid(), slug: "", title: "", date: today(), subj: ["biologia"], lvl: ["g-lykeiou"], type: "diagonismata", ex: "", files: [], body: "", draft: false, _new: true }; ST.posts.unshift(p); EDIT = p.id; history.replaceState(null, "", "#posts/" + p.id); }
  const lk = p.lock; const fl = lk ? lk.files : p.files;
  return head(p.title ? "Επεξεργασία" : "Νέα ανάρτηση", p.slug ? `<a href="${esc(BASE + "anartisi/" + p.slug + "/")}" target="_blank" rel="noopener">${esc("/anartisi/" + p.slug + "/")} ↗</a>` : "", `<a class="b b--line" href="#posts">${ic("back")} Όλες</a>`)
  + `<div class="ed"><div class="ed-m"><section class="card"><label class="f f--big"><span>Τίτλος</span><input id="pt" value="${esc(p.title)}" placeholder="π.χ. Διαγώνισμα Βιολογίας Γ΄ Λυκείου, κεφάλαια 1–2" maxlength="200" required></label>
  <label class="f"><span>Μικρή περιγραφή (φαίνεται κάτω από τον τίτλο και στο Google)</span><textarea id="pex" rows="2" maxlength="300">${esc(p.ex || "")}</textarea></label>
  <label class="f"><span>Κείμενο (προαιρετικό)</span><div class="tb"><button type="button" data-md="b"><b>Β</b></button><button type="button" data-md="h">Τίτλος</button><button type="button" data-md="l">• Λίστα</button><button type="button" data-md="a">Σύνδεσμος</button></div><textarea id="pbody" rows="8" placeholder="Κενή γραμμή = νέα παράγραφος.">${esc(htmlToMd(p.body || ""))}</textarea></label></section>
  <section class="card"><h2>${ic("file")} Αρχεία</h2>${filesEd(fl, "post")}</section>${lockEd(lk, "της ανάρτησης")}</div>
  <div class="ed-s"><section class="card"><h2>Πού ανήκει</h2><p class="lbl">Μάθημα</p>${chipSet("subj", ST.subjects, p.subj || [])}<p class="lbl">Τάξη</p>${chipSet("lvl", ST.levels, p.lvl || [])}<p class="lbl">Είδος</p>${chipSet("type", ST.types, p.type, false)}
  <div class="two"><label class="f"><span>Ημερομηνία</span><input type="date" id="pd" value="${esc(String(p.date).slice(0, 10))}"></label><label class="f"><span>Χρονιά εξετάσεων</span><input id="py" inputmode="numeric" maxlength="4" value="${esc(p.year || "")}" placeholder="π.χ. 2026"></label></div></section>
  <section class="card"><label class="sw"><input type="checkbox" id="pdr"${p.draft ? " checked" : ""}><span></span>Πρόχειρο (δεν φαίνεται στο site)</label><label class="sw"><input type="checkbox" id="psoc"${(ST.social.queue || []).some((x) => x.pid === p.id) ? " checked" : ""}><span></span>Μοιράσου το στα social</label><p class="hint">Μπαίνει στη λίστα του «Social (Meta)» και ανεβαίνει στο Facebook/Instagram ${ST.social.auto ? "μόλις πατήσεις Δημοσίευση" : "όταν το εγκρίνεις"}.</p></section>
  <div class="ed-act"><button class="b b--sun b--big" type="button" id="pDone">Έτοιμο</button><button class="b b--line" type="button" id="pPrev">Προεπισκόπηση</button><button class="b b--bad" type="button" id="pDel">Διαγραφή</button></div></div></div>`;
}
function bindPost() {
  const p = ST.posts.find((x) => x.id === EDIT); if (!p) return;
  const set = (k, v) => { p[k] = v; if (k === "title" && (p._new || !p.slug)) p.slug = uniqSlug(slugify(v), p.id); p.upd = p._new ? undefined : today(); mark(); };
  $("#pt").addEventListener("input", (e) => set("title", e.target.value));
  $("#pex").addEventListener("input", (e) => set("ex", e.target.value));
  $("#pbody").addEventListener("input", (e) => set("body", S.md(e.target.value)));
  mdBar($("#pbody"));
  $("#pd").addEventListener("change", (e) => { set("date", new Date(e.target.value + "T12:00:00").toISOString()); sortPosts(); });
  $("#py").addEventListener("input", (e) => set("year", +e.target.value || undefined));
  $$("[data-chips]").forEach((g) => g.addEventListener("change", () => { const k = g.dataset.chips; const v = $$("input:checked", g).map((x) => x.value); set(k, k === "type" ? v[0] : v); }));
  $("#pdr").addEventListener("change", (e) => set("draft", e.target.checked));
  $("#psoc").addEventListener("change", (e) => { toggleSocial(p, e.target.checked); mark(); });
  bindLock(p, () => p.files, (v) => (p.files = v));
  bindFiles(p, "post");
  $("#pDone").addEventListener("click", () => { if (!p.title.trim()) { toast("Γράψε έναν τίτλο πρώτα.", true); $("#pt").focus(); return; } delete p._new; mark(); location.hash = "posts"; toast("Αποθηκεύτηκε. Πάτα «Δημοσίευση» για να φανεί στο site."); });
  $("#pPrev").addEventListener("click", () => preview("anartisi/" + p.slug));
  $("#pDel").addEventListener("click", () => { if (!confirm("Να πάει στον κάδο η ανάρτηση «" + (p.title || "χωρίς τίτλο") + "»; Μπορείς να την επαναφέρεις.")) return; ST.posts = ST.posts.filter((x) => x !== p); if (p.title) ST.trash.unshift({ ...p, deleted: today() }); toggleSocial(p, false); mark(); location.hash = "posts"; });
}
function toggleSocial(p, on) {
  const q = ST.social.queue || (ST.social.queue = []); const i = q.findIndex((x) => x.pid === p.id);
  if (!on) { if (i >= 0) q.splice(i, 1); return; }
  if (i >= 0) return;
  const th = (p.files || []).find((f) => f.th) || ((p.lock && p.lock.files) || []).find((f) => f.th);
  q.unshift({ id: uid(), pid: p.id, u: "anartisi/" + p.slug + "/", msg: (p.title + (p.ex ? "\n\n" + p.ex : "")).slice(0, 900), img: th ? S.links({ base: BASE, state: ST }).file(th.th) : "", st: ST.social.auto ? "auto" : "wait", made: today() });
}
function bindLock(o, getFiles, setFiles) {
  const on = $("#lkOn"); if (!on) return;
  on.addEventListener("change", () => {
    if (on.checked) { o.lock = { code: "", files: getFiles().splice(0) }; setFiles([]); }
    else { const f = (o.lock && o.lock.files) || []; delete o.lock; setFiles(f); }
    mark(); render();
  });
  const c = $("#lkCode"); c && c.addEventListener("input", (e) => { o.lock.code = e.target.value.trim(); delete o.lock.pending; mark(); });
}
function bindFiles(o, key) {
  const box = $(`[data-files="${key}"]`); if (!box) return;
  const list = () => (o.lock ? o.lock.files : o.files);
  box.addEventListener("input", (e) => { const i = e.target.dataset.ft; if (i != null) { list()[+i].t = e.target.value; mark(); } });
  box.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; const l = list();
    if (b.dataset.fx != null && confirm("Να αφαιρεθεί το αρχείο;")) { l.splice(+b.dataset.fx, 1); mark(); render(); }
    if (b.dataset.fm != null) { const i = +b.dataset.fm, j = i + +b.dataset.d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; mark(); render(); }
    if (b.dataset.fv != null) { const f = l[+b.dataset.fv]; open(S.links({ base: BASE, state: ST }).file(f.u), "_blank", "noopener"); }
  });
  const inp = $("input[type=file]", box), drop = $(".drop", box);
  inp.addEventListener("change", () => addFiles([...inp.files], list(), o));
  ["dragover", "dragenter"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); addFiles([...e.dataTransfer.files], list(), o); });
}

/* ---------------- ανέβασμα αρχείων ---------------- */
let pdfjs = null;
async function pdfInfo(file) {
  pdfjs ||= await import(BASE + "assets/vendor/pdfjs/pdf.min.mjs").then((m) => { m.GlobalWorkerOptions.workerSrc = BASE + "assets/vendor/pdfjs/pdf.worker.min.mjs"; return m; });
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const pg = await doc.getPage(1);
  const v0 = pg.getViewport({ scale: 1 }), sc = 480 / v0.width, v = pg.getViewport({ scale: sc });
  const c = d.createElement("canvas"); c.width = Math.round(v.width); c.height = Math.round(v.height);
  await pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
  const blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.82));
  return { n: doc.numPages, thumb: blob, tw: c.width, tht: c.height };
}
async function upload(blob, name, type) {
  if (TRIAL) return URL.createObjectURL(blob);
  const id = uid() + uid(), CH = 4 * 1024 * 1024, total = Math.max(1, Math.ceil(blob.size / CH)); let res;
  for (let i = 0; i < total; i++) {
    const r = await fetch(BASE + "api/upload", { method: "POST", headers: { "x-pass": PASS, "x-name": name, "x-type": type, "x-id": id, "x-part": String(i), "x-total": String(total) }, body: blob.slice(i * CH, (i + 1) * CH) });
    res = await r.json().catch(() => ({})); if (!res.ok) throw new Error(res.error || r.status);
  }
  return res.url;
}
async function addFiles(fs, list, o) {
  for (const f of fs) {
    if (f.size > 20 * 1024 * 1024) { toast(`«${f.name}»: πάνω από 20 MB. Μίκρυνέ το (π.χ. ilovepdf.com) και ξαναδοκίμασε.`, true); continue; }
    const name = slugify(f.name.replace(/\.[^.]+$/, "")); const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    toast(`Ανεβαίνει: ${f.name}…`);
    try {
      const it = { t: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), x: isPdf ? "pdf" : (f.name.split(".").pop() || "").toLowerCase(), s: f.size };
      if (isPdf) { try { const info = await pdfInfo(f); it.n = info.n; it.tw = info.tw; it.tht = info.tht; it.th = await upload(info.thumb, name + "-eikona", "image/webp"); } catch (e) {} }
      it.u = await upload(f, name, isPdf ? "application/pdf" : f.type || "application/octet-stream");
      list.push(it); mark(); render(); toast(`Ανέβηκε: ${f.name}`);
    } catch (e) { toast(`Δεν ανέβηκε το «${f.name}». Δοκίμασε ξανά.`, true); }
  }
}

/* ---------------- απλή γραφή ---------------- */
function htmlToMd(h) {
  if (!/<[a-z]/i.test(h)) return h;
  const x = d.createElement("div"); x.innerHTML = h; const out = [];
  const inl = (n) => [...n.childNodes].map((c) => c.nodeType === 3 ? c.textContent : c.nodeName === "STRONG" || c.nodeName === "B" ? "**" + inl(c) + "**" : c.nodeName === "A" ? `[${inl(c)}](${c.getAttribute("href") || ""})` : c.nodeName === "BR" ? "\n" : inl(c)).join("");
  [...x.children].forEach((c) => { if (/^H[1-6]$/.test(c.nodeName)) out.push("## " + inl(c)); else if (c.nodeName === "UL" || c.nodeName === "OL") out.push([...c.children].map((li) => "- " + inl(li).trim()).join("\n")); else out.push(inl(c).trim()); });
  return out.filter(Boolean).join("\n\n");
}
function mdBar(ta) {
  const bar = ta.previousElementSibling; if (!bar || !bar.classList.contains("tb")) return;
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-md]"); if (!b) return; const s = ta.selectionStart, en = ta.selectionEnd, sel = ta.value.slice(s, en) || "κείμενο"; let r = sel;
    if (b.dataset.md === "b") r = "**" + sel + "**"; if (b.dataset.md === "h") r = "\n## " + sel + "\n"; if (b.dataset.md === "l") r = sel.split("\n").map((l) => "- " + l).join("\n");
    if (b.dataset.md === "a") { const u = prompt("Η διεύθυνση του συνδέσμου:", "https://"); if (!u) return; r = "[" + sel + "](" + u + ")"; }
    ta.setRangeText(r, s, en, "end"); ta.focus(); ta.dispatchEvent(new Event("input"));
  });
}

/* ---------------- Βιβλία ---------------- */
function vBooks() {
  return head("Βιβλία", "Πάτα ένα βιβλίο για να αλλάξεις εξώφυλλο, κείμενα, αρχεία ή κωδικό.", `<button class="b b--ink" type="button" id="bNew">${ic("book")} Νέο βιβλίο</button>`)
  + `<div class="bkg">${ST.books.map((b) => `<a class="bkc${b.hidden ? " is-off" : ""}" href="#books/${esc(b.id)}"><span>${b.cover && b.cover.u ? `<img src="${esc(/^(blob:|https?:|\/)/.test(b.cover.u) ? b.cover.u : BASE + b.cover.u)}" alt="">` : `<i>${ic("book")}</i>`}</span><b>${esc(b.title)}</b><small>${esc(b.grade || "")}${b.lock ? " · με κωδικό" : ""}${b.hidden ? " · κρυφό" : ""}</small></a>`).join("")}</div>`;
}
bind.books = () => { if (EDIT) return bindBook(); $("#bNew").addEventListener("click", () => { const b = { id: "b" + uid(), slug: "", title: "Νέο βιβλίο", grade: "", subj: "Βιολογία", publisher: "", year: String(new Date().getFullYear()), authors: "Νικολέττα Μαργαρίτη", summary: "", toc: [], files: [], c1: "#2fae74", c2: "#1f7a52" }; b.slug = slugify(b.title + "-" + b.id.slice(-4)); ST.books.push(b); mark(); location.hash = "books/" + b.id; }); };
function vBook() {
  const b = ST.books.find((x) => x.id === EDIT); if (!b) return head("Δεν βρέθηκε", "", `<a class="b b--line" href="#books">Πίσω</a>`);
  const fl = b.lock ? b.lock.files : (b.files || (b.files = []));
  const cu = b.cover && b.cover.u ? (/^(blob:|https?:|\/)/.test(b.cover.u) ? b.cover.u : BASE + b.cover.u) : "";
  const F = (k, t, ph = "", n = 200) => `<label class="f"><span>${t}</span><input data-bk="${k}" value="${esc(b[k] || "")}" placeholder="${esc(ph)}" maxlength="${n}"></label>`;
  return head(esc(b.title), `<a href="${esc(BASE + "vivlia/" + b.slug + "/")}" target="_blank" rel="noopener">/vivlia/${esc(b.slug)}/ ↗</a>`, `<a class="b b--line" href="#books">${ic("back")} Όλα</a>`)
  + `<div class="ed"><div class="ed-m"><section class="card">${F("title", "Τίτλος")}${F("authors", "Συγγραφείς")}<div class="two">${F("grade", "Τάξη", "π.χ. Γ΄ Λυκείου")}${F("subj", "Μάθημα")}</div><div class="two">${F("publisher", "Εκδόσεις", "π.χ. Κόσμος")}${F("year", "Έτος", "", 4)}</div>${F("buy", "Σύνδεσμος για αγορά", "https://…", 400)}
  <label class="f"><span>Περιγραφή</span><textarea data-bk="summary" rows="6">${esc(b.summary || "")}</textarea></label>
  <label class="f"><span>Τι περιέχει (ένα σε κάθε γραμμή)</span><textarea id="btoc" rows="5">${esc((b.toc || []).join("\n"))}</textarea></label></section>
  <section class="card"><h2>${ic("file")} Αρχεία του βιβλίου</h2>${filesEd(fl, "book")}</section>${lockEd(b.lock, "του βιβλίου")}</div>
  <div class="ed-s"><section class="card"><h2>Εξώφυλλο</h2><div class="cov">${cu ? `<img src="${esc(cu)}" alt="">` : `<i>${ic("book")}</i>`}</div><label class="drop drop--sm"><input type="file" accept="image/*" id="bcov"><b>Άλλαξε εξώφυλλο</b><span>JPG ή PNG, όρθια εικόνα</span></label></section>
  <section class="card"><label class="sw"><input type="checkbox" data-bkc="isNew"${b.isNew ? " checked" : ""}><span></span>Ετικέτα «Νέα κυκλοφορία»</label><label class="sw"><input type="checkbox" data-bkc="hidden"${b.hidden ? " checked" : ""}><span></span>Κρυφό (δεν φαίνεται στο site)</label></section>
  <div class="ed-act"><a class="b b--sun b--big" href="#books">Έτοιμο</a><button class="b b--line" type="button" id="bPrev">Προεπισκόπηση</button><button class="b b--bad" type="button" id="bDel">Διαγραφή</button></div></div></div>`;
}
function bindBook() {
  const b = ST.books.find((x) => x.id === EDIT); if (!b) return;
  $$("[data-bk]").forEach((i) => i.addEventListener("input", () => { b[i.dataset.bk] = i.value; mark(); }));
  $$("[data-bkc]").forEach((i) => i.addEventListener("change", () => { b[i.dataset.bkc] = i.checked; mark(); }));
  $("#btoc").addEventListener("input", (e) => { b.toc = e.target.value.split("\n").map((x) => x.trim()).filter(Boolean); mark(); });
  bindLock(b, () => b.files || (b.files = []), (v) => (b.files = v)); bindFiles(b, "book");
  $("#bcov").addEventListener("change", async (e) => { const f = e.target.files[0]; if (!f) return; try { const im = await shrink(f, 900); b.cover = { u: await upload(im.blob, slugify("vivlio-" + b.title), "image/webp"), w: im.w, h: im.h }; mark(); render(); toast("Νέο εξώφυλλο έτοιμο."); } catch (er) { toast("Δεν ανέβηκε η εικόνα.", true); } });
  $("#bPrev").addEventListener("click", () => preview("vivlia/" + b.slug));
  $("#bDel").addEventListener("click", () => { if (!confirm("Να διαγραφεί το βιβλίο «" + b.title + "»; (Αν θέλεις απλώς να μη φαίνεται, διάλεξε «Κρυφό».)")) return; ST.books = ST.books.filter((x) => x !== b); mark(); location.hash = "books"; });
}
async function shrink(file, max) {
  const bmp = await createImageBitmap(file); const k = Math.min(1, max / Math.max(bmp.width, bmp.height)); const c = d.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); return { blob: await new Promise((r) => c.toBlob(r, "image/webp", 0.85)), w: c.width, h: c.height };
}

/* ---------------- Σελίδες & κείμενα ---------------- */
const TEXTS = [["bio", "Βιογραφικό (σελίδα «Ποια είμαι»)"], ["celly", "Κείμενο για την Celly"], ["teachers", "Κείμενο «Είσαι καθηγητής;»"], ["career", "Κείμενο «Επαγγελματικός προσανατολισμός»"], ["feedback", "Κείμενο «Για πες…»"], ["contactQuote", "Φράση στην «Επικοινωνία»"], ["copyright", "Πνευματική ιδιοκτησία"]];
function vPages() {
  return head("Σελίδες & κείμενα", "Οι σταθερές σελίδες του site. Πάτα μία για να αλλάξεις τίτλο, εισαγωγή και κείμενο.")
  + `<div class="rows">${Object.entries(S.PAGES).filter(([k]) => k !== "aporrito").map(([k, m]) => { const pg = (ST.pages || {})[k] || {}; return `<a class="row" href="#pages/${encodeURIComponent(k)}"><span class="row-b"><b>${esc(pg.title || m.t)}</b><small>${esc(m.e)} · /${esc(k)}/</small></span>${ic("arrow")}</a>`; }).join("")}</div>
  <h2 class="h2">Κείμενα που εμφανίζονται μέσα στις σελίδες</h2><div class="rows">${TEXTS.map(([k, t]) => `<a class="row" href="#pages/t:${k}"><span class="row-b"><b>${esc(t)}</b><small>${esc(String(ST.texts[k] || "").slice(0, 90))}…</small></span>${ic("arrow")}</a>`).join("")}</div>`;
}
bind.pages = () => {
  if (!EDIT) return; const k = decodeURIComponent(EDIT);
  if (k.startsWith("t:")) { const key = k.slice(2); const ta = $("#tx"); ta.addEventListener("input", () => { ST.texts[key] = ta.value; mark(); }); mdBar(ta); return; }
  const pg = (ST.pages[k] ||= {});
  $$("[data-pg]").forEach((i) => i.addEventListener("input", () => { pg[i.dataset.pg] = i.value; mark(); })); mdBar($("[data-pg=body]"));
  $("#pgPrev").addEventListener("click", () => preview(k));
};
function vPage() {
  const k = decodeURIComponent(EDIT);
  if (k.startsWith("t:")) { const key = k.slice(2), t = (TEXTS.find((x) => x[0] === key) || [])[1] || key; return head(esc(t), "Κενή γραμμή = νέα παράγραφος, «- » στην αρχή = λίστα.", `<a class="b b--line" href="#pages">${ic("back")} Πίσω</a>`) + `<section class="card"><div class="tb"><button type="button" data-md="b"><b>Β</b></button><button type="button" data-md="h">Τίτλος</button><button type="button" data-md="l">• Λίστα</button><button type="button" data-md="a">Σύνδεσμος</button></div><textarea id="tx" class="ta-big" rows="18">${esc(ST.texts[key] || "")}</textarea></section>`; }
  const m = S.PAGES[k]; const pg = (ST.pages || {})[k] || {};
  return head(esc(pg.title || m.t), `<a href="${esc(BASE + k + "/")}" target="_blank" rel="noopener">/${esc(k)}/ ↗</a>`, `<a class="b b--line" href="#pages">${ic("back")} Πίσω</a>`)
  + `<section class="card"><label class="f f--big"><span>Τίτλος</span><input data-pg="title" value="${esc(pg.title || "")}" placeholder="${esc(m.t)}"></label><label class="f"><span>Εισαγωγή (μία-δυο προτάσεις)</span><textarea data-pg="lead" rows="2">${esc(pg.lead || "")}</textarea></label>
  <label class="f"><span>Κείμενο</span><div class="tb"><button type="button" data-md="b"><b>Β</b></button><button type="button" data-md="h">Τίτλος</button><button type="button" data-md="l">• Λίστα</button><button type="button" data-md="a">Σύνδεσμος</button></div><textarea data-pg="body" class="ta-big" rows="16">${esc(pg.body || "")}</textarea></label><button class="b b--line" type="button" id="pgPrev">Προεπισκόπηση</button></section>`;
}

/* ---------------- Social (Meta) ---------------- */
function vSocial() {
  const so = ST.social; const q = so.queue || [], lg = so.log || [];
  const byDay = {}; lg.forEach((x) => (byDay[String(x.at || x.made).slice(0, 10)] ||= []).push(x));
  return head("Social (Meta)", "Ό,τι ανεβάζεις στο blog μοιράζεται στο Facebook και στο Instagram, και μένει εδώ το ιστορικό.")
  + `<section class="card conn ${META ? "is-on" : ""}"><div class="conn-i">${ic("send")}</div><div><h2>${META ? "Συνδεδεμένο με Facebook & Instagram" : "Δεν έχει συνδεθεί ακόμη"}</h2><p class="hint">${META ? "Οι αναρτήσεις ανεβαίνουν στη σελίδα σου στο Facebook και, όταν έχουν εικόνα, στο Instagram." : "Η σύνδεση γίνεται μία φορά από την Advon Media με τον επαγγελματικό λογαριασμό σου (Facebook Page + Instagram Business). Μέχρι τότε η λίστα κρατά ό,τι θέλεις να μοιραστείς, έτοιμο."}</p>
  <label class="sw"><input type="checkbox" id="soAuto"${so.auto ? " checked" : ""}><span></span>Αυτόματα: μόλις πατήσω «Δημοσίευση», να ανεβαίνουν και στα social</label></div></section>
  <section class="card"><h2>Έτοιμα για ανέβασμα <small>${q.length}</small></h2>${q.length ? q.map((x) => `<div class="sq" data-sq="${esc(x.id)}">${x.img ? `<img src="${esc(x.img)}" alt="">` : `<i>${ic("file")}</i>`}<div class="sq-b"><textarea rows="3" aria-label="Κείμενο ανάρτησης">${esc(x.msg)}</textarea><small>${esc("/" + x.u)} · ${x.st === "auto" ? "θα ανέβει αυτόματα" : x.st === "error" ? "<em>απέτυχε: " + esc((x.res && (x.res.fb || x.res.ig)) || "") + "</em>" : "περιμένει έγκριση"}</small></div><div class="sq-a"><button class="b b--ink b--sm" type="button" data-sgo${META && !TRIAL ? "" : " disabled"}>Ανέβασέ το τώρα</button><button class="b b--line b--sm" type="button" data-sx>Αφαίρεση</button></div></div>`).join("") : `<p class="empty">Τίποτα στη λίστα. Στην επεξεργασία μιας ανάρτησης τσέκαρε «Μοιράσου το στα social».</p>`}</section>
  <section class="card"><h2>Ιστορικό</h2>${lg.length ? Object.keys(byDay).sort().reverse().map((k) => `<p class="lbl">${fmt(k)}</p>${byDay[k].map((x) => `<div class="lg"><b>${esc(x.msg.split("\n")[0])}</b><span>Facebook: ${x.res && x.res.fb === "ok" ? "✓" : "—"} · Instagram: ${x.res && x.res.ig === "ok" ? "✓" : "—"}</span></div>`).join("")}`).join("") : `<p class="empty">Ό,τι ανέβει στα social θα φαίνεται εδώ, με ημερομηνία.</p>`}</section>`;
}
bind.social = () => {
  const so = ST.social;
  $("#soAuto").addEventListener("change", (e) => { so.auto = e.target.checked; (so.queue || []).forEach((x) => { if (x.st !== "error") x.st = so.auto ? "auto" : "wait"; }); mark(); render(); });
  $$("[data-sq]").forEach((row) => {
    const it = so.queue.find((x) => x.id === row.dataset.sq);
    $("textarea", row).addEventListener("input", (e) => { it.msg = e.target.value; mark(); });
    $("[data-sx]", row).addEventListener("click", () => { so.queue = so.queue.filter((x) => x !== it); mark(); render(); });
    $("[data-sgo]", row).addEventListener("click", async (e) => { e.target.disabled = true; try { if (dirty()) await publish(true); const j = await api("social-post", { id: it.id, item: it }); ST.social = j.social; SAVED = JSON.stringify(ST); mark(); render(); toast(j.item.st === "sent" ? "Ανέβηκε στα social!" : "Δεν ανέβηκε. Δες το μήνυμα.", j.item.st !== "sent"); } catch (er) { toast("Δεν ανέβηκε: " + er.message, true); e.target.disabled = false; } });
  });
};

/* ---------------- Ηχητικός οδηγός ---------------- */
function vPod() {
  const pc = ST.settings.podcast || (ST.settings.podcast = { url: "", title: "Ο ηχητικός οδηγός του site", by: "Νίκη Μαργαρίτη", chapters: [] });
  const src = pc.url ? S.links({ base: BASE, state: ST }).file(pc.url) : "";
  return head("Ηχητικός οδηγός", "Το κουμπί «Άκου τον οδηγό» κάτω δεξιά σε όλες τις σελίδες. Ανέβασε εδώ το ηχητικό σου (π.χ. από το NotebookLM).")
  + `<section class="card"><div class="pod-up">${src ? `<audio controls preload="metadata" src="${esc(src)}"></audio>` : `<p class="empty">Δεν έχει ανέβει ακόμη ηχητικό. Μέχρι τότε το κουμπί λέει «ανεβαίνει σε λίγο».</p>`}
  <label class="drop"><input type="file" accept="audio/*,.m4a,.mp3,.wav" id="podF"><b>${ic("head")} ${src ? "Άλλαξε το ηχητικό" : "Ανέβασε το ηχητικό"}</b><span>MP3, M4A ή WAV · έως 20 MB</span></label></div>
  <div class="two"><label class="f"><span>Τίτλος</span><input id="podT" value="${esc(pc.title || "")}"></label><label class="f"><span>Με τη φωνή της</span><input id="podB" value="${esc(pc.by || "")}"></label></div></section>
  <section class="card"><h2>Κεφάλαια</h2><p class="hint">Προαιρετικά: σημεία του ηχητικού που ο επισκέπτης μπορεί να πατήσει (π.χ. 1:20 «Πού βρίσκω τα θέματα Πανελληνίων»).</p>
  <div class="chs">${(pc.chapters || []).map((c, i) => `<div class="ch"><input data-ca="${i}" value="${Math.floor(c.at / 60)}:${String(c.at % 60).padStart(2, "0")}" aria-label="Χρόνος" inputmode="numeric"><input data-ct="${i}" value="${esc(c.t)}" aria-label="Τίτλος"><button type="button" class="b b--line b--sm" data-cx="${i}">${ic("x")}</button></div>`).join("")}</div><button class="b b--line" type="button" id="chAdd">+ Κεφάλαιο</button></section>`;
}
bind.podcast = () => {
  const pc = ST.settings.podcast;
  $("#podT").addEventListener("input", (e) => { pc.title = e.target.value; mark(); }); $("#podB").addEventListener("input", (e) => { pc.by = e.target.value; mark(); });
  $("#podF").addEventListener("change", async (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 20 * 1024 * 1024) return toast("Το αρχείο είναι πάνω από 20 MB.", true); toast("Ανεβαίνει το ηχητικό…"); try { pc.url = await upload(f, "odigos-site", f.type || "audio/mpeg"); mark(); render(); toast("Το ηχητικό ανέβηκε."); } catch (er) { toast("Δεν ανέβηκε. Δοκίμασε ξανά.", true); } });
  const ch = () => (pc.chapters ||= []);
  $("#chAdd").addEventListener("click", () => { ch().push({ at: 0, t: "" }); mark(); render(); });
  $$("[data-ca]").forEach((i) => i.addEventListener("change", () => { const [m, s] = i.value.split(":").map(Number); ch()[+i.dataset.ca].at = (m || 0) * 60 + (s || 0); ch().sort((a, b) => a.at - b.at); mark(); }));
  $$("[data-ct]").forEach((i) => i.addEventListener("input", () => { ch()[+i.dataset.ct].t = i.value; mark(); }));
  $$("[data-cx]").forEach((b) => b.addEventListener("click", () => { ch().splice(+b.dataset.cx, 1); mark(); render(); }));
};

/* ---------------- Μηνύματα ---------------- */
function vMsgs() {
  return head("Μηνύματα «Για πες…»", "Ό,τι σου γράφουν από το site. Δεν κρατάμε όνομα ή email.")
  + (FB.length ? `<div class="msgs">${FB.map((x, i) => `<article class="msg${x.read ? "" : " is-new"}"><p>${esc(x.msg)}</p><small>${esc(x.who || "")} · ${fmt(x.at)}${x.page ? " · από " + esc(x.page) : ""}</small><div class="msg-a">${x.read ? "" : `<button class="b b--line b--sm" type="button" data-mr="${i}">Το διάβασα</button>`}<button class="b b--line b--sm" type="button" data-md="${i}">Διαγραφή</button></div></article>`).join("")}</div>` : `<p class="empty card">Δεν υπάρχουν μηνύματα ακόμη.</p>`);
}
bind.msgs = () => {
  const save = async () => { tabs(); if (TRIAL) { try { localStorage.setItem("nm-fb-demo", JSON.stringify(FB)); } catch (e) {} } else { try { await api("feedback-save", { feedback: FB }); } catch (e) { toast("Δεν αποθηκεύτηκε.", true); } } render(); };
  $$("[data-mr]").forEach((b) => b.addEventListener("click", () => { FB[+b.dataset.mr].read = true; save(); }));
  $$("#view [data-md]").forEach((b) => b.addEventListener("click", () => { if (confirm("Διαγραφή μηνύματος;")) { FB.splice(+b.dataset.md, 1); save(); } }));
};

/* ---------------- Ρυθμίσεις ---------------- */
function vSettings() {
  const s = ST.settings; const F = (k, t, ph = "") => `<label class="f"><span>${t}</span><input data-st="${k}" value="${esc(s[k] || "")}" placeholder="${esc(ph)}"></label>`;
  return head("Ρυθμίσεις", "Τα στοιχεία που φαίνονται στο υποσέλιδο, στην «Επικοινωνία» και στο Google.")
  + `<section class="card"><h2>Επικοινωνία</h2><div class="two">${F("phone", "Κινητό")}${F("phone2", "Σταθερό")}</div><div class="two">${F("email", "Email")}${F("teams", "Microsoft Teams")}</div>${F("address", "Διεύθυνση")}</section>
  <section class="card"><h2>Social</h2><p class="hint">Οι σύνδεσμοι των προφίλ σου. Όσα συμπληρώσεις εμφανίζονται ως εικονίδια στο υποσέλιδο.</p><div class="two">${F("facebook", "Facebook", "https://facebook.com/…")}${F("instagram", "Instagram", "https://instagram.com/…")}</div><div class="two">${F("youtube", "YouTube")}${F("tiktok", "TikTok")}</div><div class="two">${F("linkedin", "LinkedIn")}${F("x", "X")}</div></section>
  <section class="card"><h2>Celly & Google</h2>${F("celly", "Διεύθυνση της Celly")}<label class="f"><span>Περιγραφή για το Google (έως 160 χαρακτήρες)</span><textarea data-st="description" rows="3" maxlength="170">${esc(s.description || "")}</textarea></label></section>
  ${TRIAL ? "" : `<section class="card"><h2>Αναίρεση</h2><p class="hint">Γυρίζει το site όπως ήταν πριν από την τελευταία «Δημοσίευση».</p><button class="b b--line" type="button" id="undo">Αναίρεση τελευταίας δημοσίευσης</button></section>`}
  <section class="card"><h2>Πρόχειρες αλλαγές σε αυτή τη συσκευή</h2><p class="hint">Αν θέλεις να πετάξεις ό,τι άλλαξες και δεν δημοσίευσες:</p><button class="b b--bad" type="button" id="discard">Ακύρωση αλλαγών</button></section>`;
}
bind.settings = () => {
  $$("[data-st]").forEach((i) => i.addEventListener("input", () => { ST.settings[i.dataset.st] = i.value; mark(); }));
  const u = $("#undo"); u && u.addEventListener("click", async () => { if (!confirm("Να γυρίσει το site στην προηγούμενη δημοσίευση;")) return; try { const j = await api("undo"); ST = norm(j.state); SAVED = JSON.stringify(ST); mark(); render(); toast("Έγινε αναίρεση."); } catch (e) { toast("Δεν υπάρχει προηγούμενη δημοσίευση.", true); } });
  $("#discard").addEventListener("click", () => { if (!confirm("Να χαθούν οι αλλαγές που δεν δημοσίευσες;")) return; ST = norm(JSON.parse(SAVED)); try { localStorage.removeItem(LS); } catch (e) {} mark(); render(); toast("Οι αλλαγές ακυρώθηκαν."); });
};

/* ---------------- κλειδιά: κρυπτογράφηση στον browser πριν τη δημοσίευση ---------------- */
function normCode(s) { const GR = { "Ά": "A", "Έ": "E", "Ή": "H", "Ί": "I", "Ό": "O", "Ύ": "Y", "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X" }; return String(s).toUpperCase().replace(/[ΆΈΉΊΌΎΑΒΕΖΗΙΚΜΝΟΡΤΥΧ]/g, (c) => GR[c]).replace(/[^\p{L}\p{N}]+/gu, ""); }
const b64 = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
async function sealLock(lock) {
  if (!lock || !lock.code) return;
  const sig = normCode(lock.code) + "|" + JSON.stringify(lock.files || []);
  if (lock.sig === sig && lock.enc) return;
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normCode(lock.code)), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const fb = (ST.settings.filesBase || "");
  const files = (lock.files || []).map((f) => ({ t: f.t, u: /^(https?:|\/)/.test(f.u) ? f.u : fb + f.u, n: f.n }));
  const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify({ files, body: "" })));
  Object.assign(lock, { enc: b64(enc), iv: b64(iv), salt: b64(salt), n: files.length, sig }); delete lock.pending;
}

/* ---------------- δημοσίευση & προεπισκόπηση ---------------- */
async function publish(quiet) {
  const btn = $("#pubB"); btn.disabled = true; btn.textContent = "Δημοσιεύεται…";
  try {
    for (const p of ST.posts) await sealLock(p.lock); for (const b of ST.books) await sealLock(b.lock);
    ST.posts.forEach((p) => { if (!p.slug) p.slug = uniqSlug(slugify(p.title), p.id); delete p._new; });
    ST.posts = ST.posts.filter((p) => p.title && p.title.trim()); sortPosts();
    if (TRIAL) { SAVED = JSON.stringify(ST); try { localStorage.setItem(LS, JSON.stringify({ at: today(), state: ST })); } catch (e) {} if (!quiet) toast("Δοκιμή: οι αλλαγές κρατήθηκαν σε αυτόν τον browser. Δες τες με «Προεπισκόπηση»."); }
    else { const j = await api("publish", { state: ST }); if (j.social) ST.social = j.social; SAVED = JSON.stringify(ST); if (!quiet) toast("Δημοσιεύτηκε! Το site ενημερώθηκε."); }
  } catch (e) { toast("Δεν δημοσιεύτηκε: " + e.message, true); }
  btn.textContent = "Δημοσίευση"; mark(); tabs(); if (VIEW === "social") render();
}
$("#pubB").addEventListener("click", () => publish(false));
const PV = $("#pv");
function preview(path = "") {
  const sel = $("#pvSel"); const opts = [["", "Αρχική"], ["yliko", "Όλο το υλικό"], ["vivlia", "Τα βιβλία μου"], ["istoriko", "Ιστορικό"], ...Object.keys(S.PAGES).map((k) => [k, S.PAGES[k].t])];
  if (path && !opts.some((o) => o[0] === path)) opts.unshift([path, "Αυτή η σελίδα"]);
  sel.innerHTML = opts.map(([k, t]) => `<option value="${esc(k)}"${k === path ? " selected" : ""}>${esc(t)}</option>`).join("");
  draw(path); PV.hidden = false; d.documentElement.style.overflow = "hidden";
}
function draw(path) {
  const ctx = { base: BASE, origin: "", mode: "preview", state: ST }; const r = S.route(ST, ctx, path, {});
  let h = S.docHtml(ST, ctx, r, { v: "p" + Date.now() }).replace('<meta charset="utf-8">', `<meta charset="utf-8"><base href="${location.origin + BASE}">`);
  h = h.replace(/<script id="advon-draft-guard">[\s\S]*?<\/script>/, "");
  $("#pvF").srcdoc = h;
}
$("#pvSel").addEventListener("change", (e) => draw(e.target.value));
$("#pvX").addEventListener("click", () => { PV.hidden = true; d.documentElement.style.overflow = ""; });
$("#prevB").addEventListener("click", () => preview(""));
$$(".pv-sz button").forEach((b) => b.addEventListener("click", () => { $$(".pv-sz button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false")); $("#pvF").style.maxWidth = +b.dataset.sz ? b.dataset.sz + "px" : ""; }));
