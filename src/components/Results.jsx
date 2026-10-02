// Results.jsx
// -----------
// The "Our Results" (Nuestros Resultados) section on the Home page.
//
// Shows comparison rows between before and after work:
//   - Left side: "Antes" (Before)
//   - Right side: "Después" (After)
//
// Photos are loaded from the project footage folders (row1 and row2).
// If a side has multiple photos, it renders an interactive slideshow with arrow buttons and dot navigation.
// If a side has 1 photo, it renders cleanly as a single image.

import { useState } from "react";
import { useLang } from "../context/LanguageContext";

// -------------------------------------------------------------
// ROW 1 PHOTOS (From folder: footage/row1)
// -------------------------------------------------------------
// Antes: Exterior window installation in progress
const ROW1_ANTES = [
  {
    src: "/footage/row1/antes.jpeg",
    alt: "Antes - Instalación de ventanas y fachada exterior",
  },
];

// Después: Finished deck, stairs, railing, and garden planter box
const ROW1_DESPUES = [
  {
    src: "/footage/row1/1.jpeg",
    alt: "Después - Terraza de madera y barandas terminadas",
  },
  {
    src: "/footage/row1/2.jpeg",
    alt: "Después - Escaleras y acabado protector de madera",
  },
  {
    src: "/footage/row1/3.jpeg",
    alt: "Después - Caja jardinera artesanal con flores",
  },
  {
    src: "/footage/row1/4.jpeg",
    alt: "Después - Área de patio y jardín completada",
  },
];

// -------------------------------------------------------------
// ROW 2 PHOTOS (From folder: footage/row2)
// -------------------------------------------------------------
// Antes: Sunroom interior, lakeview exterior preparation, block wall, and columns
const ROW2_ANTES = [
  {
    src: "/footage/row2/antes3.jpeg",
    alt: "Antes - Estructura interior del solárium y aislamiento",
  },
  {
    src: "/footage/row2/antes7.jpeg",
    alt: "Antes - Fachada exterior con vista al lago",
  },
  {
    src: "/footage/row2/antes8.jpeg",
    alt: "Antes - Aislamiento e impermeabilización de fachada",
  },
  {
    src: "/footage/row2/antes6.jpeg",
    alt: "Antes - Columnas de soporte y preparación",
  },
  {
    src: "/footage/row2/antes4.jpeg",
    alt: "Antes - Muro de bloques antes de renovación",
  },
  {
    src: "/footage/row2/5.jpeg",
    alt: "Antes - Interior del solárium",
  },
];

// Después: Full set of finished renovation photos (desp0 through desp9)
const ROW2_DESPUES = [
  {
    src: "/footage/row2/desp0.jpeg",
    alt: "Después - Columnas de soporte y estructura terminada",
  },
  {
    src: "/footage/row2/desp1.jpeg",
    alt: "Después - Acabado exterior con vista al lago",
  },
  {
    src: "/footage/row2/desp2.jpeg",
    alt: "Después - Detalle de barandas y terraza",
  },
  {
    src: "/footage/row2/desp3.jpeg",
    alt: "Después - Área de patio bajo terraza con mobiliario",
  },
  {
    src: "/footage/row2/desp4.jpeg",
    alt: "Después - Vista completa de la estructura exterior",
  },
  {
    src: "/footage/row2/desp5.jpeg",
    alt: "Después - Acabados y pintura protectora",
  },
  {
    src: "/footage/row2/desp6.jpeg",
    alt: "Después - Fachada y ventanales terminados",
  },
  {
    src: "/footage/row2/desp7.jpeg",
    alt: "Después - Patio exterior y columnas blancas",
  },
  {
    src: "/footage/row2/desp8.jpeg",
    alt: "Después - Vista lateral de la propiedad",
  },
  {
    src: "/footage/row2/desp9.jpeg",
    alt: "Después - Proyecto exterior finalizado",
  },
];

// Reusable panel for one side of a comparison (either Antes or Después)
function PhotoPanel({ title, photos }) {
  // Current slide index for this specific panel
  const [currentSlide, setCurrentSlide] = useState(0);

  const hasMultiple = photos.length > 1;

  // Go to previous photo
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  // Go to next photo
  const handleNext = () => {
    setCurrentSlide((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header with Title and Counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading font-bold text-xl md:text-2xl text-navy uppercase tracking-wide">
            {title}
          </span>
          <span className="font-body text-xs md:text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {photos.length > 0 ? `${currentSlide + 1} / ${photos.length}` : "0 / 0"}
          </span>
        </div>

        {/* Photo Display */}
        {photos.length > 0 ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={photos[currentSlide].src}
              alt={photos[currentSlide].alt}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Left and Right navigation buttons (only shown when 2+ photos) */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-navy/80 hover:bg-navy text-white p-2.5 rounded-full shadow-md transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy/80 hover:bg-navy text-white p-2.5 rounded-full shadow-md transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-body text-sm">
            Fotos próximamente
          </div>
        )}

        {/* Dot Indicators (only shown when 2+ photos) */}
        {hasMultiple ? (
          <div className="flex justify-center items-center gap-2 mt-4">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to photo ${index + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  index === currentSlide
                    ? "w-6 h-2.5 bg-navy"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        ) : (
          /* Invisible spacer to keep card heights perfectly balanced */
          <div className="flex justify-center items-center gap-2 mt-4 invisible">
            <span className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </div>
  );
}

// Single comparison row: Antes on left, Después on right
function ComparisonRow({ beforePhotos, afterPhotos }) {
  const { t } = useLang();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
      {/* Left: Antes */}
      <PhotoPanel title={t("results_before")} photos={beforePhotos} />

      {/* Right: Después */}
      <PhotoPanel title={t("results_after")} photos={afterPhotos} />
    </div>
  );
}

export default function Results() {
  const { t } = useLang();

  return (
    <section className="bg-light-gray py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section Heading */}
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy text-center mb-10 uppercase">
          {t("results_heading")}
        </h2>

        {/* Rows of comparison cards */}
        <div className="flex flex-col gap-12">
          {/* Row 1: Deck & exterior work */}
          <ComparisonRow beforePhotos={ROW1_ANTES} afterPhotos={ROW1_DESPUES} />

          {/* Row 2: Sunroom & structural renovation */}
          <ComparisonRow beforePhotos={ROW2_ANTES} afterPhotos={ROW2_DESPUES} />
        </div>

      </div>
    </section>
  );
}
