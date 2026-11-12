# Agent Coordination Protocol & Handoff Specifications

## Document Ref: `docs/ENGINEERING_SYSTEM/AGENT_COORDINATION_PROTOCOL.md`
**Project:** AI-Powered Google Business Profile Review Assistant & QR Management Platform  
**System:** Antigravity AI Engineering Operating System  
**Status:** ACTIVE & BINDING  

---

### 1. Sequential & Parallel Workflow Orchestration

To eliminate race conditions, merge conflicts, and architectural drift, work is handed off between specialized agents according to strict dependency protocols.

```mermaid
sequenceDiagram
    autonumber
    actor Orch as Chief Orchestrator
    participant PM as Agent 01: Product Mgr
    participant Arch as Agent 02: Architect
    participant DB as Agent 06: Database Specialist
    participant Back as Agent 05: Backend Specialist
    participant Front as Agent 04: Frontend Specialist
    participant QA as Agent 10: QA Specialist
    participant Sec as Agent 09: Security Specialist

    Orch->>PM: 1. Request task acceptance criteria
    PM-->>Orch: Returns Given-When-Then criteria
    Orch->>Arch: 2. Request module boundary & schema contract
    Arch-->>Orch: Returns interface & Zod schemas
    par Database and Backend
        Orch->>DB: 3A. Implement Prisma schema & migrations
        DB-->>Orch: Schema migrated & verified
    and API Handlers
        Orch->>Back: 3B. Implement Service & Route Handlers
        Back-->>Orch: Endpoints active & tested
    end
    Orch->>Front: 4. Implement UI components & state hooks
    Front-->>Orch: Components built & integrated
    Orch->>Sec: 5. Conduct security & tenant isolation audit
    Sec-->>Orch: Security review signed off
    Orch->>QA: 6. Execute full automated test suite
    QA-->>Orch: Test results & coverage evidence
    Orch->>Orch: 7. Verify Definition of Done & advance ledger
```

---

### 2. Standard Handoff Artifact Contract

Whenever an agent completes a slice of work and passes it to the next agent, it must produce a structured handoff note containing:

```markdown
### AGENT HANDOFF NOTICE
- **From Agent:** [e.g. Agent 06: Database Specialist]
- **To Agent:** [e.g. Agent 05: Backend & API Specialist]
- **Task ID:** [e.g. TASK-03-01: Prisma Schema Migration]
- **Modified / Created Files:**
  - `prisma/schema.prisma`
  - `prisma/migrations/20261112_init/migration.sql`
- **Interfaces / Contracts Provided:**
  - `export type BusinessWithConfig = Prisma.BusinessGetPayload<{ include: { aiConfig: true } }>`
- **Quality Gate Evidence:**
  - `prisma validate` -> Succeeded
  - `prisma db seed` -> Seeded 1 admin user, 1 demo business
- **Known Constraints / Next Steps:**
  - Backend service must query `Business` using composite index `(userId, status)`.
```

---

### 3. Conflict Resolution & File Ownership Rules

1. **Prisma Schema Ownership:** Exclusively owned by **Agent 06 (Database Specialist)**. No frontend or backend agent may edit `prisma/schema.prisma` directly.
2. **AI Provider Interfaces:** Exclusively owned by **Agent 07 (AI/LLM Specialist)**.
3. **Public Landing Page Route (`/app/r/[slug]`):** Exclusively owned by **Agent 04 (Frontend Specialist)** under the architectural guidance of **Agent 12 (Performance)** and **Agent 03 (UI/UX)**.
4. **Independent Peer Review Requirement:** High-risk changes (authentication logic, rate limiting, and URL redirection handlers) must be independently reviewed by **Agent 09 (Security)** before being marked complete.

