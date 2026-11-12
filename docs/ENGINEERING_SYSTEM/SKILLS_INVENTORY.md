# Master Skills Inventory & Capability Catalog

## Document Ref: `docs/ENGINEERING_SYSTEM/SKILLS_INVENTORY.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** COMPLETE (59 Specialized Skills Cataloged)  

---

### 1. Catalog Overview

The skills library establishes concrete, step-by-step engineering capabilities for all specialist agents. Every skill adheres to the official Antigravity skill format (`.agents/skills/<skill-name>/SKILL.md`) with YAML metadata, standardized procedures, and strict verification gates.

```
.agents/skills/
├── [Product & Architecture (1–7)]
├── [UI/UX & Design Systems (8–14)]
├── [Frontend Engineering (15–19)]
├── [Backend & REST APIs (20–26)]
├── [Database & Data Integrity (27–32)]
├── [AI & LLM Systems (33–41)]
├── [Product-Specific Engineering (42–46)]
└── [Quality, Reliability & DevOps (47–59)]
```

---

### 2. Comprehensive 59-Skill Master Registry

| ID | Skill Name | Primary Domain | Owning Agent | Core Focus & Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `product-requirements-analysis` | Product | Agent 01 (PM) | Unpacks business requests into discrete functional constraints. |
| **02** | `product-scope-control` | Product | Agent 01 (PM) | Enforces MVP boundaries and rejects unneeded CRM/ERP features. |
| **03** | `user-story-and-acceptance-criteria`| Product | Agent 01 (PM) | Drafts measurable Given-When-Then pass/fail test criteria. |
| **04** | `system-architecture-design` | Architecture | Agent 02 (Arch) | Designs clean, decoupled monolithic modular Next.js systems. |
| **05** | `architectural-decision-records` | Architecture | Agent 02 (Arch) | Authors immutable ADR documents capturing technical trade-offs. |
| **06** | `modular-code-organization` | Architecture | Agent 02 (Arch) | Enforces separation of concerns between API, Service, and DB. |
| **07** | `technical-debt-management` | Architecture | Agent 02 (Arch) | Audits, catalogs, and plans remediation for technical debt. |
| **08** | `premium-saas-ui-design` | UI/UX | Agent 03 (UI/UX) | Implements clean, modern Vercel/Linear-inspired SaaS interfaces. |
| **09** | `design-system-management` | UI/UX | Agent 03 (UI/UX) | Governs color tokens, typography scales, and Radix primitives. |
| **10** | `responsive-design` | UI/UX | Agent 03 (UI/UX) | Ensures pixel-perfect layouts from 320px (iPhone SE) to 4K monitors. |
| **11** | `accessibility-wcag` | UI/UX | Agent 03 (UI/UX) | Enforces WCAG 2.1 AA contrast, ARIA landmarks, and keyboard focus. |
| **12** | `frontend-state-management` | UI/UX / Front | Agent 04 (Front) | Manages URL state, optimistic updates, and form transitions. |
| **13** | `frontend-error-and-loading-states`| UI/UX / Front | Agent 04 (Front) | Builds skeleton screens, error boundaries, and retry prompts. |
| **14** | `mobile-first-customer-experience` | UI/UX / Front | Agent 03 / 04 | Optimizes the public in-store QR landing page for speed and ergonomics. |
| **15** | `nextjs-app-router` | Frontend | Agent 04 (Front) | Governs Server Components, Client boundaries, and Route Handlers. |
| **16** | `react-component-engineering` | Frontend | Agent 04 (Front) | Authors composable, memoized, strongly-typed React components. |
| **17** | `typescript-best-practices` | Frontend / Back | All Agents | Enforces strict type safety, eliminating `any` and unhandled unions. |
| **18** | `frontend-performance` | Frontend | Agent 12 (Perf) | Optimizes bundle size, eliminates render blocking, and achieves 0.00 CLS. |
| **19** | `form-validation-and-accessibility`| Frontend | Agent 04 (Front) | Pairs React Hook Form with Zod schemas for accessible form UX. |
| **20** | `rest-api-design` | Backend | Agent 05 (Back) | Standardizes RESTful routes, HTTP methods, and status codes. |
| **21** | `api-validation-and-contracts` | Backend | Agent 05 (Back) | Enforces Zod request body/query validation on all endpoints. |
| **22** | `backend-service-architecture` | Backend | Agent 05 (Back) | Implements pure business logic layer decoupled from Next.js requests. |
| **23** | `standardized-api-error-handling` | Backend | Agent 05 (Back) | Implements uniform error response envelopes with error codes. |
| **24** | `authentication-and-authorization` | Backend / Sec | Agent 05 / 09 | NextAuth v5 session management, password hashing, and RBAC. |
| **25** | `rate-limiting-and-abuse-prevention`| Backend / Sec | Agent 09 (Sec) | Token-bucket IP rate limiting on public and auth endpoints. |
| **26** | `secure-file-upload` | Backend / Sec | Agent 05 / 09 | MIME inspection, SVGO sanitization, and Sharp re-encoding for logos. |
| **27** | `postgresql-database-design` | Database | Agent 06 (DB) | Relational schema modeling, foreign keys, and JSONB GIN indexing. |
| **28** | `prisma-orm-engineering` | Database | Agent 06 (DB) | Type-safe Prisma queries, singleton client, and schema definitions. |
| **29** | `database-migrations` | Database | Agent 06 (DB) | Zero-downtime, reversible Prisma migrations and validation. |
| **30** | `database-transactions-and-integrity`| Database | Agent 06 (DB) | ACID transactions for multi-record operations and cascading deletes. |
| **31** | `database-query-optimization` | Database | Agent 06 (DB) | Query profiling, connection pooling, and composite B-Tree indexes. |
| **32** | `multi-tenant-data-isolation` | Database / Sec | Agent 06 / 09 | Row-level tenant scoping preventing cross-account data leakage. |
| **33** | `llm-provider-abstraction` | AI / LLM | Agent 07 (AI) | Unified `IAIService` interface decoupling business logic from LLMs. |
| **34** | `gemini-integration` | AI / LLM | Agent 07 (AI) | Google Gemini 2.0/1.5 Flash client setup and JSON schema mode. |
| **35** | `groq-integration` | AI / LLM | Agent 07 (AI) | Groq LPU inference setup for sub-250ms Llama 3.1 failover. |
| **36** | `ai-prompt-engineering` | AI / LLM | Agent 07 (AI) | Dynamic prompt construction supporting length, style, and language. |
| **37** | `ai-output-validation` | AI / LLM | Agent 07 (AI) | Zod schema parsing and sanitization of LLM JSON outputs. |
| **38** | `ai-fallback-and-retry` | AI / LLM | Agent 07 (AI) | Circuit breaker, exponential backoff, and deterministic template fallback. |
| **39** | `ai-caching-and-cost-control` | AI / LLM | Agent 07 (AI) | Hybrid suggestion pool maintenance cutting live LLM calls by 90%. |
| **40** | `prompt-injection-defense` | AI / Sec | Agent 07 / 09 | XML tag isolation and negative prompting blocking jailbreak payloads. |
| **41** | `responsible-ai-content-generation`| AI / Legal | Agent 07 (AI) | Prevents fabricated claims, medical promises, or deceptive testimonials. |
| **42** | `google-business-profile-review-links`| Product Eng | Agent 08 (Google) | Parses, validates, and verifies direct Google Maps review URLs. |
| **43** | `dynamic-qr-code-generation` | Product Eng | Agent 08 (Google) | Node `qrcode` vector SVG, Sharp high-res PNG, and `@react-pdf` printouts. |
| **44** | `mobile-clipboard-integration` | Product Eng | Agent 04 / 08 | Universal clipboard writing with multi-layer fallback for iOS/Android. |
| **45** | `secure-url-redirection` | Product Eng / Sec| Agent 08 / 09 | Domain-whitelisted `window.location.href` navigation preventing open redirects. |
| **46** | `privacy-first-analytics` | Analytics | Agent 05 / 09 | Daily salt IP hashing and non-blocking beacon tracking without cookies. |
| **47** | `unit-testing` | QA / Testing | Agent 10 (QA) | Vitest unit tests verifying utility, schema, and algorithmic logic. |
| **48** | `integration-testing` | QA / Testing | Agent 10 (QA) | Database integration tests, API route validation, and auth sessions. |
| **49** | `end-to-end-testing` | QA / Testing | Agent 10 (QA) | Playwright tests verifying full admin and public customer flows. |
| **50** | `cross-browser-mobile-testing` | QA / Testing | Agent 10 (QA) | Emulated and real device testing across iOS Safari and Android Chrome. |
| **51** | `security-testing` | QA / Sec | Agent 09 / 10 | Automated penetration tests verifying tenant isolation and rate limits. |
| **52** | `accessibility-testing` | QA / UI | Agent 03 / 10 | Automated axe-core audits verifying WCAG 2.1 AA accessibility. |
| **53** | `performance-testing` | QA / Perf | Agent 12 (Perf) | Lighthouse CI audits guaranteeing sub-second LCP and 0.00 CLS. |
| **54** | `debugging-root-cause-analysis` | Reliability | Agent 11 (Debug) | Standardized 5-step RCA procedure preventing regression reoccurrence. |
| **55** | `code-review-and-quality-gates` | Quality Eng | All Agents | Multi-check gate blocking PRs with failed lint, types, or tests. |
| **56** | `error-monitoring-and-observability`| DevOps | Agent 13 (DevOps)| Structured Pino JSON logging, request IDs, and Sentry telemetry. |
| **57** | `deployment-and-release-management`| DevOps | Agent 13 (DevOps)| Production builds, environment injection, and rollback strategies. |
| **58** | `backup-and-disaster-recovery` | DevOps / DB | Agent 06 / 13 | Encrypted PostgreSQL snapshot automation and restoration verification. |
| **59** | `documentation-maintenance` | Engineering | All Agents | Continuous synchronization of ADRs, APIs, and execution ledgers. |

---

### 3. Progressive Loading & Execution Standard

In accordance with the Antigravity architecture:
- Skills are indexed dynamically by their name and description frontmatter.
- When an agent accepts a task (e.g. implementing the AI Orchestrator), it activates only the relevant skills (`llm-provider-abstraction`, `ai-fallback-and-retry`, `prompt-injection-defense`) into its active execution context, keeping token consumption focused and efficient.

