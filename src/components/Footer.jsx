// Footer.jsx
// ----------
// The footer at the bottom of every page.
//
// Contains:
//   - Business name (left column)
//   - Contact info: location, phone, email (right column)
//   - "All rights reserved" line
//   - "Designed and Developed by Anthony M. Aguilar" credit line

import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Top row: two columns on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">

          {/* Left column: Business name */}
          <div>
            <h3 className="font-heading font-bold text-xl uppercase mb-2">
              Blanco's Concrete Paint & Maintenance Service LLC
            </h3>
            <p className="font-body text-white/60 text-sm max-w-xs">
              {t("footer_location")}
            </p>
          </div>

          {/* Right column: Contact info */}
          <div>
            <h4 className="font-heading font-semibold text-base uppercase mb-3 text-white/80">
              {t("footer_contact_heading")}
            </h4>
            <ul className="font-body text-sm text-white/70 space-y-1">
              <li>{t("footer_location")}</li>
              <li>
                <a href="tel:+19194576553" className="hover:text-white transition">
                  (919) 457-6553
                </a>
              </li>
              <li>
                <a href="mailto:vaquiz228@gmail.com" className="hover:text-white transition">
                  vaquiz228@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-1 text-center">
          <p className="font-body text-xs text-white/50">
            &copy; {currentYear} Blanco's Concrete Paint & Maintenance Service LLC. {t("footer_rights")}.
          </p>
          <p className="font-body text-xs text-white/40">
            {t("footer_credit")}
          </p>
        </div>
      </div>
    </footer>
  );
}
