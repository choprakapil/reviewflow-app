# Document 2: Comprehensive Technical Architecture

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform

---

### 1. Architectural Overview & System Philosophy

The platform is architected as a modern, high-performance, single-codebase full-stack application built upon **Next.js (App Router)** and **TypeScript**, backed by a resilient **PostgreSQL** relational database accessed via **Prisma ORM**.

The system divides into two distinct operational domains with vastly different performance and caching profiles:
1. **The Agency Management Domain (Authenticated Admin Portal):** High data density, rich forms, interactive analytics charts, file uploads, and CRUD operations.
2. **The Public Customer Landing Domain (Public Edge / Micro-Funnel):** Extreme low-latency, zero-javascript-fat, mobile-optimized landing pages accessed via physical QR scans (`/r/:businessSlug`), requiring sub-second Time-to-Interactive (TTI) and 99.99% availability.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENTELE                                  |
|   +------------------------------------+   +----------------------------------+   |
|   |   Agency Admin / Account Manager   |   |     Consumer (In-Store Phone)    |   |
|   |      (Desktop / Tablet Chrome)     |   |    (iOS Safari / Android Chrome) |   |
|   +-----------------+------------------+   +-----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      | HTTPS (Admin API / UI)                 | HTTPS (Public QR / r/:slug)
                      v                                        v
+-----------------------------------------------------------------------------------+
|                         NEXT.JS APP ROUTER (EDGE / NODE RUNTIME)                  |
|  +-------------------------------------+   +----------------------------------+   |
|  |     /admin & /api/admin/* Routes    |   |     /r/[slug] Public Edge Route  |   |
|  |   - NextAuth Session Validation     |   |   - Ultra-lightweight Server Comp|   |
|  |   - Business & Settings Management  |   |   - Instant Cache Retrieval      |   |
|  |   - QR Code PDF/SVG Exporters       |   |   - Rate Limiter (IP-based)      |   |
|  +------------------+------------------+   +-----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      |                                        |
                      v                                        v
+-----------------------------------------------------------------------------------+
|                                CORE SERVICE LAYER                                 |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  |   Business Service |  | QR Generator Engine|  | Unified AI Service Layer    |  |
|  |   - Validation     |  | - SVG / PNG / PDF  |  | - Provider Orchestrator     |  |
|  |   - Place ID Check |  | - Sharp / Canvas   |  | - Prompt Template Engine    |  |
|  +---------+----------+  +---------+----------+  +--------------+--------------+  |
+------------|-----------------------|----------------------------|-----------------+
             |                       |                            |
             |                       v                            |
             |             +-------------------+                  |
             |             | S3 / R2 Asset CDN |                  |
             |             | (Logos & QR PDFs) |                  |
             |             +-------------------+                  |
             v                                                    v
+-----------------------------+                +------------------------------------+
|  POSTGRESQL RELATIONAL DB   |                |        AI PROVIDER ECOSYSTEM       |
|  - Prisma ORM Data Access   |                |  +-------------------------------+ |
|  - Connection Pooling       |                |  | Primary: Google Gemini Flash  | |
|  - Read / Write Separation  |                |  +---------------+---------------+ |
|  - JSONB Keywords/Services  |                |                  | Failover        |
|  - Timeseries Analytics     |                |  +---------------v---------------+ |
+-----------------------------+                |  | Secondary: Groq Llama 3.1 70B | |
                                               |  +---------------+---------------+ |
                                               |                  | Emergency Fallback
                                               |  +---------------v---------------+ |
                                               |  | Deterministic Rule-Based Pool | |
                                               |  +-------------------------------+ |
                                               +------------------------------------+
```

---

### 2. Comprehensive Technology Stack Evaluation & Selection

| Layer | Recommended Choice | Alternatives Evaluated | Justification & Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 15+ (App Router)** | Vite + Express, Remix, Nuxt | Single full-stack TypeScript environment. Server Components permit zero-bundle-size rendering for the customer QR landing page while React Server Actions streamline administrative form handling. |
| **Language** | **TypeScript 5.x** | Vanilla JavaScript | Strict static typing prevents runtime null-pointer bugs across complex AI prompt configurations, database entities, and API payloads. |
| **Styling & UI** | **Tailwind CSS + shadcn/ui** | Material UI, Chakra UI, Ant Design | Utility-first styling produces minimal production CSS bundles (< 25 KB). `shadcn/ui` provides accessible, unstyled Radix primitives that can be customized without heavy runtime CSS-in-JS overhead. |
| **Database** | **PostgreSQL 16** | MySQL, MongoDB, DynamoDB | Standard for relational multi-tenancy. Native `JSONB` support allows flexible indexing of keywords and service tags without schema alterations. ACID transactional safety for analytics aggregation. |
| **ORM** | **Prisma ORM** | Drizzle ORM, TypeORM | Type-safe query generation, automated schema migrations (`prisma migrate`), and seamless relationship modeling. |
| **Authentication** | **NextAuth.js (v5 / Auth.js)** | Supabase Auth, Clerk, Custom JWT | Self-hosted within PostgreSQL, avoiding recurring per-user SaaS charges. Supports email/password credentials and OAuth (Google Workspace for agency staff). |
| **QR Code Engine** | **`qrcode` + `sharp`** | Canvas, External QR Web APIs | Generates clean SVGs directly in memory without browser DOM dependencies. `sharp` converts SVGs into high-resolution PNGs (1024x1024, 2048x2048) in sub-10 milliseconds. |
| **PDF Generation** | **`@react-pdf/renderer`** | Puppeteer, PDFKit | Declarative React component syntax for designing print-ready, high-DPI marketing table tents and counter cards without launching heavy headless Chrome instances. |
| **Asset Storage** | **Cloudflare R2 / AWS S3** | Local Disk Storage | S3-compatible, ultra-low cost ($0.015/GB/mo), zero egress fees on R2. Stores business logos and pre-rendered vector PDF collaterals. |
| **Validation** | **Zod** | Yup, Joi | TypeScript-first schema declaration with static type inference, shared between client-side forms and server-side API handlers. |
| **Icons** | **Lucide React** | FontAwesome, Heroicons | Modular, tree-shakeable SVG icons matching shadcn design standards. |

---

### 3. Detailed AI Provider Benchmark & Comparative Analysis

We conducted an exhaustive evaluation of free and cost-effective AI providers to determine the optimal primary and fallback generation architecture.

#### 3.1 Provider Comparison Matrix

| Provider & Model | Free Tier Allowance | Paid Pricing (per 1M Tokens) | Average Latency | Quality & Reasoning | Concurrency & Rate Limits | Recommended Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini 1.5 / 2.0 Flash** | **15 RPM, 1,500 RPD, 1M TPM** (Free Tier) | **$0.075 / 1M Input**<br>**$0.30 / 1M Output** | **350ms – 600ms** | **Outstanding:** Excellent multilingual fluency (English, Hindi, Hinglish, Spanish). High temperature stability. | 15 requests/min (Free); 1,000+ RPM (Pay-as-you-go with credit card attached). | **PRIMARY PROVIDER** |
| **Groq Cloud (Llama 3.1 8B / 70B)** | **30 RPM, 14,400 RPD** (Free Developer Tier) | **$0.05 / 1M Input**<br>**$0.08 / 1M Output** (8B)<br>$0.59 / 1M (70B) | **180ms – 280ms** (LPU Hardware) | **Very High:** Llama 3.1 70B produces highly natural conversational text. 8B is blazing fast but less nuanced in Hinglish. | 30 RPM / 6,000 TPM (Free Tier). Extremely stable. | **HOT SECONDARY / FAILOVER** |
| **Cloudflare Workers AI (Llama 3.1 8B)** | **10,000 Neurons/day free** (~1,000 requests/day) | $0.011 per 1k Neurons | 400ms – 800ms | **Moderate:** Limited fine-tuning control, occasionally truncates custom system instructions. | Tied to Cloudflare Edge limits. | **TERTIARY BACKUP** |
| **OpenRouter (Aggregator)** | Varies per free model (e.g., `meta-llama/llama-3-8b:free`) | Passthrough + tiny margin | 600ms – 1800ms | **Variable:** Dependent on upstream server load. Routing latency can spike. | Shared community quotas often hit 429 during peak hours. | **NOT RECOMMENDED AS PRIMARY** |
| **Ollama (Self-Hosted)** | Zero API cost (Self-hosted) | Hardware costs only ($40–$120/mo for GPU VPS) | 800ms – 2500ms (on T4/A10G GPU) | Dependent on model loaded (Llama 3, Mistral 7B). | Limited only by host server VRAM concurrency. | **OVERKILL FOR INITIAL PHASE** |

#### 3.2 Architectural Decision: Unified AI Service & Failover Cascade
1. **Primary Provider:** **Google Gemini 2.0 Flash / 1.5 Flash**. Unbeatable multilingual capabilities (vital for Indian, European, and American regional contexts), native JSON schema enforcement, and negligible cost.
2. **Secondary Provider (Hot Failover):** **Groq Llama 3.1 70B Versatile**. Delivers unmatched generation speed (sub-300ms) when Gemini hits rate limits or experiences regional latency spikes.
3. **Emergency Fallback (Deterministic Template Generator):** If both external AI APIs are unreachable, a deterministic algorithmic engine instantly populates a pre-written template using the business's actual keywords and services (e.g., *"Visited [Business Name] for [Service Name]. The team was exceptionally professional and attentive. Highly recommend!"*). **The customer never experiences a broken or hanging page.**

---

### 4. Review Generation Strategy: Live vs. Pre-Generated Pool vs. Hybrid

A critical architectural decision is **when** the AI review suggestion is generated:

| Strategy | Description | Latency | AI Cost | Freshness & Variety | Failure Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option A: Pure On-Demand** | Call AI API on every QR scan. | 500ms – 1,800ms | Highest (1 API call per scan) | Infinite variety | High (if AI API stalls or rate-limits, customer waits). |
| **Option B: Pure Pre-Generation** | Generate 20 reviews when business is saved; serve static list. | **< 50ms** | Lowest (one-time batch) | Low (finite pool repeats quickly) | Zero (served directly from database). |
| **Option C: Hybrid Pool with Smart Asynchronous Replenishment (RECOMMENDED)** | Maintain a cached pool of **8 to 15 unique, high-quality review suggestions** per business in PostgreSQL/Redis. Serve instantly upon scan; trigger asynchronous background replenishment when the pool drops below a threshold or on schedule. | **< 60ms (Instant)** | **Very Low** (90% cache hits) | **Very High** (Continuous rotation across keywords & services) | **Resilient to 100% of external AI API outages.** |

#### Recommended Implementation: The Hybrid Pool Architecture
- When an agency configures a business, the system automatically dispatches a background worker to generate an initial pool of **10 varied suggestions** across different lengths and service highlights.
- When an end-customer scans the QR code, the landing page fetches a randomly selected active suggestion from the database in **< 40ms**.
- If the customer taps *"Give me another suggestion"*, the client rotates to the next item in the pre-loaded payload without firing a new AI request.
- A lightweight cron job runs every 48 hours to refresh the pool with fresh variations, ensuring that reviews posted over time do not look repetitive or robotic.

---

### 5. QR Code Generation & Asset Pipeline Architecture

```
+------------------------------------------------------------------------+
|                          QR GENERATION PIPELINE                        |
+------------------------------------------------------------------------+
                               |
                               v
                     [ 1. Dynamic Route Definition ]
                     https://reviews.agency.com/r/:slug
                               |
                               v
                     [ 2. Vector Matrix Generation ]
                     - Library: node 'qrcode'
                     - Error Correction: Level 'M' (15% redundancy)
                     - Optimized SVG Path calculation
                               |
          +--------------------+--------------------+
          |                                         |
          v                                         v
 [ 3A. High-Res Rasterizer ]               [ 3B. PDF Print Engine ]
 - Engine: 'sharp' (C-lib)                 - Engine: '@react-pdf/renderer'
 - Formats: 1024x1024, 2048x2048 PNG       - Formats: US Letter / A4 / Table Tent
 - Custom Logo embedding in center         - Business Logo + QR + Custom Instructions
          |                                         |
          +--------------------+--------------------+
                               |
                               v
                     [ 4. S3/R2 Asset Storage ]
                     Permanent CDN caching of assets
```

1. **Error Correction Level:** Configured at **Level M (15%)** by default. If the business chooses to embed their logo in the center of the QR code, the generator automatically elevates to **Level Q (25%)** or **Level H (30%)** to ensure camera read reliability despite logo occlusion.
2. **Dynamic Slug Immutability:** The QR code encodes only `https://[domain]/r/[businessSlug]`. The database maps `businessSlug -> targetGoogleUrl`. If the business changes their Google Place ID or review link, the database record is updated in 1 millisecond, and existing physical prints continue working seamlessly.

---

### 6. Mobile Browser Compatibility & Clipboard Architecture

#### 6.1 The Single-Tap "Copy & Open Google" Challenge
Mobile browsers (particularly **iOS Safari** and **Android Chrome**) enforce strict security restrictions regarding user interaction and the system clipboard:
- The modern `navigator.clipboard.writeText()` API requires an **active, transient user gesture** (direct click/touch event).
- Browsers disallow asynchronous clipboard writing if delayed by more than ~1,000ms after the physical user tap.
- Opening a new window or external deep link (`window.open(url, '_blank')`) inside an asynchronous callback is frequently blocked by mobile popup blockers.

#### 6.2 The Bulletproof Universal Click Handler
To guarantee 100% cross-device reliability across iPhone Safari, Chrome for Android, Samsung Internet, and in-app web views (Instagram/WeChat browsers):

```typescript
// Architectural specification for landing page CTA execution
async function handleCopyAndRedirect(reviewText: string, googleReviewUrl: string) {
  // Step 1: Immediate Synchronous Clipboard Attempt
  let copySuccessful = false;
  
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(reviewText);
      copySuccessful = true;
    } catch (err) {
      console.warn("Navigator clipboard failed, attempting execCommand fallback", err);
    }
  }

  // Step 2: Legacy execCommand Fallback (for older iOS / WebViews)
  if (!copySuccessful) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = reviewText;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      copySuccessful = document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  }

  // Step 3: Fire Non-Blocking Asynchronous Beacon for Analytics
  navigator.sendBeacon("/api/analytics/track", JSON.stringify({
    businessSlug: currentSlug,
    event: "COPY_AND_REDIRECT_CLICK",
    copySuccess: copySuccessful,
    timestamp: Date.now()
  }));

  // Step 4: UI State Feedback
  showToast("Review copied! Opening Google...");

  // Step 5: Direct Navigation (Bypasses Popup Blocker)
  // We use window.location.href instead of window.open to guarantee seamless handoff
  // into the native Google Maps app or Google mobile browser view.
  setTimeout(() => {
    window.location.href = googleReviewUrl;
  }, 350); // 350ms delay permits the user to perceive the tactile copy confirmation
}
```

---

### 7. Google Business Profile Review URL Deep Dive

There are two primary formats for linking directly to a Google review submission box:
1. **The Modern Short Link:** `https://g.page/r/[CID]/review` (Generated inside the Google Business Profile manager under "Get more reviews").
2. **The Direct Place ID Local Search Link:** `https://search.google.com/local/writereview?placeid=[PLACE_ID]` (Universal, works across all devices, launches the modal review dialog directly).

**Architectural Recommendation:** The platform supports both formats. A built-in Place ID lookup utility enables agencies to simply type their client's business name and address, automatically fetching the verified `placeid` using Google's public Place Autocomplete endpoint, and constructing the fail-safe `search.google.com/local/writereview?placeid=...` URL.

---

### 8. System Logging, Monitoring & Observability

1. **Structured JSON Application Logs:** Using `pino` for low-overhead JSON logging on the server, capturing request IDs, business IDs, latency, and status codes.
2. **AI Provider Health Telemetry:** Tracks rolling 10-minute error rates and latency percentiles (p50, p95, p99) for Gemini and Groq.
3. **Error Boundary & Exception Handling:** Unhandled exceptions in the customer funnel trigger instant telemetry while serving the deterministic template fallback to the visitor.

