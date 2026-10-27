import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pageMetadata, getMetadata, organizationJson, siteUrl } from "../src/content/metadata.js";

// Shared-link services often do not run JavaScript. Give each built page
// its own HTML file so its metadata is available before React starts.
const template = (await readFile(new URL("../dist/index.html", import.meta.url), "utf8"))
  .replace(/<script id="business-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const path of Object.keys(pageMetadata)) {
  const page = getMetadata(path);
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`);
  const values = {
    description: page.description, robots: page.robots,
    "og:title": page.title, "og:description": page.description,
    "og:url": page.url, "og:image": page.image, "og:locale": page.locale,
    "twitter:title": page.title, "twitter:description": page.description,
    "twitter:image": page.image,
  };
  for (const [name, content] of Object.entries(values)) {
    html = html.replace(new RegExp(`(<meta (?:name|property)="${name}" content=")[^"]*("\\s*/>)`), (_, before, after) => `${before}${escape(content)}${after}`);
  }
  html = html.replace(/(<link rel="canonical" href=")[^"]*("\s*\/>)/, (_, before, after) => `${before}${escape(page.url)}${after}`);
  if (path === "/") {
    html = html.replace("</head>", () => `  <script id="business-jsonld" type="application/ld+json">${organizationJson}</script>\n  </head>`);
  }
  const directory = new URL(`../dist${path === "/" ? "" : path}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), html);
}
console.log("Added page metadata to the built Home, About, Contact and review administration pages.");

// List only public pages, using the same preferred addresses as their HTML.
const publicUrls = Object.entries(pageMetadata)
  .filter(([, page]) => !page.noindex)
  .map(([path]) => getMetadata(path).url);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicUrls.map((url) => `  <url><loc>${escape(url)}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(new URL("../dist/sitemap.xml", import.meta.url), sitemap);

// Public pages and their images/scripts may be crawled. Private administration
// still relies on sign-in and noindex; these rules are not password protection.
const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;
await writeFile(new URL("../dist/robots.txt", import.meta.url), robots);
console.log(`Added sitemap.xml with ${publicUrls.length} public pages and robots.txt.`);
