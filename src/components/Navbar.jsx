// Navbar.jsx
// ----------
// The navigation bar at the top of every page.
//
// What it does:
//   - Shows the business name on the left
//   - Shows nav links (Home, About Us, Contact) on the right
//   - Has the EN | SPA language toggle button on the far left
//   - On mobile: hides the nav links behind a hamburger menu (three lines)
//   - On desktop: shows all links in a row
//
// The hamburger menu opens and closes when tapped.
// Clicking a link closes the menu automatically.

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const location = useLocation(); // tells us which page is currently active

  // menuOpen controls whether the mobile menu is showing (true) or hidden (false)
  const [menuOpen, setMenuOpen] = useState(false);

  // The three nav links with their URLs and translation keys
  const links = [
    { to: "/",         label: t("nav_home")    },
    { to: "/nosotros", label: t("nav_about")   },
    { to: "/contacto", label: t("nav_contact") },
  ];

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LEFT SIDE: Language toggle + Business name */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">

          {/* Language toggle button -- switches between EN and SPA */}
          <button
            onClick={toggleLang}
            className="text-white text-sm font-body font-bold tracking-widest border border-white/40 rounded px-2 py-1 hover:bg-white/10 transition shrink-0"
          >
            {lang === "es" ? "EN" : "SPA"}
          </button>

          {/* Business name -- clicking takes you to the home page */}
          <Link
            to="/"
            className="text-white font-heading font-bold text-xs sm:text-sm md:text-base lg:text-lg leading-tight tracking-wide hover:text-white/90 transition min-w-0"
          >
            Blanco's Concrete Paint &amp; Maintenance Service
          </Link>
        </div>

        {/* RIGHT SIDE (desktop): Nav links shown in a row */}
        <div className="hidden md:flex items-center gap-6 shrink-0 ml-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm font-bold tracking-wide transition ${
                location.pathname === link.to
                  ? "text-white underline underline-offset-4"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE (mobile): Hamburger button -- three lines icon */}
        <button
          className="md:hidden text-white flex flex-col gap-1.5 p-1 shrink-0 ml-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {/* Each span is one line of the hamburger icon */}
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU -- only shows when hamburger is tapped */}
      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 pb-4 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)} // close menu when a link is tapped
              className={`font-body font-bold text-base py-2 border-b border-white/10 ${
                location.pathname === link.to ? "text-white" : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
