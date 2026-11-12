# Automated Quality Gates & Verification Standards

## Document Ref: `docs/ENGINEERING_SYSTEM/QUALITY_GATES.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE & BINDING  

---

### 1. Quality Gate Philosophy

No task, component, or phase may be marked as complete in the Master Checklist without passing all relevant automated checks. Code compilation alone does NOT constitute completion.

```
Code Changes Completed
         |
         v
+-------------------------------+
| GATE 1: Static Type Check     | --> `tsc --noEmit` (Zero errors allowed)
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 2: Linter & Formatting   | --> `eslint` & `prettier --check` (Zero warnings/errors)
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 3: Unit & Schema Tests   | --> `vitest run` (100% pass on Zod & utils)
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 4: Integration & DB Test | --> Service layer tests against test DB
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 5: Mobile & E2E Browser  | --> Playwright tests for customer landing flow
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 6: Security & Isolation  | --> Multi-tenant check & URL regex audit
+---------------+---------------+
                | PASS
                v
+-------------------------------+
| GATE 7: Production Build Check| --> `next build` (Clean standalone bundle)
+---------------+---------------+
                | PASS
                v
Task Verified & Advanced on Ledger
```

---

### 2. Specific Quality Thresholds by Domain

| Domain | Minimum Threshold | Enforcement Command / Mechanism |
| :--- | :--- | :--- |
| **Type Safety** | 100% clean type compilation | `npx tsc --noEmit` |
| **Linting** | Zero errors, zero warnings | `npx eslint .` |
| **Schema Validation** | 100% pass on valid/invalid inputs | `npm run test:schemas` |
| **AI Provider Fallback** | 100% pass on Gemini timeout -> Groq -> Local | `npm run test:ai` |
| **Public Landing LCP** | < 1.0 second on throttled 4G | Lighthouse CI audit |
| **Public Landing CLS** | 0.00 (Zero layout shift) | Lighthouse CI audit |
| **Touch Target Size** | ≥ 48x48px (56px for primary CTA) | Playwright element layout assertions |
| **Multi-Tenant Isolation** | 100% rejection on cross-tenant ID queries | Vitest tenant authorization test suite |
| **Build Integrity** | Standalone production build succeeds | `npm run build` |

---

### 3. Blocking vs. Non-Blocking Failures

- **BLOCKING:** Type errors, failed unit/integration tests, tenant isolation leaks, broken production builds, or missing error boundaries. **Execution halts; the orchestrator assigns Agent 11 (Debugging) to fix before advancing.**
- **NON-BLOCKING (Logged in Technical Debt Register):** Non-critical CSS polish in administrative views, optional chart animations, or minor documentation typos.

