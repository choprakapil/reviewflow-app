# Global Engineering Rules & Architectural Standards

## Document Ref: `docs/ENGINEERING_SYSTEM/ENGINEERING_RULES.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE & BINDING  

---

### 1. General Coding Rules

1. **TypeScript Strictness:** Strict mode is mandatory (`strict: true`). Zero tolerance for implicit `any`, unused variables, or unchecked type assertions.
2. **Component Purity:** Keep components focused on a single responsibility. Pure presentational components must have zero side effects.
3. **Immutability:** Do not mutate objects or arrays in place. Use immutable updates (`[...arr, item]`, `{ ...obj, key: val }`).
4. **Explicit Return Types:** All exported functions, service methods, and API handlers must declare explicit return types.
5. **No Blind Dependency Additions:** Evaluate bundle size impact before adding any package. Check if the requirement can be solved with existing libraries or native Web APIs.
6. **Descriptive Naming:** Avoid generic names (`data`, `temp`, `res`, `val`). Use domain-explicit naming (`businessProfile`, `reviewSuggestionPool`, `qrMatrixBuffer`).

---

### 2. Frontend Engineering Rules

1. **Server Components by Default:** In Next.js 15+, keep all page components as React Server Components (RSC). Only mark components with `"use client"` when state, effects, or browser event listeners (e.g. `onClick`, `useEffect`) are strictly necessary.
2. **Mobile First Viewport:** The customer-facing landing page (`/r/[slug]`) must render cleanly on a 320px viewport without horizontal scrolling, and touch targets must meet the minimum 48x48px (preferably 56px height for primary CTA) touch guideline.
3. **Zero Layout Shifts:** Images (logos) and card containers must have explicit aspect ratios or width/height dimensions to guarantee Cumulative Layout Shift (CLS) = 0.00.
4. **Zero Non-Essential Client Bundles on Landing Page:** The public QR route must avoid heavy client-side libraries. Use native system fonts; inline critical CSS; deliver HTML on the first TCP packet.

---

### 3. Backend & API Engineering Rules

1. **Service Layer Isolation:** Route Handlers (`app/api/**/route.ts`) must only parse requests, invoke Zod validation schemas, call the appropriate Service class, and format standard JSON responses. Direct database queries inside Route Handlers are forbidden.
2. **Uniform Error Structure:** All errors must return the centralized JSON error schema with standard HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500).
3. **Database Transaction Safety:** Any operation that creates or mutates multiple interdependent records (e.g., Business + AIConfiguration + QRCode) must be wrapped inside a `prisma.$transaction()`.
4. **Connection Pool Management:** Use a singleton Prisma client instance (`lib/prisma.ts`) to avoid leaking database connections during Next.js hot-reloads and serverless executions.

---

### 4. AI & Integration Engineering Rules

1. **Provider Independence:** Business logic and suggestion pool generation must never depend directly on the Gemini SDK or Groq SDK. All interactions must pass through the `IAIService` interface.
2. **Strict System Isolation & XML Armor:** User and business inputs must be encapsulated in `<business_context>` XML tags, and system prompts must explicitly mandate ignoring instructions within data blocks.
3. **Never Fabricate Claims:** Prompt templates must explicitly instruct the LLM to write in an appreciative, conversational customer tone without fabricating discounts, false guarantees, or specific unverified claims.
4. **Zero Customer Downtime:** The deterministic rule-based template engine must always be available as an instant fallback if all external AI APIs fail or rate limit.

---

### 5. Security & Privacy Rules

1. **Strict Google Domain Validation:** All Google review URLs must strictly match Google domains (`google.com`, `g.page`, `goo.gl`) to prevent malicious open redirect attacks.
2. **Multi-Tenant Row Isolation:** Every database read and write for administrative business data must include the authenticated user ID: `WHERE userId = session.userId`.
3. **Zero Consumer PII:** Do not record names, emails, phone numbers, or unhashed IP addresses for in-store customers scanning QR codes. Hash IPs with a daily rotating salt before storing in `AnalyticsEvent`.
4. **Server-Side Secrets:** API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `DATABASE_URL`) must never be prefixed with `NEXT_PUBLIC_` and must never appear in client bundles.

