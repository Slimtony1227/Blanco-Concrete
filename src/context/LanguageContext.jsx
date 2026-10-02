// LanguageContext.jsx
// -------------------
// This file manages the language toggle for the whole site.
//
// Think of it like a lightswitch that the entire site can see.
// When the user clicks EN | SPA in the navbar, this flips
// between Spanish ("es") and English ("en"), and every
// component on the page updates instantly.
//
// We use React Context for this -- it is a way to share
// a piece of data (the current language) with every component
// on the site without having to pass it manually through
// every single file.

import { createContext, useContext, useState } from "react";

// All text content for the site in both languages.
// Spanish (es) is the default -- the site launches in Spanish.
const translations = {
  es: {
    // --- Navbar ---
    nav_home:    "Inicio",
    nav_about:   "Nosotros",
    nav_contact: "Contacto",

    // --- Hero ---
    hero_title:    "Blanco's Concrete Paint & Maintenance Service",
    hero_line1:    "Deja que los expertos hagan tu trabajo de Pintura, Concreto y Mantenimiento",
    hero_line2:    "Nos presentamos, hacemos el trabajo bien y dejamos la propiedad mejor de como la encontramos.",
    hero_cta1:     "Solicita un Presupuesto Gratis",
    hero_cta2:     "Llamar Ahora",

    // --- Services ---
    services_heading: "Nuestros Servicios",
    service1_name:    "Pintura Interior",
    service1_desc:    "Transformamos los espacios interiores de tu hogar o negocio con acabados limpios y duraderos.",
    service2_name:    "Pintura Exterior",
    service2_desc:    "Protegemos y embellecemos el exterior de tu propiedad con pintura de alta calidad.",
    service3_name:    "Trabajo en Concreto",
    service3_desc:    "Instalación y reparación de concreto para pisos, entradas, aceras y más.",
    service4_name:    "Mantenimiento",
    service4_desc:    "Servicios generales de mantenimiento para mantener tu propiedad en perfectas condiciones.",

    // --- Results ---
    results_heading: "Nuestros Resultados",
    results_before:  "Antes",
    results_after:   "Después",

    // --- Service Areas ---
    areas_heading: "Áreas que Servimos",
    areas_cta:     "Solicita un Presupuesto Gratis",
    area1: "Dunn, NC",
    area2: "Raleigh, NC",
    area3: "Fayetteville, NC",
    area4: "Áreas Cercanas",

    // --- Footer ---
    footer_contact_heading: "Contáctanos",
    footer_location:        "Dunn, NC",
    footer_rights:          "Todos los derechos reservados",
    footer_credit:          "Diseñado y Desarrollado por Anthony M. Aguilar",

    // --- About Us ---
    about_heading:  "Nuestra Historia y Misión",
    about_body:     "En Blanco's Concrete Paint & Maintenance Service, nuestra misión es brindar servicios de pintura, concreto y mantenimiento en los que North Carolina puede confiar. Entendemos que una propiedad es más que una inversión -- la tratamos con cuidado y dedicación. Con base en Dunn, NC, hemos construido nuestra reputación sobre trabajo de calidad, precios honestos y un servicio al cliente local excepcional. Ya sea que necesites pintar una habitación, renovar el exterior de tu hogar o mantener tu propiedad en perfectas condiciones, estamos aquí para ayudarte. Servimos a propietarios y negocios en Dunn, Raleigh, Fayetteville y las áreas circundantes, llevando nuestra experiencia y dedicación a cada proyecto.",

    // --- Values ---
    values_heading: "Nuestros Valores",
    value1_name:    "Calidad",
    value1_desc:    "Hacemos el trabajo bien a la primera.",
    value2_name:    "Honestidad",
    value2_desc:    "Precios claros, sin sorpresas.",
    value3_name:    "Puntualidad",
    value3_desc:    "Nos presentamos cuando decimos que lo haremos.",
    value4_name:    "Cuidado",
    value4_desc:    "Tratamos tu propiedad como si fuera nuestra.",

    // --- Contact ---
    contact_heading: "Contáctanos",
    contact_soon:    "Esta página estará disponible muy pronto. Mientras tanto, puedes contactarnos por WhatsApp o llamada.",
    contact_cta:     "Escríbenos por WhatsApp",
  },

  en: {
    // --- Navbar ---
    nav_home:    "Home",
    nav_about:   "About Us",
    nav_contact: "Contact",

    // --- Hero ---
    hero_title:    "Blanco's Concrete Paint & Maintenance Service",
    hero_line1:    "Let the experts do your Paint, Concrete & Maintenance work",
    hero_line2:    "We show up, do the job right and leave the property better than we found it.",
    hero_cta1:     "Request a Free Quote",
    hero_cta2:     "Call Now",

    // --- Services ---
    services_heading: "Our Services",
    service1_name:    "Interior Painting",
    service1_desc:    "We transform the interior spaces of your home or business with clean, long-lasting finishes.",
    service2_name:    "Exterior Painting",
    service2_desc:    "We protect and beautify the exterior of your property with high-quality paint.",
    service3_name:    "Concrete Work",
    service3_desc:    "Installation and repair of concrete for floors, driveways, sidewalks and more.",
    service4_name:    "Maintenance",
    service4_desc:    "General maintenance services to keep your property in perfect condition.",

    // --- Results ---
    results_heading: "Our Results",
    results_before:  "Before",
    results_after:   "After",

    // --- Service Areas ---
    areas_heading: "Areas We Serve",
    areas_cta:     "Request a Free Quote",
    area1: "Dunn, NC",
    area2: "Raleigh, NC",
    area3: "Fayetteville, NC",
    area4: "Surrounding Areas",

    // --- Footer ---
    footer_contact_heading: "Contact Us",
    footer_location:        "Dunn, NC",
    footer_rights:          "All rights reserved",
    footer_credit:          "Designed and Developed by Anthony M. Aguilar",

    // --- About Us ---
    about_heading:  "Our Story & Mission",
    about_body:     "At Blanco's Concrete Paint & Maintenance Service, our mission is to provide painting, concrete and maintenance services that North Carolina can trust. We understand that property is more than just an investment -- we treat it with care and dedication. Based in Dunn, NC, we have built our reputation on quality work, honest pricing and outstanding local customer service. Whether you need a single room painted, your entire home exterior refreshed or ongoing property maintenance, we are here to help. We serve homeowners and businesses throughout Dunn, Raleigh, Fayetteville and surrounding areas, bringing our expertise and dedication to every project.",

    // --- Values ---
    values_heading: "Our Values",
    value1_name:    "Quality",
    value1_desc:    "We do the job right the first time.",
    value2_name:    "Honesty",
    value2_desc:    "Clear pricing, no surprises.",
    value3_name:    "Punctuality",
    value3_desc:    "We show up when we say we will.",
    value4_name:    "Care",
    value4_desc:    "We treat your property like our own.",

    // --- Contact ---
    contact_heading: "Contact Us",
    contact_soon:    "This page is coming soon. In the meantime, reach us via WhatsApp or phone call.",
    contact_cta:     "Message Us on WhatsApp",
  },
};

// Create the context -- this is the shared "lightswitch" mentioned above
const LanguageContext = createContext();

// LanguageProvider wraps the whole app so every component can access the language
export function LanguageProvider({ children }) {
  // Start in Spanish ("es") by default
  const [lang, setLang] = useState("es");

  // Toggle between Spanish and English
  const toggleLang = () => setLang((prev) => (prev === "es" ? "en" : "es"));

  // t(key) is a helper function -- call t("hero_title") and it returns
  // the right text for whichever language is currently active
  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// useLang is a shortcut hook -- in any component, call:
// const { t, lang, toggleLang } = useLang();
export function useLang() {
  return useContext(LanguageContext);
}
