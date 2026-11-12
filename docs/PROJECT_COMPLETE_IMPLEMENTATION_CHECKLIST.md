# Document 9: Master Granular Implementation Checklist

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform

---

### Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[!]` Blocked
- `[?]` Requires investigation

---

### Phase 0: Product Discovery, Compliance & Architectural Alignment
- [x] Define core business objectives, user personas, and customer journey boundaries.
- [x] Conduct deep audit of Google Maps Contributed Content Policy (Anti-Gating, Incentives, Fake Engagement).
- [x] Audit US FTC 16 CFR Part 465 (Consumer Reviews and Testimonials Rule) to ensure legal compliance.
- [x] Formulate legal disclaimer and optional draft copy strategy.
- [x] Benchmark AI providers (Gemini, Groq, Cloudflare Workers AI, OpenRouter, Ollama) on latency, pricing, and free tiers.
- [x] Architect primary (Gemini Flash) + secondary (Groq Llama 3.1 70B) + deterministic fallback cascade.
- [x] Evaluate mobile clipboard security constraints (`navigator.clipboard` vs `execCommand` vs manual fallback).
- [x] Design permanent dynamic redirection architecture to decouple physical QR codes from destination URLs.
- [x] Formulate hybrid suggestion pool strategy to reduce live AI costs by 90% and achieve sub-50ms landing page latency.
- [x] Author all foundational architectural specifications and planning documentation.

---

### Phase 1: Project Foundation & Technical Infrastructure
- [x] Initialize Next.js 15+ App Router project with TypeScript in strict mode.
  - [x] Configure `tsconfig.json` with strict type checking, path aliases (`@/*`).
  - [x] Configure `.eslintrc.json` and Prettier formatting rules.
- [x] Set up Tailwind CSS 3.4+ / 4.x utility framework with design token variables.
- [x] Install and configure `shadcn/ui` component primitives (Radix UI).
- [x] Install core system dependencies:
  - [x] `zod` for type-safe runtime schema validation.
  - [x] `lucide-react` for iconography.
  - [x] `clsx` and `tailwind-merge` for conditional class management.
- [x] Set up environment configuration files (`.env.example`, `.env.local`):
  - [x] `DATABASE_URL` (PostgreSQL connection string).
  - [x] `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
  - [x] `GEMINI_API_KEY` (Google Gemini API).
  - [x] `GROQ_API_KEY` (Groq Cloud API).
  - [x] `CLOUDFLARE_R2_*` / S3 storage credentials.
  - [x] `UPSTASH_REDIS_*` credentials (for rate limiting).
- [x] Create standardized HTTP response helpers (`apiResponse.success`, `apiResponse.error`).
- [x] Set up structured JSON logger utility (`pino` or lightweight edge-compatible logger).
- [x] Configure global error boundary (`app/global-error.tsx`) and not-found handler (`app/not-found.tsx`).
- [x] Verify local dev server starts cleanly with zero warnings or hydration errors.

---

### Phase 2: Authentication, Access Control & Agency Multi-Tenancy
- [x] Install NextAuth.js (Auth.js v5) and Prisma adapter.
- [x] Create authentication configuration (`auth.config.ts`, `auth.ts`):
  - [x] Implement Credentials provider with email and password.
  - [x] Implement password hashing and verification using `argon2` or `bcryptjs`.
  - [x] Configure JWT session strategy with 30-day rolling expiration.
  - [x] Enforce `HttpOnly`, `SameSite=Lax`, and `Secure` cookie flags.
- [x] Build administrative authentication UI:
  - [x] `/admin/login`: Sleek, centered card layout with email, password, and error states.
  - [x] Form validation with Zod schema (`LoginSchema`).
  - [x] Loading spinners and disabled button states during authentication round-trips.
- [x] Implement Next.js Middleware route guard (`middleware.ts`):
  - [x] Protect all `/admin/*` and `/api/admin/*` routes against unauthenticated requests.
  - [x] Ensure public routes (`/r/*`, `/api/analytics/track`, `/api/health`) bypass authentication.
- [x] Build User Profile and Password Management:
  - [x] Secure endpoint to update admin password (`PATCH /api/admin/profile/password`).
  - [x] Input validation requiring current password verification.
- [x] Unit & integration tests for authentication lifecycle:
  - [x] Test valid login redirects to `/admin/dashboard`.
  - [x] Test invalid credentials reject with 401 Unauthorized.
  - [x] Test unauthenticated requests to `/admin/businesses` redirect to login.

---

### Phase 3: Database Architecture, Models & Prisma ORM Setup
- [x] Initialize Prisma ORM (`npx prisma init`).
- [x] Configure PostgreSQL datasource and Prisma schema models (`prisma/schema.prisma`):
  - [x] Define `User` model with roles (`SUPER_ADMIN`, `AGENCY_ADMIN`, `STAFF_VIEWER`).
  - [x] Define `Business` model with UUID PK, unique `slug`, `googleReviewUrl`, `JSONB` keywords/services.
  - [x] Define `AIConfiguration` model (1:1 with Business, cascade delete).
  - [x] Define `QRCode` model (1:1 with Business, cascade delete, asset URLs).
  - [x] Define `ReviewSuggestion` model (pool table with `timesServed`, `timesCopied`).
  - [x] Define `AnalyticsEvent` model with indexed `businessId`, `eventType`, `createdAt`.
  - [x] Define `AIUsageLog` model for telemetry and quota tracking.
  - [x] Define `AuditLog` model for tracking administrative changes.
- [x] Add explicit indexes:
  - [x] Unique B-Tree index on `Business.slug`.
  - [x] Composite index on `Business(userId, status)`.
  - [x] Composite index on `ReviewSuggestion(businessId, isArchived)`.
  - [x] Composite index on `AnalyticsEvent(businessId, createdAt, eventType)`.
- [x] Create initial Prisma migration (`prisma migrate dev --name init_database_schema`).
- [x] Implement robust Prisma client singleton (`lib/prisma.ts`) preventing development connection leaks.
- [x] Create database seed script (`prisma/seed.ts`):
  - [x] Seed initial Super Admin account.
  - [x] Seed demo client business ("Apex Dental Studio") with pre-populated keywords and suggestions.
- [x] Verify migrations and seed scripts execute cleanly on local and cloud databases.

---

### Phase 4: Business Management Module (Core CRUD)
- [x] Create Zod validation schemas (`lib/validations/business.ts`):
  - [x] `CreateBusinessSchema`: Name, category, address, phone, website, Google review URL.
  - [x] `UpdateBusinessDetailsSchema`: Keywords, services, factual highlights, languages.
  - [x] `UpdateAIConfigSchema`: Length, style, temperature, custom prompt instructions.
- [x] Implement backend Business Service layer (`services/business.service.ts`):
  - [x] `createBusiness`: Handles slug generation, uniqueness check, transaction insertion of AIConfig and QRCode.
  - [x] `getBusinesses`: Filtered, paginated listing scoped to authenticated user.
  - [x] `getBusinessById`: Full detail retrieval with related AIConfig and QR records.
  - [x] `updateBusiness`: Atomic field updates with input sanitization.
  - [x] `archiveBusiness`: Soft-delete setting `status = 'ARCHIVED'` and `archivedAt = now()`.
  - [x] `restoreBusiness`: Restores archived business to `ACTIVE`.
  - [x] `hardDeleteBusiness`: Cascading permanent deletion with typed name confirmation.
- [x] Build API Route Handlers:
  - [x] `POST /api/admin/businesses` (Create)
  - [x] `GET /api/admin/businesses` (List with search, status filters)
  - [x] `GET /api/admin/businesses/[id]` (Detail)
  - [x] `PATCH /api/admin/businesses/[id]` (Update)
  - [x] `POST /api/admin/businesses/[id]/archive` (Archive)
  - [x] `POST /api/admin/businesses/[id]/restore` (Restore)
  - [x] `DELETE /api/admin/businesses/[id]` (Permanent delete)
- [x] Build Administrative UI Screens (`app/(admin)/businesses/`):
  - [x] Business Catalog Page (`page.tsx`):
    - [x] Search input with debounced querying.
    - [x] Status filter tabs (Active, Inactive, Archived).
    - [x] Responsive data table with logo, name, category, scan counts, and action buttons.
  - [x] Create Business Drawer / Modal (`components/business/create-business-modal.tsx`).
  - [x] Edit Business Tabs:
    - [x] Tab 1: General Information & Branding (Logo upload).
    - [x] Tab 2: Google Review Link & Place ID verification.
    - [x] Tab 3: Keywords, Services & Factual Highlights (Interactive tag inputs).
    - [x] Tab 4: AI Review Generation Tuning.
  - [x] Archive and Hard Delete confirmation dialogs with double-confirmation safety.
- [x] Test all CRUD workflows, edge-case validations, and tenant isolation constraints.

---

### Phase 5: Google Business Profile URL & Place ID Management
- [x] Research and implement Google URL parsing utility (`lib/utils/google-url.ts`):
  - [x] Validate standard format (`https://search.google.com/local/writereview?placeid=...`).
  - [x] Validate short format (`https://g.page/r/.../review`).
  - [x] Validate Maps query links (`https://maps.google.com/?cid=...`).
- [x] Build Google Review URL verification endpoint (`POST /api/admin/businesses/[id]/verify-google-url`):
  - [x] Performs syntax validation against authorized Google domain regex.
  - [x] Extracts Google Place ID if present.
  - [x] Runs server-side HEAD request to ensure link does not return 404 or connection failure.
- [x] Build Google Place ID Auto-Discovery helper (optional Google Places API integration):
  - [x] Allow admin to search business name and city to auto-populate Place ID and construct verified review URL.
- [x] Add direct "Test Review Link" button in admin UI that launches the review dialog in a new browser tab.
- [x] Unit test URL validator against 20+ valid and invalid Google review URL variations.

---

### Phase 6: Unified AI Service & Provider Failover Cascade
- [x] Define standardized TypeScript interface (`services/ai/ai-provider.interface.ts`):
  - [x] `IAIService.generateReviewSuggestions(params: GenerateParams): Promise<GeneratedSuggestion[]>`.
- [x] Implement Google Gemini Provider (`services/ai/providers/gemini.provider.ts`):
  - [x] Initialize `@google/genai` or official REST client.
  - [x] Configure `gemini-2.0-flash` / `gemini-1.5-flash` model.
  - [x] Implement JSON response schema enforcement for structured output.
  - [x] Add timeout interceptor (abort after 2,500ms).
- [x] Implement Groq Cloud Provider (`services/ai/providers/groq.provider.ts`):
  - [x] Initialize Groq SDK with `llama-3.1-70b-versatile` or `llama-3.1-8b-instant`.
  - [x] Format prompt payloads with JSON mode.
  - [x] Add timeout interceptor (abort after 2,000ms).
- [x] Implement Deterministic Algorithmic Fallback Engine (`services/ai/providers/deterministic.provider.ts`):
  - [x] Curate 20+ authentic review structural templates.
  - [x] Dynamically inject business name, specific service tags, and factual highlights.
  - [x] Guarantee 100% availability in 0ms without external network dependencies.
- [x] Build AI Orchestrator with Circuit Breaker (`services/ai/ai-orchestrator.service.ts`):
  - [x] Attempts Primary Provider (Gemini).
  - [x] On failure (HTTP 429, 500, timeout), logs error in `AIUsageLog` and cascades to Secondary (Groq).
  - [x] On secondary failure, immediately falls back to Deterministic Provider.
- [x] Implement Prompt Sanitization & Security Armor (`services/ai/prompt-builder.ts`):
  - [x] Enclose all business metadata within `<business_context>` XML tags.
  - [x] Enforce negative prompting against fabricated pricing, guarantees, or medical claims.
  - [x] Dynamically format prompt for requested length (`SHORT`, `MEDIUM`, `LONG`), style, and language.
- [x] Build Admin AI Test Bench (`/admin/settings`):
  - [x] Allow testing API keys with a live generation test returning latency (ms) and sample output.

---

### Phase 7: Hybrid Review Suggestion Pool Architecture
- [x] Implement Suggestion Pool Service (`services/suggestion-pool.service.ts`):
  - [x] `replenishPool(businessId, targetCount = 10)`: Asynchronously calls AI orchestrator to generate diverse review variations touching on different configured services.
  - [x] `getActiveSuggestion(businessId, language = 'en')`: Selects least-served active suggestion from database in < 30ms.
  - [x] `recordSuggestionServed(suggestionId)`: Increments impression counter.
  - [x] `recordSuggestionCopied(suggestionId)`: Increments conversion counter.
- [x] Build automated pool replenishment trigger:
  - [x] Trigger replenishment when pool count falls below 4.
  - [x] Trigger pool regeneration when admin updates core business services or keywords.
- [x] Add suggestion preview and manual curation interface in Admin Business view:
  - [x] View currently cached suggestions in the pool.
  - [x] Ability for agency admin to edit, archive, or add custom manual suggestions.
- [x] Test pool query latency under high simulated concurrent read load (< 25ms response).

---

### Phase 8: Dynamic QR Code Generation & Print Collateral Engine
- [x] Implement QR Code Matrix Engine (`services/qr/qr-generator.service.ts`):
  - [x] Utilize `qrcode` library to compute dynamic URL matrix (`https://[domain]/r/[slug]`).
  - [x] Support Error Correction Levels: `M` (standard) and `H` (for logo embedding).
  - [x] Generate pure vector SVG strings.
- [x] Implement High-Resolution PNG Rasterizer (`services/qr/qr-rasterizer.service.ts`):
  - [x] Utilize `sharp` to render 1024x1024 and 2048x2048 PNG buffers.
  - [x] Embed business logo in center with rounded corners and white boundary buffer if enabled.
- [x] Implement Cloudflare R2 / S3 Asset Storage Service (`services/storage/storage.service.ts`):
  - [x] Upload generated SVG and PNG assets with permanent CDN cache headers.
  - [x] Save public asset URLs to `QRCode` database record.
- [x] Implement Print-Ready PDF Collateral Generator (`services/qr/pdf-generator.service.ts`):
  - [x] Utilize `@react-pdf/renderer` to construct high-DPI printable marketing materials:
    - [x] Template 1: Table Tent Card (4" x 6" with fold lines).
    - [x] Template 2: Countertop Acrylic Stand (5" x 7").
    - [x] Template 3: Wallet Card / Receipt Sticker (2" x 3.5").
  - [x] Incorporate high-res business logo, clear callout text ("Scan to share your review on Google!"), QR code, and subtle compliance footnote.
- [x] Build QR Studio Administrative UI (`app/(admin)/qr-studio/page.tsx`):
  - [x] Real-time canvas preview of QR code.
  - [x] Hex color pickers for foreground/background.
  - [x] Center logo toggle.
  - [x] Download buttons: `[Download SVG]`, `[Download PNG]`, `[Export PDF Table Tent]`.
- [x] Verify dynamic link persistence: Edit business Google URL, confirm physical QR code still works without re-printing.

---

### Phase 9: Public Mobile-First Customer Landing Page (`/r/:businessSlug`)
- [x] Build Next.js Public Route (`app/r/[slug]/page.tsx`):
  - [x] Implement as ultra-lightweight React Server Component for sub-second delivery.
  - [x] Fetch business entity and active suggestion pool in a single optimized SQL query.
  - [x] Apply `stale-while-revalidate` caching headers.
- [x] Handle Edge & Error States:
  - [x] Non-existent slug: Render polite 404 page.
  - [x] Inactive / Archived business: Render branded paused notice with direct Google fallback link.
- [x] Build Clean Mobile UI Layout (`components/public/customer-card.tsx`):
  - [x] Verified Business Header: Crisp logo (72x72px WebP), Business Name, City/Category.
  - [x] Friendly Context Intro: *"We appreciate your visit today! Here is a draft suggestion to make reviewing us on Google effortless:"*.
  - [x] The Suggestion Card: High-contrast typography, styled quotes, editable text container allowing customer personalization.
  - [x] Secondary Action: *"⟳ Try another suggested review"* button (cycles pre-loaded variations instantly without page reload).
  - [x] Primary Sticky CTA Button: **"Copy Review & Open Google"** (56px touch target, high contrast, prominent icon).
  - [x] Compliance & Transparency Disclaimer Footer: Transparent note regarding genuine experience.
- [x] Optimize Performance & Core Web Vitals:
  - [x] Inline critical CSS.
  - [x] Zero external fonts (native system font stack).
  - [x] Verify zero layout shift (CLS = 0.00) and LCP < 1.0s on 4G throttling.

---

### Phase 10: Robust Single-Tap Copy & Redirect Workflow
- [x] Implement Universal Cross-Device Click Handler (`components/public/action-button.tsx`):
  - [x] Primary Attempt: `navigator.clipboard.writeText(suggestionText)` within user touch event.
  - [x] Fallback Attempt: Hidden `textarea` with `document.execCommand('copy')` for older iOS/WebViews.
  - [x] Immediate UI state update: Button changes to **"✓ Copied! Opening Google..."** with emerald green styling.
  - [x] Tactile feedback: Trigger native mobile haptic vibration (`navigator.vibrate(50)`).
  - [x] Non-blocking beacon: Send `COPY_AND_REDIRECT_CLICK` event via `navigator.sendBeacon`.
  - [x] Seamless Redirect: Execute `window.location.href = business.googleReviewUrl` after 350ms delay.
- [x] Build Graceful Fallback Modal (For Restricted Sandboxes):
  - [x] If programmatic clipboard write is denied by mobile security policy, trigger manual copy sheet.
  - [x] Automatically select text with clear instruction: *"Tap and hold to copy, then tap Open Google."*.
  - [x] Direct secondary button to launch Google.
- [x] Cross-Device Real Hardware Testing:
  - [x] Test on iPhone Safari (iOS 16, 17, 18).
  - [x] Test on Android Chrome (Pixel, Samsung).
  - [x] Test in Instagram / Facebook in-app WebViews.

---

### Phase 11: Real-Time Analytics & Telemetry Engine
- [x] Implement High-Throughput Analytics Tracking Route (`app/api/analytics/track/route.ts`):
  - [x] Handles client-side beacons (`navigator.sendBeacon`).
  - [x] Validates event types (`QR_SCAN`, `PAGE_VIEW`, `SUGGESTION_COPIED`, `GOOGLE_REDIRECT_CLICK`, `SUGGESTION_REFRESHED`).
  - [x] Parse User-Agent using `ua-parser-js` (Device: Mobile/Desktop; OS: iOS/Android; Browser: Safari/Chrome).
  - [x] Resolve Geo-IP country and city from edge headers (`x-vercel-ip-country`, Cloudflare headers, or MaxMind).
  - [x] Anonymize IP: Hash with daily salt (`SHA-256(IP + salt)`). Discard raw IP.
  - [x] Asynchronous write to `AnalyticsEvent` table.
- [x] Build Analytics Aggregation Service (`services/analytics.service.ts`):
  - [x] `getBusinessFunnel(businessId, dateRange)`: Computes Scans -> Views -> Copies -> Redirects.
  - [x] `getPortfolioKPIs(userId, dateRange)`: Computes aggregate conversion rate and volume trends.
  - [x] `getDeviceBreakdown(businessId)`: OS and browser distribution.
- [x] Build Administrative Analytics Dashboard (`app/(admin)/analytics/page.tsx`):
  - [x] Funnel Drop-off Bar Chart.
  - [x] Daily Scan Trend Area Chart.
  - [x] Device Distribution Donut Chart.
  - [x] Clear disclaimer labeling: *"Google Redirects represents high-intent click-throughs; actual review posting occurs within Google's private interface."*.
- [x] Implement Automated Data Pruning Cron Job:
  - [x] Rolls up events older than 180 days into daily summaries and purges individual event rows.

---

### Phase 12: Security Hardening, Rate Limiting & Compliance Audit
- [x] Configure Rate Limiting Middleware (`middleware.ts` / `lib/rate-limit.ts`):
  - [x] Upstash Redis token bucket algorithm.
  - [x] Public QR landing pages: 30 requests/minute per IP.
  - [x] Analytics beacon: 60 requests/minute per IP.
  - [x] Admin authentication routes: 5 attempts/15 minutes per IP.
- [x] Security Headers Configuration (`next.config.js`):
  - [x] Content Security Policy (CSP): Restrict script, object, and frame execution.
  - [x] `X-Frame-Options: DENY` (Prevent clickjacking).
  - [x] `X-Content-Type-Options: nosniff`.
  - [x] `Strict-Transport-Security` (HSTS).
  - [x] `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] File Upload Hardening (`app/api/admin/upload-logo/route.ts`):
  - [x] Restrict file size to max 2 MB.
  - [x] Validate MIME types (`image/png`, `image/jpeg`, `image/svg+xml`).
  - [x] Magic byte header inspection.
  - [x] Sanitize SVGs using `DOMPurify` / `SVGO` to strip embedded `<script>` tags.
  - [x] Re-encode raster images through `sharp` to strip metadata payloads.
- [x] Multi-Tenant Isolation Audit:
  - [x] Run security test suite ensuring no admin user can query, edit, or delete another tenant's business records.

---

### Phase 13: End-to-End Testing, Browser Matrix & QA Verification
- [x] Execute Functional Test Suite (Vitest / Jest):
  - [x] Test Business CRUD service methods and validation schemas.
  - [x] Test QR code generation and SVG path integrity.
  - [x] Test AI prompt builder and XML context isolation.
  - [x] Test Analytics aggregation calculations.
- [x] Execute AI Provider Failover Integration Tests:
  - [x] Mock Gemini 429 error; verify seamless automatic switch to Groq.
  - [x] Mock Groq failure; verify seamless fallback to deterministic templates.
- [x] Execute Playwright E2E Browser Test Suite:
  - [x] Full Admin Journey: Login -> Add Business -> Set Keywords -> Download QR.
  - [x] Full Customer Mobile Journey: Open `/r/apex-dental` -> Verify Suggestion -> Tap Copy & Redirect.
- [x] Conduct Real Hardware Mobile Verification:
  - [x] Physical iPhone on 4G network: Camera scan -> Safari load -> 1-tap copy -> Google Maps launch.
  - [x] Physical Android phone on 4G: Lens scan -> Chrome load -> 1-tap copy -> Google Maps launch.
- [x] Run Lighthouse Performance & Accessibility Audits:
  - [x] Verify Mobile Performance score ≥ 95.
  - [x] Verify Accessibility score = 100.
  - [x] Verify Best Practices score = 100.
  - [x] Verify SEO score = 100.

---

### Phase 14: Production Deployment & Infrastructure Orchestration
- [x] Configure Production Database (Neon / Supabase / AWS RDS PostgreSQL):
  - [x] Provision high-availability PostgreSQL with connection pooling.
  - [x] Apply production migrations (`npx prisma migrate deploy`).
  - [x] Configure automated daily encrypted snapshot backups.
- [x] Provision Object Storage (Cloudflare R2):
  - [x] Create production R2 bucket (`agency-reviewflow-assets`).
  - [x] Configure custom domain with CDN edge caching (`assets.domain.com`).
  - [x] Set up CORS policies permitting asset loading in admin and public domains.
- [x] Deploy Application (Vercel / Railway / Docker Cloud Run):
  - [x] Link production repository branch.
  - [x] Inject verified production environment variables.
  - [x] Configure custom primary domain (`app.domain.com`) and public QR domain (`reviews.domain.com`).
- [x] Verify SSL/TLS certificates and DNS propagation.
- [x] Run Smoke Tests against live production endpoints:
  - [x] Admin login and dashboard load.
  - [x] Live QR code generation and R2 storage upload.
  - [x] Live physical smartphone scan of production QR code.

---

### Phase 15: Documentation, Monitoring & Operational Handover
- [x] Deploy Application Observability & Error Tracking:
  - [x] Configure Sentry or Baselime for server and client error logging.
  - [x] Set up AI provider quota and error rate alerts on Slack / Discord webhook.
  - [x] Configure uptime monitoring pinging `/api/health` every 60 seconds (BetterStack / UptimeRobot).
- [x] Author Agency Operations & Client Onboarding Guide (`docs/AGENCY_USER_MANUAL.md`):
  - [x] Step-by-step instructions on finding a client's Google review URL.
  - [x] Recommended physical placement guidelines for table tents and counter signs.
  - [x] Best practices for configuring service keywords and tone.
- [x] Author Developer Maintenance & Troubleshooting Runbook (`docs/MAINTENANCE_RUNBOOK.md`):
  - [x] Database backup restoration procedure.
  - [x] AI provider failover testing commands.
  - [x] Redis rate limiter flush and diagnostic commands.
- [x] Final Architectural Handover Review.

