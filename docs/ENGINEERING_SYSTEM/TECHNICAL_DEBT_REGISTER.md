# Technical Debt Register & Remediation Tracker

## Document Ref: `docs/ENGINEERING_SYSTEM/TECHNICAL_DEBT_REGISTER.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE REGISTER  

---

### 1. Register Overview

This register tracks deferred optimizations, minor non-blocking architectural compromises, and future scalability items identified during development. Every entry contains impact evaluation and target resolution milestone.

```
+-----------------------------------------------------------------------------------+
|                        ACTIVE TECHNICAL DEBT LOG                                  |
+-----------------------------------------------------------------------------------+
| ID     | Module        | Description                  | Impact | Target Phase     |
+--------+---------------+------------------------------+--------+------------------+
| TD-001 | Storage       | Local mock file storage for  | Low    | Phase 14         |
|        |               | logos during early dev       |        | (Prod Deploy)    |
| TD-002 | Analytics     | Direct DB inserts vs Redis   | Low    | Phase 12         |
|        |               | batch buffer for scan events |        | (Hardening)      |
| TD-003 | White-Label   | Custom CNAME routing for     | Low    | Post-v1.0        |
|        |               | agency subdomains            |        |                  |
+-----------------------------------------------------------------------------------+
```

---

### 2. Debt Entry Details

#### TD-001: Local File Storage Mock during Phase 1–8
- **Identified During:** Phase 0 Architecture Planning.
- **Description:** Cloudflare R2 / S3 requires external cloud credentials. During early local development, logos and generated QR SVGs will be stored locally in `public/uploads/` with identical S3-compatible interfaces.
- **Remediation Plan:** Switch storage provider adapter to Cloudflare R2 in Phase 14 using environment variables.

#### TD-002: Analytics Event Direct Inserts vs Stream Buffering
- **Identified During:** Phase 3 Database Design.
- **Description:** For initial deployment (< 10,000 scans/month), direct asynchronous inserts into PostgreSQL `AnalyticsEvent` are performant. For > 100,000 scans/month, buffering via Redis Stream or Upstash is recommended.
- **Remediation Plan:** Monitor database write latency in Phase 12. If insert duration exceeds 15ms, introduce Redis stream batching.

