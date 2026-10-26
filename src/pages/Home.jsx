// Home.jsx  (Page 1)
// ------------------
// The Home page -- the first page visitors see.
//
// It assembles five sections in order:
//   1. Hero        -- full background image, title, taglines, buttons
//   2. Services    -- cards showing what the business offers
//   3. Results     -- before-and-after photos
//   4. ServiceAreas -- cities/areas served + WhatsApp CTA
//   5. Reviews     -- approved customer reviews and a submission form
//
// The Footer is NOT included here -- it lives in App.jsx
// and shows up automatically on every page.

import Hero from "../components/Hero";
import Services from "../components/Services";
import Results from "../components/Results";
import ServiceAreas from "../components/ServiceAreas";
import Reviews from "../components/Reviews";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Results />
      <ServiceAreas />
      <Reviews />
    </>
  );
}
