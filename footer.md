# Component Specification: Website Footer

## Context
* **Project:** Next.js Project Management SaaS (TypeScript)
* **Styling:** Tailwind CSS, Lucide React (for icons)
* **Design System:** Light mode, clean white background, muted text (`text-slate-500` or `text-zinc-500`), with sharp purple/indigo accent colors (`#6366f1` / `indigo-600`) for interactive elements.

---

## Layout & Structure
The footer uses a standard multi-column grid layout that is highly responsive. It stacks into a single column on mobile screens (`grid-cols-1`) and expands into a 5-column grid on desktop screens (`lg:grid-cols-6`).

### 1. Top Border
* A thin, crisp divider line separating the footer from the main landing page content (`border-t border-slate-100`).

### 2. Grid Columns (Main Content)
* **Column 1 (Brand Info - Spans 2 columns on desktop `lg:col-span-2`):**
  * **Logo:** App logo and name ("Stride") aligned left.
  * **Description:** A short description text in small, muted font: *"The intuitive project management platform for modern teams."*
  * **Social Icons:** A horizontal row of 3 minimalist social media icon links (Twitter/X, LinkedIn, Globe/Website). On hover, they change to the purple brand color.
* **Column 2 (Product Links):**
  * **Heading:** Bold, small uppercase text ("Product").
  * **Links:** Vertical list containing: Features, Integrations, Pricing, Changelog.
* **Column 3 (Solutions Links):**
  * **Heading:** Bold, small uppercase text ("Solutions").
  * **Links:** Vertical list containing: Marketing Teams, Software Teams, Design Teams, Agencies.
* **Column 4 (Resources Links):**
  * **Heading:** Bold, small uppercase text ("Resources").
  * **Links:** Vertical list containing: Documentation, Help Center, Templates, Blog.
* **Column 5 (Company & Newsletter - Spans 2 columns on desktop `lg:col-span-2`):**
  * **Sub-Column A (Company Links):** Vertical list containing: About Us, Careers, Contact, Privacy Policy.
  * **Sub-Column B (Newsletter Box):**
    * **Heading:** *"Stay in the loop"*
    * **Description:** Small text: *"Get the latest updates, tips, and product news."*
    * **Input Form:** A clean inline subscription box. A rounded input field (`placeholder="Enter your email"`) with a solid purple square button containing a paper plane/send icon nested inside or right next to it.

### 3. Bottom Bar
* Separated by another subtle horizontal rule or generous spacing.
* Contains centered or left-aligned light gray copyright text: *"© 2026 Stride. All rights reserved."*

---

## Constraints & Behaviors
* All links must include smooth hover states (`transition-colors duration-200 hover:text-indigo-600`).
* Ensure text sizes use an accessible hierarchy (`text-sm` for links, `text-xs font-semibold tracking-wider` for column headers).
* Fully responsive layout: grid columns stack beautifully on mobile devices without clipping text.