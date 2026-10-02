// vite.config.js
// -------------------------------------------------------
// This is the configuration file for Vite, the tool that
// runs the project on your computer during development and
// builds it when it is ready to go live.
//
// We are adding two plugins:
//   - tailwindcss: hooks Tailwind into Vite so our styles work
//   - react: lets Vite understand React (JSX) files
// -------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(), // handles all our Tailwind CSS styling
    react(),       // handles all our React component files
  ],
  // Expose the development server to your local Wi-Fi network
  // so you can test the website on your phone or tablet.
  server: {
    host: true,
  },
});
