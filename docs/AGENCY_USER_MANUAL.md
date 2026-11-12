# ReviewFlow — Agency Operations & Client Onboarding Manual

**Document Ref:** `docs/AGENCY_USER_MANUAL.md`  
**Target Audience:** Digital Marketing Agencies, Account Managers, Client Success Leads  
**Version:** 1.0 (Production-Ready)  

---

## 1. Introduction

ReviewFlow is an enterprise SaaS platform engineered for digital agencies to accelerate high-velocity, authentic Google Business Profile reviews for local establishments (clinics, restaurants, salons, auto shops, professional services) without questionnaires, sentiment gating, or deceptive review practices.

This manual outlines operational procedures for onboarding client businesses, configuring AI assistance, exporting print collateral, and optimizing in-store scan conversion funnels.

---

## 2. Client Onboarding Checklist

Follow this 5-step workflow to launch a client business in under 3 minutes:

### Step 1: Obtain the Verified Google Review URL
Every business has a direct Google Place ID review link. Never use generic Google Maps search links.

1. **Method A (Short Link from Client's Google Business Profile):**
   - Ask the business owner to log into their [Google Business Profile Manager](https://business.google.com).
   - In the dashboard, click **"Ask for reviews"**.
   - Copy the link (format: `https://g.page/r/[ShortCode]/review`).

2. **Method B (Direct Place ID Link via Google Places API):**
   - Find the client's establishment on the [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
   - Copy the Place ID (e.g., `ChIJN1t_tDeuEmsRUsoyG83frY4`).
   - Format URL: `https://search.google.com/local/writereview?placeid=[PlaceID]`.

3. **Validation:**
   - In ReviewFlow Admin (`/admin/businesses`), paste the link into the **Google Review URL** input.
   - Click **"Verify Review Link"**.
   - ReviewFlow runs a server-side syntax check and domain whitelist verification (`google.com`, `g.page`).
   - Click the **"Test Review Link"** pill to confirm the Google review modal opens directly in your browser.

---

## 3. Configuring AI Review Assistance

ReviewFlow assists consumers with personalized writing drafts that comply strictly with **US FTC 16 CFR Part 465** and **Google Maps Contributed Content Policies**.

### Best Practices for Keywords & Services
- **Services (Specific):** Enter 3 to 8 concrete treatments, menu items, or services provided (e.g., `"Teeth Whitening"`, `"Invisalign"`, `"Dental Implants"`).
- **Keywords (Factual):** Enter factual attributes of the business (e.g., `"Friendly Staff"`, `"Punctual Appointments"`, `"Clean Modern Office"`).
- **Compliance Rule:** Never enter claims about outcomes, guarantees, pricing discounts, or superlative customer sentiments in the business context.
- **Tone Selection:**
  - `NATURAL` (Recommended): Conversational, approachable style suitable for 90% of businesses.
  - `PROFESSIONAL`: Formal, concise vocabulary for law firms, medical clinics, and CPA practices.
  - `ENTHUSIASTIC`: Warm, lively phrasing ideal for boutique restaurants, spas, and fitness studios.
  - `SIMPLE`: Short, direct sentence structure optimized for quick thumb scans.

---

## 4. Physical Print Collateral & Placement Guidelines

High conversion rates depend heavily on in-store physical placement and staff interaction.

### Physical Placement Matrix

| Environment | Recommended Collateral | Ideal Placement | Typical Conversion |
| :--- | :--- | :--- | :--- |
| **Dental / Medical Clinic** | 4" x 6" Acrylic Table Tent | Checkout / Reception Desk | 45% - 60% |
| **Restaurant / Café** | 4" x 6" Table Tent or Receipt Card | Table Center / Bill Presentation Folder | 35% - 50% |
| **Auto Repair / Service** | 5" x 7" Countertop Stand | Payment Counter & Waiting Lounge | 40% - 55% |
| **Salon / Day Spa** | 4" x 6" Mirror Sticker or Stand | Styling Station & Checkout Desk | 50% - 70% |

### Staff Onboarding Script (30 Seconds)
Instruct the client's frontline staff to present the QR code at the moment of peak customer satisfaction (payment or exit):

> *"Thank you so much for visiting us today! If you have 15 seconds, scan our desk QR code—it gives you a quick editable draft to make sharing your feedback on Google effortless. We really appreciate your genuine review!"*

---

## 5. Understanding Telemetry & Analytics

ReviewFlow tracks the conversion funnel through privacy-preserving daily-hashed IP beacons:

1. **Total In-Store Scans (`QR_SCAN`):** Number of times physical QR codes were scanned.
2. **Landing Page Views (`LANDING_PAGE_VIEW`):** Unique customer loads of the `/r/:slug` web application.
3. **Suggestions Copied (`COPY_AND_REDIRECT_CLICK`):** High-intent conversions where the customer tapped "Copy Review & Open Google".
4. **Google Redirects (`GOOGLE_REDIRECT`):** Successful launches into the business's Google Maps review interface.

**Target Benchmark:** A healthy, well-placed ReviewFlow setup converts **40% to 65%** of physical QR scans into Google Redirect clicks.
