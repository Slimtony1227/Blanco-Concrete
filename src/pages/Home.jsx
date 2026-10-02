// Home.jsx  (Page 1)
// ------------------
// The Home page -- the first page visitors see.
//
// It assembles three sections in order:
//   1. Hero        -- full background image, title, taglines, buttons
//   2. Services    -- horizontal scroll cards showing what the business offers
//   3. ServiceAreas -- grid of cities/areas served + WhatsApp CTA
//
// The Footer is NOT included here -- it lives in App.jsx
// and shows up automatically on every page.

import Hero from "../components/Hero";
import Services from "../components/Services";
import Results from "../components/Results";
import ServiceAreas from "../components/ServiceAreas";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Results />
      <ServiceAreas />
    </>
  );
}
