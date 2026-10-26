# React + Vite

Start the local website, reviews database, and Worker with `npm start`.
See [Local development](./LOCAL-DEVELOPMENT.md) for setup, command explanations,
and the local review approval walkthrough.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Page metadata

The homepage title is `Blanco's Concrete Paint & Maintenance Service | Raleigh, NC`.
The public domain is `https://blancosconcretepaintandmaintenance.com/`.
Edit page titles and descriptions in `src/content/metadata.js`; keep the default
Spanish homepage tags in `index.html` consistent with it.

- `<title>` supplies the browser tab title and a possible search result title.
- `meta name="description"` supplies a suggested search result description.
- `link rel="canonical"` gives the preferred public address of each page.
- `og:*` tags supply shared-link titles, descriptions, address, and language.
- `twitter:*` tags supply the text for an X/Twitter link preview.
- `lang` identifies the page language; `og:locale` uses `es_US` for Spanish
  or `en_US` for English. The language toggle updates these and the descriptions.
- `robots` uses `index, follow` on public pages and `noindex, nofollow` on the
  review administration page. This requests exclusion from search; it is not
  password protection.

`npm run build` runs the existing build and then `scripts/build-metadata.mjs`.
Here, `run` selects the `build` script in `package.json`; `&&` runs the metadata
step only if the site build succeeds. There are no extra command flags.
The metadata step writes HTML files for each page, so shared-link services can
read the correct Spanish metadata without running JavaScript. It does not
pre-render the page content. No packages were added. No social image is set yet.
Changes must be deployed before they appear on the public site.

### Sitemap and crawler instructions

The same build step generates `dist/sitemap.xml` and `dist/robots.txt`.
The sitemap lists the preferred public addresses for Home (`/`), About
(`/nosotros`), and Contact (`/contacto`). It excludes pages marked `noindex`
in `src/content/metadata.js`, including review administration. Adding another
public page to that shared list includes it in the next build's sitemap.
No guessed update dates or duplicate language URLs are included.

`robots.txt` allows public pages and their images and scripts, asks crawlers
to skip `/admin/` and `/api/`, and points to the sitemap. These instructions
do not replace sign-in protection or the administration page's `noindex` tags.
Both generated files are served as real files instead of the homepage fallback.
No packages were added.

Publishing is deferred until all site changes are ready. After deployment:

1. Check `/sitemap.xml` returns XML and `/robots.txt` returns plain text,
   both with a successful response and without a sign-in screen.
2. Verify `blancosconcretepaintandmaintenance.com` as a Domain property in
   [Google Search Console](https://search.google.com/search-console). Use the
   DNS TXT record supplied by Google; keep it after verification.
3. Submit `https://blancosconcretepaintandmaintenance.com/sitemap.xml` in
   Search Console's Sitemaps report.
4. Inspect the homepage, `/nosotros`, and `/contacto` in URL Inspection and
   request indexing. Submission does not guarantee indexing or ranking.

Domain verification can happen before publishing. Sitemap submission and
indexing requests should wait until the updated files are live.

Status on October 26, 2026: Google Search Console displayed **Ownership
verified** using the domain name provider method, and the Domain property's
Overview opened successfully. Keep its verification DNS record in place.
The local preview returned `200 application/xml` for `/sitemap.xml` and
`200 text/plain` for `/robots.txt`; all three public pages returned the expected
preferred addresses and indexing tags. Publishing, sitemap submission, and
indexing requests remain pending until all site changes are ready.

### Business information (JSON-LD)

`src/content/metadata.js` also holds the public business name, website, phone,
and Raleigh, Dunn, and Fayetteville service areas. The build places these in
the homepage HTML, and `PageMetadata` keeps the block correct during navigation.
No address is included because the business travels to customers. No new
packages are needed. A logo can be added once the preferred image is confirmed.

- `<script type="application/ld+json">` holds information for search engines;
  it is data, not code that runs on the page.
- `@context` selects Schema.org's shared vocabulary for business facts.
- `@type: Organization` describes the business as an organization.
- `@id` gives the organization a stable identifier using the website address.
- `name`, `url`, and `telephone` identify the business and its contact details.
- `areaServed` lists cities the business travels to; it does not claim offices.
- `id="business-jsonld"` lets the website update the same block without duplicates.

Checked locally by building the site and reading the generated JSON. After
deployment, check the homepage with Google's Rich Results Test and Search
Console URL Inspection. JSON-LD does not guarantee indexing or search placement.
