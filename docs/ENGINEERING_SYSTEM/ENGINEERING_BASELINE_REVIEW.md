# Engineering Baseline Review & Technical Consistency Audit

## Document Ref: `docs/ENGINEERING_SYSTEM/ENGINEERING_BASELINE_REVIEW.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**Author:** Chief Technology Officer & Principal Software Architect  
**Status:** APPROVED & LOCKED  
**Date:** 2026-11-12  

---

### 1. Executive Summary & Audit Scope

Prior to establishing the AI engineering team and initiating development, an exhaustive consistency and feasibility audit was conducted across the 12 master planning documents. 

The audit evaluated:
1. AI model availability, official pricing structures, and rate limits.
2. AI-generated review compliance and Google Business Profile policies.
3. Mobile browser clipboard capabilities and sandboxing restrictions.
4. Database transaction integrity and connection scaling assumptions.
5. API security, rate limiting, and open redirect defenses.
6. Core Web Vitals and performance SLA realistic boundaries.

All validated assumptions, corrected technical guarantees, and operational realities are cataloged below to ensure zero architectural ambiguity during execution.

---

### 2. Audited Corrections to Technical Guarantees

The planning documents proposed an exceptionally robust architecture; however, several real-world operational constraints require explicit correction:

| Module / Topic | Previous Planning Assumption | Audited Technical Reality & Engineering Correction |
| :--- | :--- | :--- |
| **System Availability** | Mentioned "99.99% / 100% availability" | **Correction:** No distributed web system can promise 100% uptime. Target SLA is established at **99.9% uptime**, backed by multi-region static edge caching on Cloudflare/Vercel and local deterministic review templates. |
| **Mobile Clipboard** | Implied universal 1-tap programmatic clipboard copy across all mobile devices. | **Correction:** Mobile Safari, Samsung Internet, and in-app WebViews (Instagram, TikTok) frequently reject `navigator.clipboard.writeText()` if delayed by async micro-tasks or sandboxed. **Engineering standard:** Primary sync copy attempt -> legacy `execCommand` fallback -> **Graceful Manual Long-Press Copy Modal**. Universal 1-tap is NOT guaranteed; graceful fallback IS guaranteed. |
| **AI Provider Free Tiers** | Assumed free tiers (Gemini 1,500 RPD, Groq 14,400 RPD) are permanent operational baselines. | **Correction:** Free tiers are promotional developer quotas that can be throttled, altered, or revoked by providers without notice. **Engineering standard:** The architecture must operate smoothly on paid pay-as-you-go billing ($0.075/1M tokens), with usage alerts triggering at 80% quota. |
| **Deterministic Template Guarantees** | Stated deterministic templates guarantee successful AI review generation. | **Correction:** Deterministic templates are *algorithmic string interpolators*, not AI generation. They guarantee **zero customer-facing downtime**, but should be transparently categorized in telemetry as `FALLBACK_RULE_BASED`, not `AI_GENERATED`. |
| **Google Review Publishing** | Tracking redirects was clearly distinguished, but conversion metrics must remain unambiguous. | **Correction:** Under no circumstances will the dashboard or telemetry imply verified Google review submissions. The metric is strictly labeled **"Google Redirect Clicks"**. |
| **Google Policy & Legal Compliance** | Stated the platform is legally compliant. | **Correction:** Software cannot provide absolute legal immunity. Compliance is maintained by **eliminating review gating**, including clear user-facing draft disclaimers, forbidding financial review incentives in terms of service, and ensuring the consumer retains full agency to edit text and submit on Google. |

---

### 3. AI Model Availability & Pricing Verification

As of late 2024 / 2025 / 2026:
1. **Google Gemini Flash:**
   - Active Production Endpoints: `gemini-1.5-flash`, `gemini-2.0-flash`.
   - Free Tier: 15 Requests Per Minute (RPM), 1,500 Requests Per Day (RPD), 1M Tokens Per Minute (TPM).
   - Paid Tier: $0.075 / 1M Input Tokens; $0.30 / 1M Output Tokens.
   - Status: **VERIFIED PRIMARY PROVIDER**.
2. **Groq Cloud:**
   - Active Production Endpoints: `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`.
   - Free Developer Tier: 30 RPM, 14,400 RPD.
   - Paid Tier (8B): $0.05 / 1M Input; $0.08 / 1M Output.
   - Paid Tier (70B): $0.59 / 1M Input; $0.79 / 1M Output.
   - Status: **VERIFIED HOT SECONDARY FAILOVER**.
3. **Failover Execution Order:**
   - Step 1: Google Gemini Flash (Timeout: 2,500ms).
   - Step 2: Groq Llama 3.1 70B (Timeout: 2,000ms).
   - Step 3: Local Deterministic Algorithmic Template Engine (Instant: < 5ms).

---

### 4. Repository & Environmental Baseline

- **Repository Status:** Greenfield application (empty directory except for `docs/` architecture documents).
- **Runtime Environment:** Node.js 20+ LTS, macOS host.
- **Framework Target:** Next.js 15+ App Router, TypeScript 5.x, Tailwind CSS, shadcn/ui.
- **Database Target:** PostgreSQL 16 managed via Prisma ORM.
- **State Management & Communication:** NextAuth.js v5 credentials/JWT sessions, REST API Route Handlers, React Server Actions.

---

### 5. Architectural Alignment Sign-Off

The requirements in all 12 planning documents remain fully aligned with the corrections documented above. The team is authorized to proceed with the creation of the AI Engineering Operating System.

