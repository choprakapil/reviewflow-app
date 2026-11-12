# Document 4: Comprehensive UI/UX Blueprint & Design System

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform

---

### 1. Design Philosophy & System Standards

The platform's user experience is bifurcated into two purposeful interfaces:
1. **The Agency Management Portal:** Designed as a clean, high-density, modern SaaS workspace inspired by linear, modern productivity tooling (Vercel, Linear, Supabase). Prioritizes speed, keyboard shortcuts, immediate data visibility, and zero fluff.
2. **The Public Customer Landing Funnel:** Designed as an ultra-minimalist, high-conversion mobile micro-screen. It must load in less than one second, present zero cognitive load, require zero typing, and feature a single unmistakable primary action.

#### 1.1 Color Palette & Typography
- **Design Tokens:**
  - `Background Canvas:` `#09090B` (Dark Mode Admin) / `#FAFAFA` (Light Mode Public Landing)
  - `Surface / Cards:` `#18181B` (Admin Card) / `#FFFFFF` (Public Card with subtle elevation)
  - `Primary Brand Accent:` `#2563EB` (Vibrant Blue - evokes Google Maps / professional trust)
  - `Success Accent:` `#16A34A` (Verified Green - used for copy confirmation)
  - `Warning / Notice:` `#F59E0B` (Amber - used for compliance disclaimers and quota alerts)
  - `Text Primary:` `#09090B` (Public) / `#F4F4F5` (Admin)
  - `Text Secondary:` `#71717A` (Muted guidance text)
- **Typography:** Inter or system sans-serif font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Zero custom font files loaded on the public landing page to save ~120KB of mobile data and eliminate layout shifts (CLS = 0.00).

---

### 2. Information Architecture & Navigation Structure

```
+-----------------------------------------------------------------------------------+
|                           ADMIN PORTAL NAVIGATION                                 |
+-----------------------------------------------------------------------------------+
| [Logo] ReviewFlow      [Global Search (Cmd+K)]        [Agency Account: Admin v]   |
+-----------------------------------------------------------------------------------+
|  ( ) Dashboard   ( ) Businesses   ( ) QR Studio   ( ) Analytics   ( ) Settings    |
+-----------------------------------------------------------------------------------+
```

The administrative interface maintains a streamlined top navigation (or collapsible sidebar) with exactly 5 primary views:
1. `/admin/dashboard` — High-level KPI pulses, activity stream, and AI provider health.
2. `/admin/businesses` — Searchable, filterable client catalog with CRUD drawers.
3. `/admin/qr-studio` — Dedicated visual preview, brand customizer, and export generator.
4. `/admin/analytics` — Funnel drop-off visualization, scan heatmaps, and ROI metrics.
5. `/admin/settings` — API key vault, AI models, default prompt styles, and team accounts.

---

### 3. Screen-by-Screen Administrative Specifications

#### 3.1 Screen: Admin Dashboard (`/admin/dashboard`)
- **Purpose:** Provide agency owners with an instant summary of portfolio-wide review generation performance.
- **Header:** Title *"Agency Overview"*, Date Range Picker (Today, 7D, 30D, All), and button `[+ Add Business]`.
- **KPI Metrics Grid (4 Cards):**
  1. *Total Active Businesses:* Count with trend indicator (+3 this month).
  2. *Total QR Scans:* Aggregate scans with percentage change.
  3. *Google Redirect Clicks:* High-intent click-throughs to Google review pages.
  4. *Portfolio Conversion Rate:* `(Redirects / Scans) * 100` (e.g. `58.4%`).
- **Funnel Conversion Bar:** Visual step-down bar: `Scans (10,420) -> Page Views (9,980) -> Suggestion Copies (6,120) -> Google Redirects (5,890)`.
- **Live AI Health Widget:** Badge displaying `Gemini 2.0 Flash: Healthy (180ms avg)` and `Groq Failover: Standby`.
- **Recent Activity Table:** Real-time log showing timestamp, business name, event type (`QR_SCAN`, `COPIED`), city, and device type.
- **States:**
  - *Empty State:* Friendly illustration: *"No businesses onboarded yet. Add your first client to start generating QR review cards."* with big button `[Add Client Business]`.
  - *Loading State:* Subtle Skeleton placeholders for metric cards and table rows.

#### 3.2 Screen: Business Catalog (`/admin/businesses`)
- **Purpose:** Manage all client establishments, edit AI instructions, and view status.
- **Controls Bar:** Instant search input (matches name, category, or city), Category Filter Dropdown, Status Filter (Active, Inactive, Archived), and `[+ Add Business]` button.
- **Business Cards / Table View:**
  - Columns: Business (Logo + Name + Category), QR Status (Active pill), Google Link (verified icon), Pre-Generated Pool Size (e.g. `10/10 Ready`), Total Scans, Actions (`[QR Code]`, `[Edit]`, `[Analytics]`, `[More v]`).
- **Business Create / Edit Drawer (Slide-Over Panel):**
  - *Section 1: Basic Information:* Business Name (auto-generates URL Slug), Category, Address, Phone, Website.
  - *Section 2: Google Review Link Setup:* 
    - Input: Direct Google Review URL.
    - Helper: *"Enter the link from your Google Business Profile (Get more reviews), or enter the Google Place ID."* Includes a `[Test Link]` button that opens the URL in a new tab to verify it launches Google's review modal.
  - *Section 3: AI Review Generation Tuning:*
    - Review Length Selector: Pill buttons for `Short (20-40 words)`, `Medium (50-80 words)`, `Long (100-140 words)`.
    - Tone / Style Selector: `Natural & Conversational`, `Professional`, `Enthusiastic`, `Simple & Direct`.
    - Core Services Offered: Tag-input field (e.g., `[Teeth Whitening x]`, `[Invisalign x]`, `[Emergency Dentistry x]`).
    - SEO Target Keywords: Tag-input field (e.g., `[best dentist in Austin x]`, `[friendly dental staff x]`).
    - Factual Highlights: Bullet points (e.g., *"Free parking behind the clinic"*).
    - Language Settings: Default language dropdown + Multi-select for secondary languages.
  - *Section 4: Branding:* Logo file upload (Drag & drop SVG/PNG, max 2MB).
- **Validation Rules:**
  - Business name must be 2-100 characters.
  - Slug must be lowercase alphanumeric with hyphens, globally unique.
  - Google Review URL must be a valid URL containing `google.com` or `g.page`.

#### 3.3 Screen: QR Studio & Print Generator (`/admin/qr-studio`)
- **Purpose:** Customize visual aesthetics of the QR code and download print-ready assets.
- **Split-View Layout:**
  - *Left Configuration Pane:*
    - Business Selector Dropdown.
    - Color Customizer: Foreground Color picker (defaults to `#000000`), Background Color picker (defaults to `#FFFFFF`).
    - Center Logo Toggle: Checkbox to embed the business logo in the center of the QR matrix (automatically adjusts error correction to Level H).
    - Frame & Card Templates: Template 1: Classic Minimalist; Template 2: Acrylic Table Tent; Template 3: Countertop Card.
    - Callout Text Customizer: Editable header text (e.g., *"Loved your visit? Scan with your camera to share your review on Google!"*).
  - *Right Live Preview Pane:*
    - High-DPI interactive canvas showing the rendered QR code or full print sheet.
    - Export Action Buttons:
      - `[Download SVG (Vector)]`
      - `[Download High-Res PNG (2048x2048)]`
      - `[Download Print-Ready PDF (Table Tent Layout)]`

#### 3.4 Screen: Detailed Analytics & Conversion Funnel (`/admin/analytics`)
- **Purpose:** Present granular performance telemetry for individual businesses or portfolio-wide.
- **Charts:**
  - *Scan Volume Over Time:* Area chart with daily granularity.
  - *Device Breakdown:* Donut chart showing iOS (Safari) vs Android (Chrome) vs Desktop.
  - *Hourly Scan Heatmap:* Identifies peak in-store hours (e.g., lunch rush, evening checkout).
  - *Top Performing Services:* Bar chart showing which services were highlighted in copied suggestions.

#### 3.5 Screen: Settings & Key Vault (`/admin/settings`)
- **Purpose:** Securely configure AI API keys, system defaults, and agency team access.
- **Tabs:**
  - *AI Providers:* Inputs for `Google Gemini API Key`, `Groq API Key`. Connection test buttons verifying live quota and latency in milliseconds.
  - *Agency Profile:* Agency Name, Custom Domain setup (`reviews.youragency.com`), White-label branding.
  - *User Management:* Team members, invitation links, role assignments.

---

### 4. Public Customer-Facing Mobile Landing Page (`/r/:businessSlug`)

This screen represents the critical conversion bottleneck of the entire platform. Every millisecond of latency and every pixel of visual clutter reduces review conversion.

#### 4.1 Visual Hierarchy & Component Wireframe (Mobile Viewport)

```
+---------------------------------------------------+
|  [Status Bar: 9:41 AM                       100%] |
+---------------------------------------------------+
|                                                   |
|                [ BUSINESS LOGO ]                  |
|            Apex Cosmetic Dental Studio            |
|              San Francisco, CA                    |
|                                                   |
|  -----------------------------------------------  |
|                                                   |
|  "We appreciate your visit today! Here is a       |
|   personalized draft to help you review us        |
|   effortlessly on Google:"                        |
|                                                   |
|  +---------------------------------------------+  |
|  |                                      [Copy] |  |
|  |  "I had an outstanding visit to Apex Dental |  |
|  |   today for my teeth whitening. The entire  |  |
|  |   staff was welcoming, gentle, and the      |  |
|  |   results exceeded my expectations. State-  |  |
|  |   of-the-art office with easy parking too.  |  |
|  |   Highly recommend Dr. Sarah and team!"     |  |
|  |                                             |  |
|  |  (Tap inside text to customize your review) |  |
|  +---------------------------------------------+  |
|                                                   |
|       [ ⟳ Try another suggested review ]          |
|                                                   |
|  ===============================================  |
|  |                                             |  |
|  |   [⭐ COPY REVIEW & OPEN GOOGLE ⭐]          |  |
|  |             (Primary 56px CTA)              |  |
|  |                                             |  |
|  ===============================================  |
|                                                   |
|  ℹ️ Note: This draft is provided for convenience. |
|  You can edit or replace it with your genuine     |
|  feedback directly on Google.                     |
|                                                   |
+---------------------------------------------------+
```

#### 4.2 Component & Micro-Interaction Details

1. **Header Component:**
   - Business logo rendered inside a crisp 72x72px rounded container with subtle shadow.
   - Business Name displayed in bold 20px typography (`font-semibold tracking-tight`).
   - Category / Location subtitle in muted 14px text.
2. **Review Suggestion Box (The Hero Element):**
   - Styled as an elevated card with a light border (`border border-zinc-200 bg-white rounded-2xl p-5 shadow-sm`).
   - The review text is rendered inside an editable `<textarea>` or rich text container formatted as normal paragraph text (`text-base leading-relaxed text-zinc-800`).
   - Users can tap into the box and adjust wording right there if they wish prior to copying.
   - Subtle top-right icon button: quick manual copy icon.
3. **Suggestion Rotation Action:**
   - Text button: *"⟳ Try another suggested review"*.
   - When tapped, cycles through the pre-loaded suggestions with a smooth 150ms fade transition.
4. **Primary Sticky CTA Button:**
   - Positioned fixed at the bottom of the viewport or immediately below the card.
   - Dimensions: Full width minus 32px padding, minimum height of 56px to meet iOS Human Interface Guidelines for primary touch targets.
   - Styling: Solid high-contrast background (`bg-blue-600 text-white font-medium rounded-xl shadow-lg active:scale-95 transition-transform`).
   - Icon: Clipboard copy icon + external link icon.
   - Text: **"Copy Review & Open Google"**.
5. **Touch & Haptic Feedback Sequence:**
   - Tap CTA -> Button text instantly changes to: **"✓ Copied! Opening Google..."** with green background (`bg-emerald-600`).
   - Device triggers subtle native haptic vibration (`navigator.vibrate(50)` if supported).
   - After a 350ms delay (allowing the user's brain to register success), the browser redirects via `window.location.href = business.googleReviewUrl`.
6. **Graceful Fallback Modal (If Clipboard API Fails):**
   - If mobile browser security settings block programmatic clipboard writing, an elegant micro-sheet slides up:
     - Header: *"One quick step!"*
     - Body: Displays the text in a pre-selected box with a big `[Long-press to Copy]` button and a direct `[Continue to Google]` link.
7. **Compliance Disclaimer:**
   - Positioned cleanly at the footer in small muted font (`text-xs text-zinc-500 text-center leading-normal px-4`).
   - Ensures clear transparency that the text is an optional aid and the user remains in complete control.

#### 4.3 Error, Inactive & Edge States
- **State: Inactive / Paused Business:** If the business has paused its campaign or the subscription lapsed, displays a clean branded card: *"Apex Dental's review portal is currently paused. Please visit us directly on Google Maps to share your review."* with a direct link to Google Maps.
- **State: Invalid QR Slug:** If an end-user visits `/r/non-existent-slug`, a polite 404 page is displayed: *"Business review page not found. Please verify the QR code or contact the establishment."*
- **State: Slow Connection / Loading:** The public landing page Server Component sends the complete HTML with inline critical CSS so the card is visible on the initial TCP round-trip. Zero blank screen loading spinners.

