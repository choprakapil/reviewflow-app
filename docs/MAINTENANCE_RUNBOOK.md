# ReviewFlow — Developer Maintenance & Troubleshooting Runbook

**Document Ref:** `docs/MAINTENANCE_RUNBOOK.md`  
**Target Audience:** DevOps Engineers, Platform Reliability Architects, Lead Developers  
**Version:** 1.0 (Production-Ready)  

---

## 1. System Architecture Overview

ReviewFlow operates as a monolithic Next.js 15+ App Router application with:
- **Application Engine:** Node.js 22 LTS / Next.js 15.5.29 Server Components & Route Handlers
- **Database Engine:** PostgreSQL 16 managed via Prisma ORM v5.22
- **Primary AI Provider:** Google Gemini 2.0 Flash (`@google/genai` REST)
- **Secondary AI Provider:** Groq Cloud LPU (`llama-3.1-70b-versatile` REST)
- **Emergency Fallback Engine:** Deterministic Algorithmic Template Generator (0ms, 100% offline uptime)
- **Session Security:** NextAuth.js credentials provider with bcrypt salted hashing and JWT tokens
- **Rate Limiting:** Token bucket with edge proxy header sanitization + optional Upstash Redis cloud cache

---

## 2. Health Monitoring & Diagnostics

### Standard Health Endpoint
The platform exposes a standardized JSON health check endpoint:
```bash
# Query application health
curl -s http://localhost:3000/api/health | jq .
```

**Expected Healthy Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-12T14:00:00.000Z",
  "database": "connected",
  "providers": {
    "gemini": "configured",
    "groq": "configured",
    "deterministic": "active"
  }
}
```

---

## 3. Database Backup & Disaster Recovery

### Creating a Snapshot Backup
```bash
# Export compressed PostgreSQL database backup
pg_dump -h $PGHOST -U $PGUSER -d review_assistant -F c -b -v -f "backup-reviewflow-$(date +%Y%m%d_%H%M%S).dump"
```

### Restoring from Backup
```bash
# 1. Terminate existing connections (if applicable)
psql -h $PGHOST -U $PGUSER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'review_assistant';"

# 2. Restore database schema and data
pg_restore -h $PGHOST -U $PGUSER -d review_assistant -v -c "backup-reviewflow-20261112_140000.dump"

# 3. Synchronize Prisma client
npx prisma generate
```

---

## 4. AI Provider Failover Testing & Verification

ReviewFlow features an automated 3-tier cascade (`Gemini` -> `Groq` -> `Deterministic`).

### CLI Verification Command
Run the specialized Vitest AI failover regression suite:
```bash
npm test -- tests/unit/ai-failover.test.ts tests/unit/ai-audit.test.ts
```

### Manual Trigger via Settings Test Bench
1. Authenticate to `/admin/settings`.
2. Scroll to the **AI Provider API Vault** section.
3. Click **"Run AI Test Bench"**.
4. ReviewFlow will execute a live generation cycle and report:
   - `providerUsed`: Name of the provider that succeeded.
   - `latencyMs`: Round-trip execution latency in milliseconds.
   - `sampleReviewText`: Generated review assistance draft.

---

## 5. Security & Rate Limiting Maintenance

### In-Memory Cache Reset
The in-memory token bucket rate limiter automatically sweeps expired timestamps every 60 seconds and enforces a hard ceiling of 10,000 entries.

To force a memory purge in long-running processes:
```bash
# Graceful restart of the Node.js production service
pm2 reload reviewflow
# Or in Docker:
docker restart reviewflow-app
```

### Upstash Redis Rate Limiting Diagnostic
If `UPSTASH_REDIS_REST_URL` is configured, test connectivity via curl:
```bash
curl -s -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  "$UPSTASH_REDIS_REST_URL/get/rl:track:test_ip"
```

---

## 6. Secret Rotation Procedure

### Rotating `NEXTAUTH_SECRET`
1. Generate a new high-entropy 32-byte hex secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update the environment variable `NEXTAUTH_SECRET` in your hosting platform.
3. Deploy / restart the application.
4. *Impact:* Active administrator sessions will be invalidated; users must re-authenticate.

### Rotating `ADMIN_BOOTSTRAP_PASSWORD`
1. Generate a new administrator password.
2. Update `ADMIN_BOOTSTRAP_PASSWORD` in your secret store.
3. Re-run `npx tsx prisma/seed.ts` or update the admin's password securely via `/api/admin/profile/password`.

