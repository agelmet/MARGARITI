/* Οι σελίδες του site στο live, φτιαγμένες τη στιγμή από το Netlify Blobs (ίδιος renderer με το draft).
   Μένουν στο CDN και καθαρίζουν σε κάθε «Δημοσίευση» από τον πίνακα. */
import { getState } from "./_lib.mjs";
import { route, docHtml, searchIndex, sitemapXml, rssXml, PAGES } from "./_shared.mjs";
import { V, CSS } from "./_ver.mjs";
const H = (type) => ({ "content-type": type, "cache-control": "public, max-age=0, must-revalidate", "netlify-cdn-cache-control": "public, durable, s-maxage=3600, stale-while-revalidate=300", "netlify-cache-tag": "nm" });
export default async (req) => {
  const u = new URL(req.url); const origin = u.origin; let p = decodeURIComponent(u.pathname);
  const state = await getState();
  const abs = (x) => origin + "/" + x;
  if (p === "/sitemap.xml") return new Response(sitemapXml(state, abs), { headers: H("application/xml; charset=utf-8") });
  if (p === "/rss.xml") return new Response(rssXml(state, abs), { headers: H("application/rss+xml; charset=utf-8") });
  if (p === "/assets/data/search.json") return new Response(JSON.stringify(searchIndex(state, V)), { headers: H("application/json; charset=utf-8") });
  if (p === "/assets/data/quiz.json") return new Response(JSON.stringify(state.quiz), { headers: H("application/json; charset=utf-8") });
  if (p !== "/" && !p.endsWith("/") && !/\.\w+$/.test(p)) return Response.redirect(origin + p + "/" + u.search, 301);
  const key = p.replace(/^\/|\/$/g, "").replace(/\/index\.html$/, "");
  const q = Object.fromEntries(u.searchParams);
  const ctx = { base: "/", origin, mode: "live", state, canonPath: "/" + (key ? key + "/" : "") };
  const r = route(state, ctx, key === "index.html" ? "" : key, q);
  return new Response(docHtml(state, ctx, r, { v: V, css: CSS }), { status: r.status || 200, headers: H("text/html; charset=utf-8") });
};
export const config = { path: ["/","/index.html","/sitemap.xml","/rss.xml","/assets/data/search.json","/yliko","/yliko/","/yliko/*","/eidos","/eidos/","/eidos/*","/taxi","/taxi/","/taxi/*","/anartisi","/anartisi/","/anartisi/*","/vivlia","/vivlia/","/vivlia/*","/istoriko","/istoriko/","/istoriko/*","/anazitisi","/anazitisi/","/anazitisi/*","/mathites","/mathites/","/mathites/*","/niki","/niki/","/niki/*","/ti-nea","/ti-nea/","/ti-nea/*","/ti-eipame-ti-kaname","/ti-eipame-ti-kaname/","/ti-eipame-ti-kaname/*","/gia-pes","/gia-pes/","/gia-pes/*","/online-mathimata","/online-mathimata/","/online-mathimata/*","/kathodigisi","/kathodigisi/","/kathodigisi/*","/epaggelmatikos-prosanatolismos","/epaggelmatikos-prosanatolismos/","/epaggelmatikos-prosanatolismos/*","/celly","/celly/","/celly/*","/kathigites","/kathigites/","/kathigites/*","/epikoinonia","/epikoinonia/","/epikoinonia/*","/aporrito","/aporrito/","/aporrito/*","/pnevmatiki-idioktisia","/pnevmatiki-idioktisia/","/pnevmatiki-idioktisia/*"] };
