// Hero.jsx
// --------
// The first thing visitors see when they land on the site.
// It is a full-screen section with:
//   - A background photo of real painting/concrete work
//   - A dark overlay on top of the photo so the white text is readable
//   - The business name (big and bold)
//   - Two tagline lines
//   - Two buttons: WhatsApp CTA and Call Now
//
// PLACEHOLDER NOTE:
//   The background image is currently a free photo from Unsplash.
//   When the client provides their own photo, swap the URL in the
//   style={{ backgroundImage: ... }} line below.
//
// PHONE NUMBER:
//   (939) 457-6553 -- used for WhatsApp link and tel: call link

import { useLang } from "../context/LanguageContext";

// The WhatsApp link opens a chat with the client directly
const WHATSAPP_URL = "https://wa.me/19394576553";

// The phone number for the Call Now button
const PHONE = "tel:+19394576553";

// Placeholder hero background image (Unsplash -- free to use)
// Replace this URL with the real client photo when ready
const HERO_IMAGE = "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1920&q=80";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center text-white text-center px-4"
      style={{
        backgroundImage: `url(${HERO_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay -- sits on top of the photo, under the text */}
      {/* bg-black/50 means black at 50% opacity (half transparent, half dark tint) */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content -- sits on top of the dark overlay */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">

        {/* Business name -- the biggest text on the page */}
        <h1 className="font-heading font-bold text-4xl md:text-6xl leading-tight uppercase">
          {t("hero_title")}
        </h1>

        {/* First tagline line */}
        <p className="font-body text-lg md:text-xl font-bold">
          {t("hero_line1")}
        </p>

        {/* Second tagline line -- slightly smaller and lighter */}
        <p className="font-body text-base md:text-lg text-white/85">
          {t("hero_line2")}
        </p>

        {/* Buttons -- stacked on mobile, side by side on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">

          {/* WhatsApp button -- green, taps to open WhatsApp chat */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp text-white font-body font-bold text-base rounded-full px-7 py-3 flex items-center justify-center gap-2 hover:brightness-110 transition"
          >
            {/* WhatsApp icon (simple SVG) */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("hero_cta1")}
          </a>

          {/* Call Now button -- outline style, taps to call on mobile */}
          <a
            href={PHONE}
            className="border-2 border-accent-blue text-white font-body font-bold text-base rounded-full px-7 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition"
          >
            {/* Phone icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
            </svg>
            {t("hero_cta2")}
          </a>
        </div>
      </div>
    </section>
  );
}
