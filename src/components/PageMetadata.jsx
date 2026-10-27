import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { businessName, getMetadata, organizationJson } from "../content/metadata";

// Update the existing head tags when visitors change pages or languages.
export default function PageMetadata() {
  const { pathname } = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    const page = getMetadata(pathname, lang);
    document.title = page.title;
    document.documentElement.lang = lang;
    document.querySelector('link[rel="canonical"]').href = page.url;
    // Keep one business information block on the homepage, including when
    // visitors arrive there through the menu instead of a full page load.
    let businessScript = document.getElementById("business-jsonld");
    if ((pathname.replace(/\/+$/, "") || "/") === "/") {
      if (!businessScript) {
        businessScript = document.createElement("script");
        businessScript.id = "business-jsonld";
        businessScript.type = "application/ld+json";
        document.head.appendChild(businessScript);
      }
      businessScript.textContent = organizationJson;
    } else {
      businessScript?.remove();
    }
    const values = {
      description: page.description,
      robots: page.robots,
      "og:type": "website",
      "og:site_name": businessName,
      "og:title": page.title,
      "og:description": page.description,
      "og:url": page.url,
      "og:image": page.image,
      "og:locale": page.locale,
      "twitter:card": "summary_large_image",
      "twitter:title": page.title,
      "twitter:description": page.description,
      "twitter:image": page.image,
    };
    for (const [name, content] of Object.entries(values)) {
      document.querySelector(`meta[${name.startsWith("og:") ? "property" : "name"}="${name}"]`).content = content;
    }
  }, [pathname, lang]);

  return null;
}
