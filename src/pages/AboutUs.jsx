// AboutUs.jsx  (Page 2)
// ----------------------
// The About Us page -- tells the business story and shows company values.
//
// Two sections:
//   1. Story & Mission -- a warm paragraph about who they are and what they do
//   2. Our Values      -- 4 value cards in a 2x2 grid (mobile) or 4-column row (desktop)
//
// PLACEHOLDER NOTE:
//   The values layout here is a clean grid. We will revisit the design
//   once we discuss layout options as noted in our open questions.

import { useLang } from "../context/LanguageContext";

// Value card data -- icons are emoji placeholders for the POC
const values = [
  { icon: "⭐", nameKey: "value1_name", descKey: "value1_desc" },
  { icon: "🤝", nameKey: "value2_name", descKey: "value2_desc" },
  { icon: "⏰", nameKey: "value3_name", descKey: "value3_desc" },
  { icon: "❤️", nameKey: "value4_name", descKey: "value4_desc" },
];

export default function AboutUs() {
  const { t } = useLang();

  return (
    <>
      {/* ===== SECTION 1: Story & Mission ===== */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">

          {/* Section heading */}
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy mb-8 uppercase">
            {t("about_heading")}
          </h2>

          {/* Story paragraph */}
          <p className="font-body text-base md:text-lg text-dark-text leading-relaxed">
            {t("about_body")}
          </p>
        </div>
      </section>

      {/* ===== SECTION 2: Our Values ===== */}
      <section className="bg-light-gray py-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Section heading */}
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy text-center mb-10 uppercase">
            {t("values_heading")}
          </h2>

          {/* 2-column grid on mobile, 4-column on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {values.map((value) => (
              <div
                key={value.nameKey}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm"
              >
                {/* Value icon */}
                <span className="text-3xl mb-3">{value.icon}</span>

                {/* Value name */}
                <h3 className="font-heading font-semibold text-base text-navy mb-2 uppercase">
                  {t(value.nameKey)}
                </h3>

                {/* Value description */}
                <p className="font-body text-sm text-dark-text leading-relaxed">
                  {t(value.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
