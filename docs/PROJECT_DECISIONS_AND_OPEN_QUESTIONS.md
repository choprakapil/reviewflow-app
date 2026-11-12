# Document 11: Architectural Decisions, Working Assumptions & Open Questions

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform

---

### 1. Master Architectural Decision Records (ADRs)

Below is the definitive record of foundational technical and product architecture decisions made during the planning phase, documenting the decision, alternatives considered, and architectural justification.

---

#### ADR-01: Framework Selection — Next.js 15+ (App Router) with TypeScript
- **Decision:** Build the entire platform as a single full-stack Next.js 15+ TypeScript application utilizing React Server Components (RSC) and Server Actions.
- **Alternatives Evaluated:** Vite + React SPA with Express/NestJS backend; Remix/React Router v7; Nuxt/Vue.
- **Justification:** 
  1. *Public Funnel Latency:* Server Components allow the public QR landing page (`/r/:slug`) to render on the server and stream pure HTML/CSS to the mobile device with zero client-side JavaScript hydration overhead, achieving an LCP under 800ms.
  2. *Single Language & Shared Schemas:* TypeScript types and Zod validation schemas are shared seamlessly between frontend forms and backend API handlers, eliminating API drift.
  3. *Simplified Operations:* Single deployment artifact reduces DevOps complexity and cloud hosting overhead.

---

#### ADR-02: AI Provider Selection & Cascade Architecture
- **Decision:** Standardize on **Google Gemini 2.0 / 1.5 Flash** as Primary Provider, **Groq Llama 3.1 70B** as Hot Secondary Failover, and an internal **Deterministic Template Engine** as Emergency Fallback.
- **Alternatives Evaluated:** OpenAI API (GPT-4o / GPT-4o-mini); Self-hosted Ollama on GPU VPS; Cloudflare Workers AI; OpenRouter.
- **Justification:**
  1. *Cost Efficiency:* Gemini offers an extraordinary free tier (1,500 requests/day, 1M TPM) and an ultra-low paid tier ($0.075 / 1M input tokens), making operating costs negligible (~$0.00 to $0.64/mo for 500 businesses).
  2. *Multilingual Fluency:* Gemini outperforms competitors in regional and colloquial language generation (particularly Hindi and Hinglish), which is crucial for international local businesses.
  3. *Inference Speed:* Groq delivers sub-250ms LPU inference, providing an ultra-fast secondary failover if Gemini hits rate limits.
  4. *Zero-Downtime Guarantee:* The deterministic template engine guarantees that a customer never encounters an error page, even during complete global internet API outages.

---

#### ADR-03: Review Suggestion Generation Strategy — Hybrid Pre-Generated Pool
- **Decision:** Maintain a cached pool of **8 to 15 unique, high-quality review suggestions** per business in PostgreSQL, serving landing page scans in sub-40ms and replenishing the pool asynchronously in the background.
- **Alternatives Evaluated:** Pure Live On-Demand generation on every QR scan; Pure Static generation (fixed list generated once).
- **Justification:**
  1. *Speed:* Scanning a QR code in a busy retail or dining venue requires instant gratification. Waiting 1.5 seconds for a live LLM round-trip leads to user abandonment.
  2. *Cost Reduction:* Reduces live LLM API consumption by over **90%** through smart rotation, insulating the platform from API billing spikes.
  3. *Reliability:* Guarantees that public landing page uptime is decoupled from external AI provider availability.

---

#### ADR-04: Permanent Dynamic QR Redirection Architecture
- **Decision:** Physical QR codes strictly encode an immutable, agency-controlled short redirection URL (`https://[domain]/r/[businessSlug]`).
- **Alternatives Evaluated:** Encoding the direct Google review URL inside the physical QR code.
- **Justification:**
  1. *Physical Asset Protection:* Printing high-quality acrylic table tents, window vinyls, and counter cards costs businesses significant money. If a business changes its Google Place ID, rebrands, or updates its link, a direct QR code becomes permanent trash.
  2. *Dynamic Control & Analytics:* Routing through our dynamic endpoint enables precise scan counting, device analytics, and instant link redirection updates in 1 millisecond without re-printing collateral.

---

#### ADR-05: Single-Action Mobile Navigation — `window.location.href` over `window.open`
- **Decision:** Execute the Google review transition via `window.location.href = targetGoogleUrl` following a 350ms tactile feedback delay, completely avoiding `window.open()`.
- **Alternatives Evaluated:** `window.open(url, '_blank')`; immediate navigation without delay.
- **Justification:**
  1. *Popup Blocker Evasion:* Mobile Safari and Android Chrome aggressively block `window.open()` if executed after any asynchronous promise delay (e.g. post-clipboard write), displaying an intrusive "Popup Blocked" warning.
  2. *App Handoff:* Direct navigation seamlessly hands off execution to the native Google Maps app if installed on the customer's phone, providing a superior native review experience.

---

#### ADR-06: Privacy-First Architecture — Zero Consumer PII Storage
- **Decision:** The customer landing page collects zero personally identifiable information (PII). Client IPs are hashed with a daily rotating salt before event recording. No tracking cookies are set.
- **Alternatives Evaluated:** User login via Google/Email; tracking cookies with consent banner; fingerprinting.
- **Justification:**
  1. *Conversion Optimization:* Eliminating cookie banners, email prompts, and phone verifications removes 100% of consumer hesitation.
  2. *Regulatory Compliance:* Guarantees automatic compliance with GDPR, CCPA, and global privacy standards.

---

### 2. Foundational Working Assumptions

1. **Agency-Centric Operational Model:** We assume the platform will be operated primarily by digital marketing agencies, SEO consultants, or internal multi-location business administrators who configure client profiles on their behalf.
2. **Google Review Infrastructure Constraints:** We assume that Google will continue to require consumers to log into their own Google accounts and click "Post" within Google's proprietary interface. No third-party software can legally bypass Google's manual submission step.
3. **Smartphone Camera Penetration:** We assume that virtually 100% of target consumers possess modern smartphones (iOS 14+ or Android 10+) equipped with native QR-code scanning integrated directly into the camera application.
4. **Network Environment:** We assume public users will access landing pages over cellular mobile connections (4G LTE / 5G) or in-store guest Wi-Fi, mandating lightweight payload budgets (< 50 KB).

---

### 3. Open Strategic Decisions & Recommendations

The table below outlines key product and architectural questions that warrant stakeholder alignment, accompanied by our senior architectural recommendation.

| # | Open Question / Decision Point | Trade-Off Analysis & Implications | Recommended Decision (Rationale) |
| :--- | :--- | :--- | :--- |
| **Q1** | **Client Self-Service Portal:** Should client business owners receive their own login accounts, or should the platform remain agency-only? | Introducing business-owner logins requires complex RBAC, password resets, onboarding flows, and support overhead. | **Start with Agency-Only Admin (Milestones I–IV).** In Phase 2/v2, introduce an optional lightweight "Client Read-Only Analytics Viewer" role. This keeps initial development laser-focused and avoids building an unneeded mini-CRM. |
| **Q2** | **Negative Sentiment Handling:** What happens if an in-store customer had a negative experience and scans the QR code? | Review-gating (diverting unhappy customers to a private form) is **strictly illegal under Google policy** and risks profile bans. | **Zero Review Gating.** The page displays the draft suggestion transparently, but does not force it. The customer has full agency to edit the text or write their own genuine feedback on Google. Compliance is absolute. |
| **Q3** | **Google Place ID Discovery:** Should we integrate the Google Places Autocomplete API for automated Place ID lookup during business onboarding? | Google Places API requires a Google Cloud billing account and incurs minor API costs ($0.017/request), but simplifies link setup for non-technical users. | **Dual Approach:** Primary method is manual pasting of the Google review short link (`g.page/r/...` or `search.google.com/...`) with client-side verification. Provide an optional "Lookup by Name" button that activates if the agency configures a Google Maps API key in Settings. |
| **Q4** | **Multi-Location Management:** How should franchises or multi-branch clinics (e.g., 10 locations of one dental brand) be modeled? | Treating each location as a completely independent business could clutter administrative views. | **Model each location as a distinct `Business` record with a shared `parentCompany` or `brandGroup` tag.** Each location has a distinct physical address, Google Place ID, and QR code, but can share keyword presets. |
| **Q5** | **Pre-Loaded Languages:** Which languages should be supported in the initial release? | Supporting too many languages increases prompt testing complexity; supporting too few limits international agency appeal. | **Pre-load English, Hindi, Hinglish, Spanish, French, and German.** These cover > 85% of target commercial SMB markets in North America, Europe, and India. |
| **Q6** | **Custom Domain White-Labeling:** Should agencies be able to point their own custom domain (e.g. `reviews.clientagency.com`)? | Multi-tenant custom domains require dynamic SSL certificate generation (e.g. via Cloudflare for SaaS or Caddy). | **Defer to v1.2.** Initial release runs on a centralized brandable agency domain (`reviews.[yourplatform].com`). Add custom domain CNAME routing in a dedicated post-launch milestone. |

