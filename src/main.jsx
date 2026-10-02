// main.jsx
// --------
// This is the entry point -- the very first file that runs
// when someone opens the website.
//
// It does three things:
//   1. Loads our CSS styles
//   2. Wraps the app in BrowserRouter (page navigation) and
//      LanguageProvider (bilingual toggle)
//   3. Mounts the entire app inside the <div id="root"> in index.html

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter enables clicking between pages without a full reload */}
    <BrowserRouter>
      {/* LanguageProvider makes the EN/SPA toggle available everywhere */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
