// Services.jsx
// ------------
// The "Our Services" section on the Home page.
//
// Displays 4 service cards in a 2x2 grid on mobile and a 4-column row on desktop,
// matching the clean grid layout of the "Our Values" (Nuestros Valores) section.
//
// PLACEHOLDER NOTE:
//   The services listed here are placeholders until the client
//   confirms their full service list. Once confirmed, update the
//   services array in LanguageContext.jsx and add the real icons here.
//
// Each card has:
//   - An icon at the top (simple emoji for now, can swap for real icons)
//   - A service name (Oswald font, bold)
//   - A short description (Lato font, regular)

import { useLang } from "../context/LanguageContext";

// Service data -- icons are simple emoji placeholders for the POC
// Replace these with proper icons when the final service list is confirmed
const services = [
  { icon: "🖌️", nameKey: "service1_name", descKey: "service1_desc" },
  { icon: "🏠", nameKey: "service2_name", descKey: "service2_desc" },
  { icon: "🧱", nameKey: "service3_name", descKey: "service3_desc" },
  { icon: "🔧", nameKey: "service4_name", descKey: "service4_desc" },
];

export default function Services() {
  const { t } = useLang();

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section heading */}
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy text-center mb-10 uppercase">
          {t("services_heading")}
        </h2>

        {/* Cards container:
            - On mobile: 2-column grid (2x2 layout, matching Nuestros Valores)
            - On desktop: 4 cards in a row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.nameKey}
              className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition"
            >
              {/* Service icon */}
              <span className="text-3xl md:text-4xl mb-3 md:mb-4">{service.icon}</span>

              {/* Service name */}
              <h3 className="font-heading font-semibold text-base md:text-lg text-navy mb-2 uppercase">
                {t(service.nameKey)}
              </h3>

              {/* Service description */}
              <p className="font-body text-xs md:text-sm text-dark-text leading-relaxed">
                {t(service.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
