# POC Requirements

## Client Information
- Business Name: Blanco's Concrete Paint & Maintenance Service. LLC
- Phone: (939) 457-6553
- Email: vaquiz228@gmail.com
- Location: Dunn, NC

---

## What We Are Building
A proof of concept website for a local painting, concrete and maintenance business.
Based on the design of blancoconcretepainting.com but simplified, cleaner and better.

---

## Design Priority -- Mobile First
The website must look amazing on a phone FIRST.
We build every page and every section for mobile screens first, then we make sure it also looks great on tablets and desktop.

This means:
- Text is easy to read without zooming in
- Buttons are big enough to tap with a thumb
- Nothing is cramped or cut off on a small screen
- The layout stacks vertically on phone and expands on larger screens
- The call buttons (WhatsApp, Call Now) are especially important on mobile -- people visiting from their phone should be able to tap and go instantly

Desktop is secondary. If it looks great on phone and good on desktop, that is a win.

---

## Language
The website will be in Spanish by default.
There will be a language toggle button in the top left of the navbar that switches between Spanish and English.
It will look like: EN | SPA
All text content on every page must have both a Spanish and English version.

---

## Pages

### Navbar
Links: Home, About Us, Contact
Language toggle on the top left: EN | SPA

---

### Page 1 -- Home

#### Section 1: Hero
- Full background image
- Business name displayed prominently
- Tagline line 1: "Let the experts do your Paint, Concrete & Maintenance work"
- Tagline line 2: "We show up, do the job right and leave the property better than we found it."
- Two call to action buttons:
  - "Request a Free Quote" -- links to WhatsApp using client phone number (939) 457-6553
  - "Call Now" -- taps to call (939) 457-6553 on mobile

#### Section 2: Services
- Display the services the business offers
- We do NOT want the current grid layout from the reference site
- Layout to be decided -- will discuss before building

#### Section 3: Service Areas
- A quick grid showing the areas the business serves
- Below the grid: a "Request a Free Quote" button linking to WhatsApp

#### Section 4: Footer
- Business name
- Contact Us column: Dunn NC, phone number, email
- "All rights reserved"
- "Designed and Developed by Anthony M. Aguilar"

---

### Page 2 -- About Us

#### Section 1: Story & Mission
Heartwarming story that covers:
- Mission: to provide great paint, concrete and maintenance services that NC can trust
- We understand that property is more than just an investment -- we treat it with care
- Based in Dunn NC
- Built our reputation on quality work, honest pricing and outstanding local customer service
- Whether you need a single room painted, your entire home exterior refreshed or ongoing property maintenance -- we are here to help
- We serve homeowners and businesses throughout Dunn, Raleigh, Fayetteville and surrounding areas
- We bring our expertise and dedication to every project

#### Section 2: Our Values
- Display the company values in a grid
- We do NOT like the current grid from the reference site
- Layout to be decided -- will discuss before building

---

### Page 3 -- Contact
- To be defined -- coming soon

---

## Tech We Are Using

### React + Vite
This is the foundation. React builds the pages and Vite runs the project on your computer and builds it when its ready to go live.

### React Router
This lets us have multiple pages on the site without the page doing a full reload every time someone clicks a link. It makes the site feel fast.

### Tailwind CSS
This is how we style everything -- colors, spacing, fonts, layout. Instead of writing a separate style sheet, we add small class names directly to the HTML elements.

### shadcn/ui
Pre-built pieces like buttons, cards, and form fields that already look clean and professional. We drop them in instead of building every piece from scratch. This saves time and keeps the design consistent.

---

## What We Are NOT Using (for now)
- Framer Motion (animations) -- not needed for a POC
- TanStack Query (data fetching tool) -- no outside data source yet
- Lucide React (icons) -- will ask before adding

---

## Open Questions Before We Build
1. Services section layout -- what is a better way to display services than a grid?
2. Our Values section layout -- same question
3. Which services does the client offer? Need the full list
4. Which areas should appear in the Service Areas grid?
5. Do we have a hero background image or do we need to find one?
6. Contact page -- what goes on it?

---

## Rules
See rules.md for how we work together on this project.
