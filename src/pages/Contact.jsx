// Contact.jsx  (Page 3)
// ----------------------
// The Contact page -- currently a "coming soon" placeholder.
//
// The full contact page design has not been defined yet.
// This holds the space and gives visitors a way to reach
// the business in the meantime via WhatsApp.
//
// When the contact page design is decided, this file
// gets replaced with the real form/content.

import { useLang } from "../context/LanguageContext";

const WHATSAPP_URL = "https://wa.me/19394576553";

export default function Contact() {
  const { t } = useLang();

  return (
    <section className="bg-white min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-6">

        {/* Heading */}
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy uppercase">
          {t("contact_heading")}
        </h2>

        {/* Coming soon message */}
        <p className="font-body text-base text-dark-text leading-relaxed">
          {t("contact_soon")}
        </p>

        {/* WhatsApp button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-whatsapp text-white font-body font-bold text-base rounded-full px-8 py-3 flex items-center gap-2 hover:brightness-110 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("contact_cta")}
        </a>

        {/* Phone number as a tap-to-call link */}
        <a
          href="tel:+19394576553"
          className="font-body text-accent-blue font-bold text-lg hover:underline"
        >
          (939) 457-6553
        </a>
      </div>
    </section>
  );
}
