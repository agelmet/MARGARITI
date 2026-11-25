/* Νίκη Μαργαρίτη — ό,τι κινείται στη σελίδα. Χωρίς βιβλιοθήκες· το pdf.js φορτώνεται μόνο όταν ανοίξει αρχείο σε κινητό. */
(function () {
  "use strict";
  var NM = window.NM || { base: "/" }, B = NM.base, d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var lockScroll = function (on) { d.documentElement.classList.toggle("noscroll", !!on); };

  /* ---------- μενού ---------- */
  var nav = $(".nav"), top = $(".top");
  if (nav) {
    var closeAll = function (ex) { $$(".nv.is-open", nav).forEach(function (n) { if (n !== ex) { n.classList.remove("is-open"); var a = $(".nv-a", n); a && a.setAttribute("aria-expanded", "false"); } }); };
    $$(".nv", nav).forEach(function (n) {
      var p = $(".nv-p", n), a = $(".nv-a", n); if (!p) return;
      var t;
      n.addEventListener("mouseenter", function () { if (touch) return; clearTimeout(t); closeAll(n); n.classList.add("is-open"); a.setAttribute("aria-expanded", "true"); });
      n.addEventListener("mouseleave", function () { if (touch) return; t = setTimeout(function () { n.classList.remove("is-open"); a.setAttribute("aria-expanded", "false"); }, 160); });
      a.addEventListener("click", function (e) { if (!n.classList.contains("is-open")) { e.preventDefault(); closeAll(n); n.classList.add("is-open"); a.setAttribute("aria-expanded", "true"); } });
      n.addEventListener("focusout", function (e) { if (!n.contains(e.relatedTarget)) { n.classList.remove("is-open"); a.setAttribute("aria-expanded", "false"); } });
    });
    d.addEventListener("click", function (e) { if (!e.target.closest(".nav")) closeAll(); });
  }
  var mm = $("#mm"), burger = $(".burger");
  function mmOpen(on) { if (!mm) return; mm.hidden = !on; burger.setAttribute("aria-expanded", on ? "true" : "false"); lockScroll(on); if (on) $(".mm-x", mm).focus(); else burger.focus(); }
  burger && burger.addEventListener("click", function () { mmOpen(mm.hidden); });
  mm && $(".mm-x", mm).addEventListener("click", function () { mmOpen(false); });
  var lastY = 0;
  addEventListener("scroll", function () { var y = scrollY; top && top.classList.toggle("is-solid", y > 8); lastY = y; }, { passive: true });

  /* ---------- βοηθητικά αναζήτησης (ελληνικά, greeklish, ορθογραφικά λάθη) ---------- */
  var STOP = "και τα του των της τις τη την το τον στο στη στην στον στα στις στους για με απο από ο η οι ενα μια σε που να θα ειναι εινα ή η".split(" ");
  var GL = [["th", "θ"], ["ch", "χ"], ["ps", "ψ"], ["ks", "ξ"], ["ou", "ου"], ["a", "α"], ["b", "β"], ["v", "β"], ["g", "γ"], ["d", "δ"], ["e", "ε"], ["z", "ζ"], ["h", "η"], ["i", "ι"], ["k", "κ"], ["l", "λ"], ["m", "μ"], ["n", "ν"], ["x", "χ"], ["o", "ο"], ["p", "π"], ["r", "ρ"], ["s", "σ"], ["t", "τ"], ["u", "υ"], ["y", "υ"], ["f", "φ"], ["w", "ω"], ["c", "κ"], ["j", "τζ"], ["q", "κ"]];
  function plain(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ς/g, "σ").replace(/[΄'’`´‘]/g, " "); }
  function greek(w) { if (!/[a-z]/.test(w)) return w; for (var i = 0; i < GL.length; i++) w = w.split(GL[i][0]).join(GL[i][1]); return w; }
  function phon(w) { return w.replace(/ει|οι|υι|η|υ/g, "ι").replace(/ω/g, "ο").replace(/αι/g, "ε").replace(/([^\s])\1+/g, "$1").replace(/γκ|γγ/g, "γ").replace(/μπ/g, "β").replace(/ντ/g, "δ"); }
  var SYN = { πανελλαδικεσ: "πανελληνιεσ", πανελληνιεσ: "πανελληνιεσ", πανελλινιεσ: "πανελληνιεσ", εξετασεισ: "εξετασεων", τριτη: "γ", δευτερη: "β", πρωτη: "α", "3η": "γ", "2η": "β", "1η": "α", γ: "γ", β: "β", α: "α", λυκειο: "λυκειου", γυμνασιο: "γυμνασιου", διαγωνισμα: "διαγωνισματα", ασκηση: "ασκησεισ", θεμα: "θεματα", απαντηση: "απαντησεισ", βιολογια: "βιολογια", bio: "βιολογια" };
  function tokens(s) { return plain(s).split(/[^0-9a-zα-ω]+/).filter(Boolean).map(greek).filter(function (w) { return STOP.indexOf(w) < 0; }); }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var p = [], c, i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) { c = [i]; var m = i; for (j = 1; j <= b.length; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (c[j] < m) m = c[j]; } if (m > max) return max + 1; p = c; }
    return p[b.length];
  }
  function tokScore(q, w) {
    if (q === w) return 3;
    var pq = phon(q), pw = phon(w);
    if (pq === pw) return 2.8;
    if (q.length >= 2 && w.indexOf(q) === 0) return q.length >= 4 ? 2.4 : 1.6;
    if (pq.length >= 3 && pw.indexOf(pq) === 0) return 2;
    if (q.length >= 4) { var mx = q.length >= 7 ? 2 : 1; var dd = lev(pq, pw.slice(0, pq.length + 1), mx); if (dd <= mx) return 1.8 - dd * 0.3; if (w.length > q.length && lev(pq, pw.slice(0, pq.length), mx) <= mx) return 1.3; }
    return 0;
  }
  var IDX = null, IDXP = null;
  function loadIdx() {
    if (IDXP) return IDXP;
    IDXP = fetch(B + "assets/data/search.json?v=" + (NM.v || "")).then(function (r) { return r.json(); }).then(function (j) {
      j.docs.forEach(function (x) {
        x._t = tokens(x.t); x._o = tokens([x.c, x.e, x.f, x.k].join(" "));
        x._all = x._t.concat(x._o);
      });
      var V = {}; j.docs.forEach(function (x) { x._all.forEach(function (w) { if (w.length > 2 && !/\d/.test(w)) V[w] = (V[w] || 0) + 1; }); });
      j.vocab = Object.keys(V); IDX = j; return j;
    });
    return IDXP;
  }
  function search(q, lim) {
    var qt = tokens(q).map(function (w) { return SYN[w] || w; }); if (!qt.length) return { res: [], q: qt };
    var years = qt.filter(function (w) { return /^(19|20)\d\d$/.test(w); });
    var res = [];
    IDX.docs.forEach(function (x) {
      var sc = 0, hit = 0;
      qt.forEach(function (w) {
        if (/^(19|20)\d\d$/.test(w)) { if (String(x.y || "") === w || (x.t.indexOf(w) >= 0)) { sc += 4; hit++; } return; }
        var best = 0, i;
        for (i = 0; i < x._t.length; i++) { var s = tokScore(w, x._t[i]) * 1.6; if (s > best) best = s; }
        for (i = 0; i < x._o.length; i++) { var s2 = tokScore(w, x._o[i]); if (s2 > best) best = s2; }
        if (best > 0) hit++; sc += best;
      });
      if (!hit) return;
      if (years.length && x.y && years.indexOf(String(x.y)) < 0) sc -= 3;
      sc *= hit / qt.length; sc += (x.g === "b" ? 1.2 : x.g === "s" ? 0.6 : 0) + (x.d ? (+x.d.slice(0, 4) - 2015) * 0.02 : 0);
      if (hit / qt.length >= 0.5) res.push({ x: x, s: sc });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return { res: res.slice(0, lim || 60), q: qt };
  }
  function didYouMean(q) {
    var ws = tokens(q), changed = false;
    var out = ws.map(function (w) {
      if (w.length < 4 || /\d/.test(w) || IDX.vocab.indexOf(w) >= 0) return w;
      var best = null, bd = 9, pw = phon(w);
      IDX.vocab.forEach(function (v) { var dd = lev(pw, phon(v), 2); if (dd < bd) { bd = dd; best = v; } });
      if (best && bd <= 2) { changed = true; return best; } return w;
    });
    return changed ? out.join(" ") : "";
  }
  var GL2 = { b: "Βιβλίο", s: "Σελίδα", p: "" };
  function resItem(x, i) {
    var url = B + x.u;
    var th = x.th ? '<img src="' + esc(NM.files + x.th) + '" alt="" loading="lazy" width="48" height="66">' : x.cv ? '<img src="' + esc(B + x.cv) + '" alt="" loading="lazy" width="48" height="66">' : '<span class="sr-ic">' + (x.g === "s" ? "ΣΕΛ" : x.lk ? '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' : "PDF") + "</span>";
    return '<a class="sr-i" href="' + esc(url) + '" role="option" id="sr-' + i + '">' + th + '<span><b>' + esc(x.t) + "</b><small>" + esc([GL2[x.g] || x.e, x.c, x.d ? x.d.slice(8, 10) + "." + x.d.slice(5, 7) + "." + x.d.slice(0, 4) : ""].filter(Boolean).join(" · ")) + "</small></span></a>";
  }

  /* ---------- αναζήτηση: παράθυρο (/, Ctrl/⌘K) ---------- */
  var sx = $("#sx"), sxIn = sx && $("input", sx), sxR = sx && $(".sx-r", sx), sxSel = -1;
  function sxOpen() { if (!sx) return; sx.hidden = false; lockScroll(true); sxIn.focus(); loadIdx().then(function () { sxRun(); }); }
  function sxClose() { if (!sx) return; sx.hidden = true; lockScroll(false); }
  function sxRun() {
    var q = sxIn.value.trim(); sxSel = -1;
    if (!IDX) { sxR.innerHTML = '<p class="sx-hint">Φόρτωση…</p>'; return; }
    if (!q) { sxR.innerHTML = '<p class="sx-hint">Δοκίμασε: ' + ["θέματα πανελληνίων 2025", "διαγωνισμα γ λυκειου", "anatomia epal", "χημια γυμνασιου", "κλειστου τυπου"].map(function (s) { return '<button type="button" class="sx-s">' + esc(s) + "</button>"; }).join(" ") + "</p>"; return; }
    var r = search(q, 12), h = "";
    if (!r.res.length) { var dm = didYouMean(q); h = '<p class="sx-hint">Δεν βρέθηκε κάτι για «' + esc(q) + "»." + (dm ? ' Μήπως εννοείς <button type="button" class="sx-s">' + esc(dm) + "</button>;" : "") + "</p>"; }
    else h = '<div class="sr-l" role="listbox">' + r.res.map(function (o, i) { return resItem(o.x, i); }).join("") + '</div><a class="sx-all" href="' + B + "anazitisi/?q=" + encodeURIComponent(q) + '">Όλα τα αποτελέσματα για «' + esc(q) + "» →</a>";
    sxR.innerHTML = h;
  }
  if (sx) {
    sxIn.addEventListener("input", sxRun);
    sxIn.addEventListener("keydown", function (e) {
      var it = $$(".sr-i", sxR);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sxSel = Math.max(0, Math.min(it.length - 1, sxSel + (e.key === "ArrowDown" ? 1 : -1))); it.forEach(function (a, i) { a.classList.toggle("is-sel", i === sxSel); }); it[sxSel] && it[sxSel].scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter") { e.preventDefault(); if (it[sxSel]) location.href = it[sxSel].href; else if (sxIn.value.trim()) location.href = B + "anazitisi/?q=" + encodeURIComponent(sxIn.value.trim()); }
    });
    sx.addEventListener("click", function (e) { if (e.target === sx || e.target.closest(".sx-x")) sxClose(); var s = e.target.closest(".sx-s"); if (s) { sxIn.value = s.textContent; sxRun(); sxIn.focus(); } });
  }
  d.addEventListener("click", function (e) { if (e.target.closest("[data-search]")) { e.preventDefault(); if (mm && !mm.hidden) mmOpen(false); sxOpen(); } });
  d.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase(), typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); sxOpen(); }
    if (e.key === "Escape") { if (sx && !sx.hidden) sxClose(); else if (pv && !pv.hidden) pvClose(); else if (dr && !dr.hidden) drClose(); else if (pod && !pod.hidden) podOpen(false); else if (mm && !mm.hidden) mmOpen(false); }
  });

  /* αναζήτηση στην αρχική: προτάσεις ενώ γράφεις */
  $$("[data-hs]").forEach(function (f) {
    var inp = $("input[type=search]", f), box = $(".hs-r", f), full = f.hasAttribute("data-full");
    var out = full ? $("[data-sr]") : box;
    var run = function () {
      var q = inp.value.trim();
      loadIdx().then(function () {
        if (!q) { if (box) box.hidden = true; if (full) out.innerHTML = ""; return; }
        var r = search(q, full ? 80 : 6);
        if (full) {
          if (!r.res.length) { var dm = didYouMean(q); out.innerHTML = '<p class="sx-hint">Δεν βρέθηκε κάτι για «' + esc(q) + "»." + (dm ? ' Μήπως εννοείς <a href="?q=' + encodeURIComponent(dm) + '">' + esc(dm) + "</a>;" : "") + " Δοκίμασε λιγότερες λέξεις ή δες <a href=\"" + B + "yliko/\">όλο το υλικό</a>.</p>"; return; }
          var g = { b: [], s: [], p: [] }; r.res.forEach(function (o) { g[o.x.g || "p"].push(o.x); });
          var h = '<p class="lst-n"><b>' + r.res.length + "</b> αποτελέσματα για «" + esc(q) + "»</p>";
          if (g.b.length) h += '<h2 class="grp">Βιβλία</h2><div class="sr-l sr-l--g">' + g.b.map(resItem).join("") + "</div>";
          if (g.s.length) h += '<h2 class="grp">Σελίδες</h2><div class="sr-l sr-l--g">' + g.s.map(resItem).join("") + "</div>";
          if (g.p.length) h += '<h2 class="grp">Υλικό</h2><div class="sr-l sr-l--g">' + g.p.map(resItem).join("") + "</div>";
          out.innerHTML = h;
        } else {
          box.innerHTML = r.res.length ? r.res.map(resItem).join("") + '<a class="sx-all" href="' + B + "anazitisi/?q=" + encodeURIComponent(q) + '">Όλα τα αποτελέσματα →</a>' : '<p class="sx-hint">Πάτα Enter για πλήρη αναζήτηση.</p>';
          box.hidden = false;
        }
      });
    };
    var t; inp.addEventListener("input", function () { clearTimeout(t); t = setTimeout(run, 90); });
    inp.addEventListener("focus", function () { loadIdx(); if (inp.value.trim() && box) run(); });
    d.addEventListener("click", function (e) { if (box && !f.contains(e.target)) box.hidden = true; });
    if (full) { var q0 = new URLSearchParams(location.search).get("q"); if (q0) { inp.value = q0; run(); } f.addEventListener("submit", function (e) { e.preventDefault(); history.replaceState(null, "", "?q=" + encodeURIComponent(inp.value.trim())); run(); }); }
  });

  /* ---------- λίστες υλικού με φίλτρα (χωρίς επαναφόρτωση) ---------- */
  var lst = $("[data-list]");
  if (lst) {
    var grid = $("[data-grid]", lst), form = $("[data-filter]", lst), nEl = $("[data-n]", lst), more = $("[data-more]", lst), empty = $(".lst-empty", lst);
    var base = JSON.parse(lst.getAttribute("data-f") || "{}"), shown = 48, sh = null;
    var qp = new URLSearchParams(location.search);
    ["t", "m", "e", "q", "o", "y"].forEach(function (k) { if (qp.get(k) && form.elements[k]) form.elements[k].value = qp.get(k); });
    var yr = qp.get("y");
    var go = function (push) {
      Promise.all([loadIdx(), sh || (sh = import(B + "assets/js/shared.mjs"))]).then(function (a) {
        var j = a[0], S = a[1], st = j.state, f = { l: form.elements.t.value, m: form.elements.m.value, e: form.elements.e.value, q: form.elements.q.value.trim(), o: form.elements.o.value };
        var items = j.posts.filter(function (p) { return (!f.l || p.lvl.indexOf(f.l) >= 0) && (!f.m || p.subj.indexOf(f.m) >= 0) && (!f.e || p.type === f.e) && (!yr || String(p.year) === yr); });
        if (f.q) { var r = search(f.q, 400), ids = {}; r.res.forEach(function (o, i) { if (o.x.g === "p") ids[o.x.id] = i + 1; }); items = items.filter(function (p) { return ids[p.id]; }).sort(function (a, b) { return ids[a.id] - ids[b.id]; }); }
        else if (f.o === "old") items.reverse(); else if (f.o === "az") items.sort(function (a, b) { return a.title.localeCompare(b.title, "el"); });
        nEl.textContent = items.length; empty.hidden = !!items.length;
        grid.innerHTML = items.slice(0, shown).map(function (p) { return S.postCard(st, { base: B, state: st }, p); }).join("");
        if (more) more.parentNode.hidden = items.length <= shown;
        $$(".qf", lst).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.e === f.e ? "true" : "false"); });
        if (push) { var u = new URLSearchParams(); if (f.l && f.l !== base.l) u.set("t", f.l); if (f.m && f.m !== base.m) u.set("m", f.m); if (f.e && f.e !== base.e) u.set("e", f.e); if (f.q) u.set("q", f.q); if (f.o) u.set("o", f.o); if (yr) u.set("y", yr); history.replaceState(null, "", location.pathname + (u + "" ? "?" + u : "")); }
      });
    };
    form.addEventListener("change", function () { shown = 48; go(true); });
    form.addEventListener("submit", function (e) { e.preventDefault(); go(true); });
    var tq; form.elements.q.addEventListener("input", function () { clearTimeout(tq); tq = setTimeout(function () { shown = 48; go(true); }, 160); });
    $$(".qf", lst).forEach(function (b) { b.addEventListener("click", function () { form.elements.e.value = form.elements.e.value === b.dataset.e ? "" : b.dataset.e; shown = 48; go(true); }); });
    more && more.addEventListener("click", function () { shown += 48; go(false); });
    if (location.search) go(false);
  }

  /* ---------- προβολή PDF ---------- */
  var pv = $("#pv"), pvB = pv && $(".pv-b", pv), pvUrl = null;
  function pvOpen(url, title, blob) {
    if (!pv) return;
    $(".pv-t", pv).textContent = title || "";
    var dl = $(".pv-dl", pv), nw = $(".pv-new", pv);
    dl.href = url; dl.setAttribute("download", (title || "arxeio").replace(/[^\wα-ωΑ-ΩάέήίόύώΆΈΉΊΌΎΏ -]+/g, "").trim() + ".pdf"); nw.href = url;
    pvB.innerHTML = ""; pv.hidden = false; lockScroll(true); pvUrl = url;
    if (!touch && innerWidth >= 900) { var fr = d.createElement("iframe"); fr.title = title || "PDF"; fr.src = url + "#view=FitH"; pvB.appendChild(fr); }
    else pdfRender(url, pvB);
    $(".pv-x", pv).focus();
  }
  function pvClose() { if (!pv) return; pv.hidden = true; pvB.innerHTML = ""; lockScroll(false); }
  pv && $(".pv-x", pv).addEventListener("click", pvClose);
  var pdfjsP = null;
  function pdfRender(url, host) {
    host.innerHTML = '<div class="pdf-l"><span class="spin"></span>Άνοιγμα αρχείου…</div>';
    pdfjsP = pdfjsP || import(B + "assets/vendor/pdfjs/pdf.min.mjs").then(function (m) { m.GlobalWorkerOptions.workerSrc = B + "assets/vendor/pdfjs/pdf.worker.min.mjs"; return m; });
    pdfjsP.then(function (pdfjs) {
      return pdfjs.getDocument({ url: url, cMapUrl: B + "assets/vendor/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: B + "assets/vendor/pdfjs/standard_fonts/" }).promise;
    }).then(function (doc) {
      host.innerHTML = ""; var wrap = d.createElement("div"); wrap.className = "pdf-pages"; host.appendChild(wrap);
      var W = Math.min(host.clientWidth - 16, 1000), dpr = Math.min(devicePixelRatio || 1, 2);
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !e.target.dataset.done) { e.target.dataset.done = 1; draw(+e.target.dataset.n, e.target); } }); }, { root: host, rootMargin: "600px 0px" });
      function draw(n, box) { doc.getPage(n).then(function (pg) { var v0 = pg.getViewport({ scale: 1 }), sc = W / v0.width, v = pg.getViewport({ scale: sc * dpr }); var c = d.createElement("canvas"); c.width = v.width; c.height = v.height; c.style.width = W + "px"; c.style.height = (v.height / dpr) + "px"; box.appendChild(c); pg.render({ canvasContext: c.getContext("2d"), viewport: v }); }); }
      doc.getPage(1).then(function (pg) {
        var v = pg.getViewport({ scale: 1 }), h = W * v.height / v.width;
        for (var i = 1; i <= doc.numPages; i++) { var b = d.createElement("div"); b.className = "pdf-pg"; b.dataset.n = i; b.style.minHeight = h + "px"; b.setAttribute("aria-label", "Σελίδα " + i); wrap.appendChild(b); io.observe(b); }
        var cnt = d.createElement("p"); cnt.className = "pdf-n"; cnt.textContent = doc.numPages + " σελίδες"; host.insertBefore(cnt, wrap);
      });
    }).catch(function () { host.innerHTML = '<div class="pdf-l">Το αρχείο δεν άνοιξε εδώ. <a href="' + esc(url) + '" target="_blank" rel="noopener">Άνοιξέ το σε νέα καρτέλα</a>.</div>'; });
  }
  d.addEventListener("click", function (e) {
    var v = e.target.closest("[data-view]"); if (!v) return; e.preventDefault();
    pvOpen(v.getAttribute("data-view"), v.getAttribute("data-title"));
  });

  /* ---------- κλειδωμένο υλικό: αποκρυπτογράφηση στον browser ---------- */
  function normCode(s) { var GR = { "Ά": "A", "Έ": "E", "Ή": "H", "Ί": "I", "Ό": "O", "Ύ": "Y", "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X" }; return String(s).toUpperCase().replace(/[ΆΈΉΊΌΎΑΒΕΖΗΙΚΜΝΟΡΤΥΧ]/g, function (c) { return GR[c]; }).replace(/[^\p{L}\p{N}]+/gu, ""); }
  var u8 = function (b64) { var s = atob(b64), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
  function keyFor(code, salt) { return crypto.subtle.importKey("raw", new TextEncoder().encode(normCode(code)), "PBKDF2", false, ["deriveKey"]).then(function (k) { return crypto.subtle.deriveKey({ name: "PBKDF2", salt: u8(salt), iterations: 150000, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["decrypt"]); }); }
  function unlock(box, code, remember) {
    var L = JSON.parse(box.getAttribute("data-lock")), err = $(".lock-err", box);
    if (!L.enc) { err.hidden = false; err.textContent = "Τα αρχεία αυτής της ενότητας ανεβαίνουν αυτές τις μέρες. Ζήτησέ μου τον κωδικό και θα σε ειδοποιήσω μόλις ανέβουν."; return; }
    keyFor(code, L.salt).then(function (key) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: u8(L.iv) }, key, u8(L.enc)).then(function (buf) { return { key: key, data: JSON.parse(new TextDecoder().decode(buf)) }; }); })
      .then(function (r) {
        if (remember) try { localStorage.setItem("nm-code-" + L.id, code); } catch (e) {}
        box.classList.add("is-open"); err.hidden = true;
        var out = $(".lock-out", box); out.hidden = false;
        out.innerHTML = (r.data.body || "") + '<div class="files">' + (r.data.files || []).map(function (f, i) {
          var enc = f.iv ? ' data-enc="' + esc(f.iv) + '"' : "";
          return '<div class="fc"><button type="button" class="fc-v" data-lockfile="' + i + '"' + enc + ' aria-label="Άνοιγμα: ' + esc(f.t) + '"><span class="fc-ph"><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg><b>PDF</b></span><span class="fc-eye">Άνοιγμα</span></button><div class="fc-b"><b>' + esc(f.t) + "</b><small>PDF" + (f.n ? " · " + f.n + " σελίδες" : "") + '</small><div class="fc-a"><button type="button" class="btn btn--ink btn--sm" data-lockfile="' + i + '">Διάβασέ το</button></div></div></div>';
        }).join("") + "</div>";
        out.addEventListener("click", function (e) {
          var b = e.target.closest("[data-lockfile]"); if (!b) return; var f = r.data.files[+b.dataset.lockfile]; var url = /^(https?:|\/)/.test(f.u) ? f.u : NM.files + f.u;
          if (!f.iv) return pvOpen(url, f.t);
          b.disabled = true;
          fetch(url).then(function (x) { return x.arrayBuffer(); }).then(function (ab) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: u8(f.iv) }, r.key, ab); })
            .then(function (pl) { b.disabled = false; pvOpen(URL.createObjectURL(new Blob([pl], { type: "application/pdf" })), f.t); })
            .catch(function () { b.disabled = false; alert("Το αρχείο δεν άνοιξε. Δοκίμασε ξανά."); });
        });
        $(".lock-f", box).hidden = true; $(".lock-b p", box).textContent = "Ξεκλειδώθηκε σε αυτή τη συσκευή."; $(".lock-b b", box).textContent = "Καλή μελέτη!";
      }).catch(function () { err.hidden = false; err.textContent = "Ο κωδικός δεν είναι σωστός. Δοκίμασε ξανά ή ζήτησέ τον."; $(".lock-f input", box).select(); });
  }
  $$("[data-lock]").forEach(function (box) {
    var L = JSON.parse(box.getAttribute("data-lock")), saved = null;
    try { saved = localStorage.getItem("nm-code-" + L.id); } catch (e) {}
    if (saved && L.enc) unlock(box, saved, false);
    $(".lock-f", box).addEventListener("submit", function (e) { e.preventDefault(); unlock(box, $("input", e.target).value, true); });
  });

  /* ---------- βιβλία: εναλλαγή στην αρχική, γύρισμα στη σελίδα βιβλίου ---------- */
  $$("[data-rotate]").forEach(function (box) {
    var it = $$(".rb", box), dots = $$(".rb-dots i", box.parentNode), i = 0, t, paused = false;
    if (it.length < 2) return;
    var show = function (n) { it[i].classList.remove("is-on"); it[i].setAttribute("aria-hidden", "true"); it[i].tabIndex = -1; dots[i] && dots[i].classList.remove("is-on"); i = (n + it.length) % it.length; it[i].classList.add("is-on"); it[i].removeAttribute("aria-hidden"); it[i].tabIndex = 0; dots[i] && dots[i].classList.add("is-on"); };
    var tick = function () { if (!paused && !d.hidden) show(i + 1); };
    if (!RM) t = setInterval(tick, 3200);
    box.addEventListener("mouseenter", function () { paused = true; }); box.addEventListener("mouseleave", function () { paused = false; });
    box.addEventListener("focusin", function () { paused = true; }); box.addEventListener("focusout", function () { paused = false; });
    dots.forEach(function (dd, n) { dd.addEventListener("click", function () { show(n); }); });
  });
  $$("[data-flip]").forEach(function (b) { var btn = $("[data-flip-btn]", b), fl = $(".fl", b); if (!btn) return; var lbl = btn.textContent; btn.addEventListener("click", function () { var on = fl.classList.toggle("is-flipped"); btn.textContent = on ? "Δες το εξώφυλλο" : lbl; }); });

  /* ---------- ηχητικός οδηγός ---------- */
  var pod = $("#pod"), au = pod && $("audio", pod);
  function podOpen(on) { if (!pod) return; pod.hidden = !on; $$("[data-pod]").forEach(function (b) { b.setAttribute("aria-expanded", on ? "true" : "false"); }); if (!on && au) au.pause(); if (on) $(".pod-play", pod).focus(); }
  d.addEventListener("click", function (e) { if (e.target.closest("[data-pod]")) { e.preventDefault(); var wasOpen = !pod.hidden; podOpen(!wasOpen); if (!wasOpen && au && au.paused) { au.play().catch(function () {}); } } });
  if (pod) {
    $(".pod-x", pod).addEventListener("click", function () { podOpen(false); });
    if (au) {
      var play = $(".pod-play", pod), rng = $("input[type=range]", pod), tEl = $("[data-t]", pod), dEl = $("[data-d]", pod), rates = [1, 1.25, 1.5, 0.75], ri = 0;
      var fmt = function (s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
      play.addEventListener("click", function () { au.paused ? au.play() : au.pause(); });
      au.addEventListener("play", function () { pod.classList.add("is-playing"); d.body.classList.add("pod-on"); });
      au.addEventListener("pause", function () { pod.classList.remove("is-playing"); d.body.classList.remove("pod-on"); });
      au.addEventListener("loadedmetadata", function () { dEl.textContent = fmt(au.duration); });
      au.addEventListener("timeupdate", function () { tEl.textContent = fmt(au.currentTime); if (au.duration) rng.value = Math.round(au.currentTime / au.duration * 1000); var cur = null; $$(".pod-ch button", pod).forEach(function (b) { if (+b.dataset.at <= au.currentTime) cur = b; b.classList.remove("is-on"); }); cur && cur.classList.add("is-on"); });
      rng.addEventListener("input", function () { if (au.duration) au.currentTime = rng.value / 1000 * au.duration; });
      $(".pod-rate", pod).addEventListener("click", function (e) { ri = (ri + 1) % rates.length; au.playbackRate = rates[ri]; e.target.textContent = String(rates[ri]).replace(".", ",") + "×"; });
      $$(".pod-ch button", pod).forEach(function (b) { b.addEventListener("click", function () { au.currentTime = +b.dataset.at; au.play(); }); });
    }
  }

  /* ---------- Celly ---------- */
  var dr = $("#drawer"), drFrom = null;
  function drOpen(from) { if (!dr) return; drFrom = from; var fr = $("iframe", dr); if (!fr.src) fr.src = fr.getAttribute("data-src"); dr.hidden = false; requestAnimationFrame(function () { dr.classList.add("is-open"); }); $(".drawer-x", dr).focus(); }
  function drClose() { if (!dr) return; dr.classList.remove("is-open"); setTimeout(function () { dr.hidden = true; }, 260); drFrom && drFrom.focus && drFrom.focus(); }
  d.addEventListener("click", function (e) { var c = e.target.closest("[data-celly]"); if (c) { e.preventDefault(); dr && !dr.hidden ? drClose() : drOpen(c); } });
  dr && $(".drawer-x", dr).addEventListener("click", drClose);

  /* ---------- «Για πες…» ---------- */
  $$("[data-feedback]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (f.elements.hp.value) return;
      var body = { msg: f.elements.msg.value.trim(), who: f.elements.who.value, page: location.pathname };
      if (!body.msg) return;
      var btn = $("button[type=submit]", f); btn.disabled = true;
      var done = function () { $(".fbk-ok", f).hidden = false; f.elements.msg.value = ""; btn.disabled = false; };
      if (NM.mode === "live") fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(done, function () { location.href = "mailto:nikoletta.margariti@gmail.com?subject=" + encodeURIComponent("Για πες… (" + body.who + ")") + "&body=" + encodeURIComponent(body.msg); btn.disabled = false; });
      else { try { var a = JSON.parse(localStorage.getItem("nm-fb-demo") || "[]"); a.unshift(Object.assign({ at: new Date().toISOString() }, body)); localStorage.setItem("nm-fb-demo", JSON.stringify(a.slice(0, 50))); } catch (x) {} done(); }
    });
  });

  /* ---------- quiz ημέρας ---------- */
  var qz = $("[data-quiz]");
  if (qz) {
    var grade = (($(".qz-gr [aria-pressed=true]") || {}).dataset || {}).g;
    $$(".qz-gr button").forEach(function (b) { b.addEventListener("click", function () { $$(".qz-gr button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); grade = b.dataset.g; }); });
    var today = new Date().toISOString().slice(0, 10);
    var rng2 = function (seed) { var h = 1779033703; for (var i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; };
    $("[data-qz-go]", qz).addEventListener("click", function () {
      fetch(B + "assets/data/quiz.json?v=" + (NM.v || "")).then(function (r) { return r.json(); }).then(function (Q) {
        var pool = Q.questions.filter(function (q) { return q.grade === grade; }), r = rng2(today + "|" + grade);
        for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
        var qs = pool.slice(0, 5), k = 0, ok = 0;
        var ask = function () {
          if (k >= qs.length) { var best = 0; try { var st = JSON.parse(localStorage.getItem("nm-quiz") || "{}"); st[today + grade] = ok; localStorage.setItem("nm-quiz", JSON.stringify(st)); best = Object.keys(st).length; } catch (e) {} qz.innerHTML = '<p class="qz-res"><b>' + ok + "/" + qs.length + "</b> σωστές σήμερα!</p><p>" + (ok === qs.length ? "Τέλεια! Έλα ξανά αύριο για καινούργιες." : "Δες τη θεωρία και ξαναπροσπάθησε αύριο.") + '</p><a class="btn btn--sun" href="' + B + 'yliko/">Δες το υλικό</a>'; return; }
          var q = qs[k];
          qz.innerHTML = '<p class="qz-k">Ερώτηση ' + (k + 1) + " από " + qs.length + '</p><p class="qz-q">' + esc(q.q) + '</p><div class="qz-a">' + q.a.map(function (a, i) { return '<button type="button" data-i="' + i + '">' + esc(a) + "</button>"; }).join("") + "</div>";
          $$(".qz-a button", qz).forEach(function (b) { b.addEventListener("click", function () { var right = +b.dataset.i === q.correct; if (right) ok++; $$(".qz-a button", qz).forEach(function (x) { x.disabled = true; if (+x.dataset.i === q.correct) x.classList.add("is-ok"); }); if (!right) b.classList.add("is-no"); var ex = d.createElement("div"); ex.className = "qz-ex"; ex.innerHTML = (q.explain ? "<p>" + esc(q.explain) + "</p>" : "") + '<button type="button" class="btn btn--sun btn--sm">' + (k + 1 < qs.length ? "Επόμενη" : "Αποτέλεσμα") + "</button>"; qz.appendChild(ex); $("button", ex).addEventListener("click", function () { k++; ask(); }); $("button", ex).focus(); }); });
        };
        ask();
      });
    });
  }

  /* ---------- μικρά ---------- */
  d.addEventListener("click", function (e) { var c = e.target.closest("[data-copy]"); if (c) { navigator.clipboard && navigator.clipboard.writeText(c.getAttribute("data-copy")).then(function () { var t = c.textContent; c.textContent = "Αντιγράφηκε ✓"; setTimeout(function () { c.textContent = t; }, 1600); }); } });
  /* προφόρτωση σελίδων όταν ο δείκτης περνά από πάνω: η επόμενη σελίδα ανοίγει αμέσως */
  var pre = {};
  d.addEventListener("pointerover", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (!a || touch) return; var h = a.href; if (pre[h] || a.origin !== location.origin || /\.(pdf|jpg|webp|png)$/.test(h) || a.hasAttribute("download")) return; pre[h] = 1; var l = d.createElement("link"); l.rel = "prefetch"; l.href = h; d.head.appendChild(l); }, { passive: true });
  /* εμφάνιση στο scroll */
  if ("IntersectionObserver" in window && !RM) {
    d.documentElement.classList.add("rv-on");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    $$(".sec-h, .pc, .bk, .lt, .tys a, .yrs a, .fc, .tl-m, .me, .cel").forEach(function (el, i) { el.style.setProperty("--i", i % 8); io.observe(el); });
  }
})();
