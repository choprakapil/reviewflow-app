# Design System Specification & UI Component Standards

## Document Ref: `docs/ENGINEERING_SYSTEM/DESIGN_SYSTEM_STANDARD.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE & BINDING  

---

### 1. Design Tokens & Palette

The design system incorporates two distinct environments:
1. **Admin Workspace:** Modern, dense, dark/light hybrid SaaS aesthetics (zinc/slate background, crisp borders, subtle elevation).
2. **Customer Public Funnel:** Ultra-clean light mode canvas with high-contrast typography, generous touch padding, and unmistakable primary blue CTA.

#### 1.1 Color Tokens
- `zinc-50`: `#FAFAFA` — Public landing page background.
- `zinc-100`: `#F4F4F5` — Subtle card background / divider lines.
- `zinc-200`: `#E4E4E7` — Card border tokens (`border-zinc-200`).
- `zinc-500`: `#71717A` — Muted secondary text, metadata, disclaimers.
- `zinc-900`: `#18181B` — Primary high-contrast text (`text-zinc-900`).
- `blue-600`: `#2563EB` — Primary Action Brand Blue (matches Google Maps action buttons).
- `blue-700`: `#1D4ED8` — Active/hover state for primary buttons.
- `emerald-600`: `#16A34A` — Success state ("✓ Copied to clipboard!").
- `amber-500`: `#F59E0B` — Notice / disclaimer warning icons.
- `red-600`: `#DC2626` — Destructive / danger actions (permanent deletion).

#### 1.2 Typography & Sizing
- **Font Stack:** Native system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) to save 120KB download and achieve instant rendering without FOIT/FOUT.
- `text-xs`: 12px (Legal disclaimers, micro metadata).
- `text-sm`: 14px (Table cells, form labels, secondary text).
- `text-base`: 16px (Public review card body text — readable on all mobile screens).
- `text-lg`: 18px (Card subheadings, mobile CTA button text).
- `text-xl`: 20px (Business name title on public landing page).
- `text-2xl`: 24px (Admin section titles).

---

### 2. Component Inventory & Standards

#### 2.1 Buttons (`components/ui/button.tsx`)
- **Variants:**
  - `primary`: `bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-sm font-medium`.
  - `secondary`: `bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50`.
  - `destructive`: `bg-red-600 text-white hover:bg-red-700`.
  - `ghost`: `hover:bg-zinc-100 text-zinc-700`.
- **Public Hero CTA (`components/public/action-button.tsx`):**
  - Dimensions: Full width, min height **56px** (touch-friendly for one-handed thumb reach).
  - Styling: `rounded-2xl bg-blue-600 text-white font-semibold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all`.

#### 2.2 Suggestion Card (`components/public/customer-card.tsx`)
- Elevated container: `bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm`.
- Review textarea: `text-zinc-800 text-base leading-relaxed focus:outline-none resize-none w-full bg-transparent`.
- Quote icon accents and subtle "Tap to edit draft" hint.

#### 2.3 Form Inputs (`components/ui/input.tsx`)
- Accessible height (40px admin, 48px mobile).
- Border: `border-zinc-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg`.

#### 2.4 Tables & Metric Cards (`components/admin/data-table.tsx`, `components/admin/metric-card.tsx`)
- Clean tabular borders with alternating subtle hover highlight.
- Metric cards feature trend badges (+12% vs last month) and Lucide icon accents.

---

### 3. Responsive Breakpoint Standards

- **Mobile Viewport (320px – 640px):** Single-column layout. Public QR page is centered with max-width `440px` and horizontal padding `16px`. Zero horizontal scrollbars.
- **Tablet (641px – 1024px):** 2-column dashboard grids, collapsible navigation.
- **Desktop (1025px+):** Full 4-column metric grids, side-by-side QR Studio canvas preview and export panels.

