# Design System
## Blanco's Concrete Paint & Maintenance Service LLC

This file is the source of truth for all visual decisions on this project.
Every color, font choice, and spacing rule used in code comes from here.
Do not add or change anything in this file without discussing it first.

---

## Color Palette

These are the exact colors used in the approved mockup. Each color has a name,
a hex code (the exact color value used in code), and a plain description of where it lives.

| Name | Hex | Where It Is Used |
|---|---|---|
| **Navy** | `#13243F` | Navbar background, primary brand color |
| **Charcoal** | `#1B1E21` | Footer background |
| **Dark Text** | `#212529` | Body text, section titles on white backgrounds |
| **White** | `#FFFFFF` | Page background, text on dark backgrounds |
| **Light Gray** | `#F7F7F7` | Alternating section backgrounds (e.g. Service Areas) |
| **WhatsApp Green** | `#25D366` | WhatsApp CTA buttons only |
| **Accent Blue** | `#46679B` | Secondary button outlines (e.g. Call Now button) |

### How to Think About These Colors

- **Navy** is the brand. It anchors the navbar and any dark UI element.
- **Charcoal** is slightly warmer/darker than navy. Footer only.
- **White and Light Gray** alternate between sections so the page breathes.
- **Green** is reserved strictly for WhatsApp actions. Do not use it for anything else.
- **Accent Blue** is for secondary actions like the Call Now outline button.

---

## Typography

### LOCKED IN: Combo E -- Oswald + Lato (via Google Fonts)

| Role | Font | Weight | Where It Is Used |
|---|---|---|---|
| Headings | **Oswald** | 600 (SemiBold) or 700 (Bold) | Business name, section titles, card titles |
| Body Text | **Lato** | 400 (Regular) | Paragraphs, taglines, descriptions |
| Body Bold | **Lato** | 700 (Bold) | Button labels, subheadings, emphasis |

### Why This Combo
- Oswald is condensed and strong -- it commands attention without screaming
- Lato is warm, clean, and one of the best fonts for mobile readability
- Together they feel trustworthy and professional -- exactly right for a local trades business

### Hierarchy (Big to Small)

| Level | Font | Weight | Example |
|---|---|---|---|
| Page Title | Oswald | 700 Bold | Business name in hero |
| Section Heading | Oswald | 600 SemiBold | "Nuestros Servicios" |
| Subheading | Oswald | 400 Regular | Taglines |
| Body Text | Lato | 400 Regular | Paragraphs, descriptions |
| Button Label | Lato | 700 Bold | "Llamar Ahora", "Solicita un Presupuesto" |
| Footer / Legal | Lato | 400 Regular | Small print, credits |

---

## How We Load the Fonts -- Google Fonts

### What Is Google Fonts?
Google Fonts is a free service run by Google. Instead of downloading font files and
storing them ourselves, we link to Google's servers and they deliver the font to
whoever visits the site. It is free, fast, reliable, and widely trusted -- no cost to the client.

### How It Works in 3 Steps

**Step 1 -- Add the Google Fonts link to index.html**

In a React + Vite project, there is one HTML file called index.html at the root of the project.
This is the starting point of the entire site. We add two lines inside the `<head>` tag:

```html
<!-- Preconnect tells the browser to get ready to talk to Google Fonts early, making it faster -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- This is the actual font request -- Oswald in weights 400, 600, 700 and Lato in 400, 700 -->
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
```

**Step 2 -- Tell Tailwind to use these fonts**

In our tailwind.config.js file (the file that configures our styling system), we register
the fonts under names we choose -- "heading" and "body". This lets us use short class names in the code.

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      heading: ['Oswald', 'sans-serif'],  // use class: font-heading
      body:    ['Lato',   'sans-serif'],  // use class: font-body
    },
  },
},
```

**Step 3 -- Use the fonts in the code with Tailwind classes**

Once Step 1 and 2 are done, applying a font anywhere in the site is one short class name:

```jsx
// Heading example
<h1 className="font-heading font-bold text-4xl">
  Blanco's Concrete Paint & Maintenance Service
</h1>

// Body text example
<p className="font-body text-base">
  We show up, do the job right and leave the property better than we found it.
</p>
```

### The Google Fonts URL We Will Use

```
https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Lato:wght@400;700&display=swap
```

Breaking this down in plain English:
- `family=Oswald:wght@400;600;700` -- give us Oswald in three weights: regular, semibold, bold
- `family=Lato:wght@400;700` -- give us Lato in two weights: regular and bold
- `display=swap` -- if the font takes a moment to load, show the fallback font first, then swap in once ready (prevents invisible text on slow connections)

### Why Google Fonts Is the Right Call
- Free -- no license fees, ever
- Reliable -- Google's servers have near-perfect uptime
- Fast -- fonts are cached globally so returning visitors load them instantly
- Safe -- no copyright risk, all fonts are open source
- No setup beyond the three steps above -- no downloads, no files to manage

---

## Spacing and Layout

### Mobile First Rules
- All sections are full-width on mobile (no side margins eating into space)
- Sections have generous top and bottom padding so content breathes
- Buttons are large and easy to tap with a thumb -- minimum touch target
- Content stacks vertically on mobile, expands side by side on tablet/desktop

### Section Backgrounds (Alternating Pattern)
This keeps the page from feeling like one long wall of content.

| Section | Background |
|---|---|
| Navbar | Navy `#13243F` |
| Hero | Full background image with dark overlay |
| Services | White `#FFFFFF` |
| Service Areas | Light Gray `#F7F7F7` |
| Footer | Charcoal `#1B1E21` |

---

## Buttons

### Primary -- WhatsApp CTA
- Background: `#25D366` (WhatsApp Green)
- Text: White, Lato Bold
- Shape: Fully rounded (pill shape)
- Icon: WhatsApp logo on the left
- Use: "Solicita un Presupuesto Gratis" / "Request a Free Quote"

### Secondary -- Call Now
- Background: Transparent
- Border: `#46679B` (Accent Blue), thin outline
- Text: White, Lato Bold
- Shape: Fully rounded (pill shape)
- Use: "Llamar Ahora" / "Call Now"

---

## Component Feel

### Cards (Services Section)
- White background
- Subtle border or very light shadow -- not heavy
- Icon at top, service name in Oswald below, short description in Lato under that
- Rounded corners, clean, no clutter

### Area Badges (Service Areas Section)
- White background with a subtle border
- Small pin/location icon on the left
- Simple chip shape with rounded corners
- Displayed in a 2-column grid on mobile

### Navbar
- Dark navy background
- Language toggle (EN | SPA) on the left in Lato
- Nav links on the right in Oswald
- Hamburger menu icon on mobile

---

## What We Are NOT Doing (Style Guardrails)

- No gradients -- solid colors only
- No drop shadows that are too heavy or obvious
- No bright or neon colors outside of the green WhatsApp button
- No decorative fonts or script fonts
- No animations for the POC (can revisit later)
- Do not load extra font weights we did not list -- it slows the site down
