// Keep the public address and page descriptions together for easy updates.
export const siteUrl = "https://blancosconcretepaintandmaintenance.com";
export const businessName = "Blanco's Concrete Paint & Maintenance Service";
export const socialImageUrl = `${siteUrl}/footage/logo.jpeg`;

// Public business facts for search engines. Service areas are places we travel
// to, not office addresses. No private address is included.
export const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: businessName,
  url: `${siteUrl}/`,
  logo: socialImageUrl,
  image: socialImageUrl,
  telephone: "+19194576553",
  areaServed: ["Raleigh, NC", "Dunn, NC", "Fayetteville, NC"].map((name) => ({
    "@type": "City",
    name,
  })),
};

// Escape angle brackets so future text cannot accidentally close the script tag.
export const organizationJson = JSON.stringify(organizationData).replaceAll("<", "\\u003c");

export const pageMetadata = {
  "/": {
    es: ["", "Servicios de pintura, concreto y mantenimiento en Raleigh, Dunn y Fayetteville, NC. Contacta a Blanco's para solicitar un presupuesto gratis."],
    en: ["", "Painting, concrete and property maintenance in Raleigh, Dunn and Fayetteville, NC. Contact Blanco's for a free estimate."],
  },
  "/nosotros": {
    es: ["Nosotros", "Conoce a Blanco's: servicios de pintura, concreto y mantenimiento con base en Dunn, NC, al servicio de Raleigh, Fayetteville y áreas cercanas."],
    en: ["About Us", "Meet Blanco's: painting, concrete and maintenance services based in Dunn, NC, serving Raleigh, Fayetteville and surrounding areas."],
  },
  "/contacto": {
    es: ["Contacto", "Contacta a Blanco's por teléfono o WhatsApp para solicitar un presupuesto gratis de pintura, concreto o mantenimiento en Raleigh y áreas cercanas."],
    en: ["Contact", "Contact Blanco's by phone or WhatsApp for a free painting, concrete or maintenance estimate in Raleigh and surrounding areas."],
  },
  "/admin/reviews": {
    es: ["Administrar reseñas", "Administración de reseñas de Blanco's."],
    en: ["Review Administration", "Blanco's review administration."],
    noindex: true,
  },
};

export function getMetadata(pathname, language = "es") {
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = pageMetadata[path];
  const [label, description] = (page || pageMetadata["/"])[language];
  return {
    title: `${businessName}${label ? ` — ${label}` : ""} | Raleigh, NC`,
    description,
    url: `${siteUrl}${path === "/" ? "/" : path}`,
    image: socialImageUrl,
    robots: !page || page.noindex ? "noindex, nofollow" : "index, follow",
    locale: language === "en" ? "en_US" : "es_US",
  };
}
