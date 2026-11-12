# AGENTS.md — Global Engineering Rules & Architectural Directives

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform
**Status:** PERMANENT & MANDATORY FOR ALL AGENTS  

---

### 1. Fundamental Engineering Directives

1. **TypeScript Strictness:** Strict mode is mandatory (`strict: true` in `tsconfig.json`). Never use the `any` type without documented architectural justification. Never ignore compiler warnings.
2. **Zero Code Suppression:** Never suppress linting, type-checking, or tests using `@ts-ignore`, `eslint-disable`, or commented-out assertions. Address the root cause.
3. **No Unfinished Stubs:** Never leave empty functions, placeholder comments (`// TODO: implement later`), or non-functional mock UI in completed tasks.
4. **Separation of Concerns:**
   - **Route Handlers / Actions (`/app/api/...`, `actions/...`):** Handle HTTP, request validation with Zod, and authentication.
   - **Services (`/services/...`):** Contain pure business logic and orchestrate domain workflows. Independent of HTTP request objects.
   - **Data Access (`/lib/prisma.ts`, queries):** Handle PostgreSQL interactions and Prisma queries with explicit transaction safety.
5. **Multi-Tenant Scoping:** Every database query touching client data must explicitly filter by the authenticated user's tenant ID (`WHERE userId = session.userId`).

---

### 2. Standardized Directory Conventions

```
Review App/
├── .agents/                    # Antigravity agent & skill definitions
│   ├── rules/                  # Modular domain engineering rules
│   └── skills/                 # Reusable 59-skill procedure library
├── app/                        # Next.js 15+ App Router
│   ├── (admin)/                # Authenticated administrative portal routes
│   │   ├── dashboard/          # Agency KPI overview
│   │   ├── businesses/         # Business CRUD and AI tuning
│   │   ├── qr-studio/          # Dynamic QR preview, branding, and PDF exports
│   │   ├── analytics/          # Conversion funnels and scan heatmaps
│   │   └── settings/           # AI keys, default models, and system health
│   ├── r/[slug]/               # Public customer-facing QR landing page (Ultra-fast SSR)
│   ├── api/                    # REST Route Handlers
│   │   ├── admin/              # Protected admin API routes
│   │   ├── analytics/track/    # Public high-throughput tracking beacon
│   │   └── health/             # System health check endpoint
│   ├── layout.tsx              # Root HTML wrapper
│   └── globals.css             # Tailwind design tokens & base layers
├── components/                 # Reusable UI component inventory
│   ├── ui/                     # shadcn/ui unstyled Radix primitives (button, dialog, input)
│   ├── admin/                  # Administrative forms, tables, metric cards
│   ├── public/                 # Customer landing card, sticky CTA, fallback modal
│   └── qr/                     # Canvas and SVG QR code previewers
├── services/                   # Pure business logic layer
│   ├── business.service.ts     # Business lifecycle, validation, and archival
│   ├── ai/                     # Unified AI provider abstraction & cascade
│   │   ├── ai-orchestrator.ts  # Fallback cascade (Gemini -> Groq -> Deterministic)
│   │   ├── providers/          # Gemini, Groq, and Deterministic adapters
│   │   └── prompt-builder.ts   # XML-armored prompt construction
│   ├── suggestion-pool.service.ts # Hybrid 10-item pre-generated review pool
│   ├── qr/                     # QR SVG, PNG, and PDF Table Tent engines
│   └── analytics.service.ts    # Funnel aggregation & Geo-IP telemetry
├── lib/                        # Shared singletons, utilities, and configurations
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth.js v5 credentials configuration
│   ├── validations/            # Zod schemas shared between client and server
│   ├── utils/                  # Formatting, Google URL verification, clipboard helpers
│   └── rate-limit.ts           # Upstash Redis token-bucket rate limiter
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Relational models and indexes
│   └── seed.ts                 # Super admin and demo data seed script
├── docs/                       # Project documentation and engineering blueprints
│   └── ENGINEERING_SYSTEM/     # Engineering standards, ledgers, and quality gates
└── tests/                      # Automated test suites (unit, integration, e2e)
```

---

### 3. API Contract & Response Standard

Every endpoint must return a uniform JSON envelope:
```typescript
// Successful Response Envelope
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-12T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}

// Error Response Envelope
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable explanation of error.",
    "details": [ ... ],
    "requestId": "req_abc123"
  }
}
```

---

### 4. Security & Compliance Invariants

1. **Anti-Gating Policy:** Never implement sentiment pre-screening. Every QR scan provides unrestricted access to the business's Google review URL.
2. **Open Redirect Defense:** Validate all Google URLs using strict domain whitelisting (`google.com`, `g.page`, `goo.gl`).
3. **Prompt Injection Armor:** Wrap all user-entered metadata inside `<business_context>` XML delimiters with explicit instructions to ignore instructions contained within data tags.
4. **Zero Consumer PII:** Never store customer names, emails, phone numbers, or unhashed IP addresses. IP addresses must be hashed with a daily rotating salt before saving.
5. **No Secret Leakage:** Never expose `GEMINI_API_KEY`, `GROQ_API_KEY`, or `DATABASE_URL` in client bundles. All external API calls occur strictly on the server.

