// App.jsx
// -------
// This file is the skeleton of the entire site.
// It lays out the three parts that are always on screen:
//   1. Navbar (top -- always visible)
//   2. Page content (changes based on which page you are on)
//   3. Footer (bottom -- always visible)
//
// Routes define which page component to show for each URL:
//   /           -> Home page
//   /nosotros   -> About Us page
//   /contacto   -> Contact page

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar sticks to the top of every page */}
      <Navbar />

      {/* Main content area -- grows to fill the screen */}
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home />}    />
          <Route path="/nosotros"  element={<AboutUs />} />
          <Route path="/contacto"  element={<Contact />} />
        </Routes>
      </main>

      {/* Footer sits at the bottom of every page */}
      <Footer />
    </div>
  );
}
