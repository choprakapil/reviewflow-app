# API Engineering Standard & HTTP Specification

## Document Ref: `docs/ENGINEERING_SYSTEM/API_ENGINEERING_STANDARD.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE & BINDING  

---

### 1. Architectural Principles

All API endpoints follow RESTful conventions, adhere to strict request/response schemas validated with Zod, and return uniform JSON envelopes.

```
Client / Mobile Browser
       |
       |  HTTPS Request (JSON / URLSearchParams)
       v
Next.js Route Handler (`/app/api/...`)
       |
       +--> 1. Authentication Check (NextAuth Session / Public Beacon)
       |
       +--> 2. Rate Limit Verification (Upstash Redis Token Bucket)
       |
       +--> 3. Zod Payload Validation (`lib/validations/...`)
       |
       +--> 4. Service Layer Execution (`services/...`)
       |         |
       |         +--> Prisma ORM / PostgreSQL Transaction
       |         +--> AI Cascade / Fallback
       |         +--> QR Matrix / Storage CDN
       |
       +--> 5. Standard Envelope Response Formatting (`lib/api-response.ts`)
       |
       v
Uniform JSON Response (200 / 201 / 4xx / 5xx)
```

---

### 2. Standardized Response Envelopes

Every API route returns one of two standardized payload structures:

#### 2.1 Success Response (`ApiResponse<T>`)
```typescript
{
  "success": true,
  "data": T,
  "meta": {
    "timestamp": "2026-11-12T12:00:00.000Z",
    "requestId": "req_01j7xyz..."
  }
}
```

#### 2.2 Error Response (`ApiErrorResponse`)
```typescript
{
  "success": false,
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "The requested business profile does not exist.",
    "details": null,
    "requestId": "req_01j7xyz..."
  }
}
```

---

### 3. Standard HTTP Status Codes & Error Codes

| HTTP Status | Semantics | Standard Error Code | Example Trigger |
| :--- | :--- | :--- | :--- |
| **200 OK** | Request succeeded. | N/A | Successful GET or PATCH update. |
| **201 Created** | Entity created. | N/A | Successful business or QR asset creation. |
| **204 No Content** | Succeeded with no body. | N/A | Analytics beacon ingestion. |
| **400 Bad Request** | Malformed syntax / bad JSON. | `BAD_REQUEST` | Invalid JSON syntax in request body. |
| **401 Unauthorized** | Missing or invalid auth session.| `UNAUTHORIZED` | Expired JWT or missing cookie on admin route. |
| **403 Forbidden** | Valid auth, but lacks tenant rights.| `FORBIDDEN` | Admin attempting to access another agency's client. |
| **404 Not Found** | Resource does not exist. | `NOT_FOUND` | Invalid business ID or unrecognized QR slug. |
| **409 Conflict** | Unique constraint collision. | `SLUG_CONFLICT` | Attempting to register an already claimed slug. |
| **422 Unprocessable**| Zod validation schema failed. | `VALIDATION_FAILED` | Google URL is not a valid Google Maps domain. |
| **429 Too Many Req** | Rate limit threshold exceeded. | `RATE_LIMITED` | More than 30 QR scans/min from a single IP. |
| **500 Server Error** | Unhandled internal exception. | `INTERNAL_ERROR` | Database connection lost or unexpected failure. |
| **503 Unavailable** | Upstream third-party failure. | `AI_SERVICE_UNAVAILABLE` | All AI providers down & fallback failure. |

---

### 4. Comprehensive Endpoint Inventory

#### 4.1 Authentication Endpoints (`/api/auth/*`)
- `POST /api/auth/[...nextauth]` — NextAuth credentials provider, session generation, and sign-out.

#### 4.2 Administrative Business Management (`/api/admin/businesses/*`)
- `POST /api/admin/businesses` — Create business, AI config, and default QR record.
- `GET /api/admin/businesses` — List businesses with search, category, and status filters.
- `GET /api/admin/businesses/:id` — Full business details with AI settings and QR assets.
- `PATCH /api/admin/businesses/:id` — Update business profile details, keywords, and services.
- `POST /api/admin/businesses/:id/archive` — Soft-delete (set status to ARCHIVED).
- `POST /api/admin/businesses/:id/restore` — Restore archived business to ACTIVE.
- `DELETE /api/admin/businesses/:id` — Cascading permanent deletion (requires typing exact name).
- `POST /api/admin/businesses/:id/verify-google-url` — Validate Google review link and extract Place ID.

#### 4.3 AI Tuning & Suggestion Pool (`/api/admin/businesses/:id/ai/*`)
- `PUT /api/admin/businesses/:id/ai-config` — Update length, tone, custom instructions, and temperature.
- `GET /api/admin/businesses/:id/suggestions` — View active suggestion pool.
- `POST /api/admin/businesses/:id/suggestions/replenish` — Manually trigger background pool replenishment.

#### 4.4 QR Code Studio & Print Export (`/api/admin/businesses/:id/qr/*`)
- `POST /api/admin/businesses/:id/generate-qr` — Re-render vector SVG and 2048x2048 PNG with custom colors/logo.
- `GET /api/admin/businesses/:id/export-pdf` — Stream 300 DPI print-ready Table Tent PDF (`@react-pdf`).

#### 4.5 Analytics & Telemetry (`/api/analytics/*`)
- `POST /api/analytics/track` — High-throughput non-blocking beacon for QR scans, copies, and redirects.
- `GET /api/admin/analytics/overview` — Portfolio KPI aggregates and funnel drop-off metrics.
- `GET /api/admin/analytics/business/:id` — Granular business scan metrics, devices, and service trends.

#### 4.6 System & Health (`/api/health`)
- `GET /api/health` — Returns status of PostgreSQL connection, Redis rate limiter, and AI provider pings.

