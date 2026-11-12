# Document 7: Cost Analysis, Infrastructure Projections & Scalability Blueprint

## Project: AI-Powered Google Business Profile Review Assistant & QR Management Platform

---

### 1. Architectural Scaling Model & Assumptions

The platform’s resource consumption is characterized by two distinct workloads:
1. **The Public QR Scan Funnel (High-Read, Low-Write):** Edge HTTP requests fetching static business metadata and pre-generated suggestions, followed by an asynchronous analytics beacon.
2. **AI Suggestion Generation (Periodic Batch & Event-Driven):** Discrete token-based API calls generated during initial business setup, periodic pool refreshment, or on-demand cache rotation.

#### 1.1 Key Technical Assumptions
- **Payload Sizes:**
  - Public Landing Page HTML/JS bundle: ~35 KB gzipped.
  - QR Code SVG / WebP Logo: ~25 KB.
  - Analytics Beacon: < 1 KB.
- **AI Token Metrics per Generation:**
  - Average Input Prompt: ~350 tokens (business profile, keywords, factual highlights, style constraints).
  - Average Output Review Suggestion: ~75 tokens (~50 words).
  - Total tokens per generated review: ~425 tokens.
- **Hybrid Suggestion Pool Strategy:**
  - Each business maintains a pre-generated pool of **10 distinct suggestions**.
  - On average, each suggestion is served ~10 times before scheduled rotation.
  - **Result:** Only 1 AI generation call is required for every 10 QR scans.

---

### 2. Current Verified Provider Pricing Benchmark (2025/2026 Reference)

*Note: All pricing figures reflect documented public rates and are explicitly labeled by tier.*

| Service Component | Provider & Tier | Current Verified Pricing Structure |
| :--- | :--- | :--- |
| **Primary AI Inference** | **Google Gemini 2.0 / 1.5 Flash** | **Free Tier:** 15 RPM, 1,500 Requests/Day (~45,000 req/mo) at $0.00.<br>**Paid Tier:** Input: $0.075 / 1M tokens; Output: $0.30 / 1M tokens. |
| **Secondary AI Inference** | **Groq Cloud (Llama 3.1 8B / 70B)** | **Free Developer Tier:** 30 RPM, 14,400 Requests/Day at $0.00.<br>**Paid Tier (8B):** Input: $0.05 / 1M tokens; Output: $0.08 / 1M tokens.<br>**Paid Tier (70B):** Input: $0.59 / 1M tokens; Output: $0.79 / 1M tokens. |
| **Database (Managed Postgres)** | **Neon Serverless / Supabase** | **Free Tier:** Up to 0.5 GB storage, 1 project.<br>**Pro Tier:** $19 – $25/month for 8 GB storage, 250k daily queries, pooled connections. |
| **Application Hosting & Edge** | **Vercel / Railway / Cloud Run** | **Vercel Pro:** $20/seat/month (1 TB bandwidth, edge middleware).<br>**Railway / VPS (Hetzner):** $5 – $15/month for containerized deployment. |
| **Object Storage & CDN** | **Cloudflare R2** | **Free Tier:** 10 GB storage, 1M Class A operations/month, **$0.00 egress bandwidth fees**.<br>**Paid:** $0.015 / GB-month. |
| **Redis / Rate Limiting** | **Upstash Redis** | **Free Tier:** 10,000 commands/day at $0.00.<br>**Pay-as-you-go:** $0.20 per 100k commands. |

---

### 3. Granular Cost Projections Across Four Operational Scenarios

#### Scenario A: Emerging Agency (10 Businesses, 1,000 Scans/Month)
- **Workload Profile:** 10 client profiles, ~100 initial pool generations, ~1,000 landing page hits/month (~33 scans/day).
- **AI Generation Volume:** ~200 generations/month (initial setup + 1 refresh cycle). Total tokens: 85,000 tokens.
- **Cost Breakdown:**
  - AI Inference (Gemini Flash Free Tier): **$0.00**
  - Application Hosting (Vercel Hobby / Railway Starter): **$0.00 – $5.00**
  - Database (Neon Free / Supabase Free): **$0.00**
  - Cloudflare R2 Storage (Logos & QR assets < 50 MB): **$0.00**
  - Rate Limiting (Upstash Free Tier): **$0.00**
- **Total Monthly Operational Cost: $0.00 – $5.00 / month.**

---

#### Scenario B: Growing Agency (100 Businesses, 10,000 Scans/Month)
- **Workload Profile:** 100 client profiles, ~1,000 active pool items, ~10,000 scans/month (~330 scans/day).
- **AI Generation Volume:** ~2,000 generations/month. Total tokens: ~850,000 tokens.
- **Cost Breakdown:**
  - AI Inference: Fully covered by Gemini 1,500 RPD free quota (~66 req/day). Over-quota cost if billed: $0.11 / month. **$0.00**
  - Application Hosting (Vercel Pro or Railway Team): **$20.00**
  - Database (Neon Serverless / Supabase Pro with connection pooler): **$19.00**
  - Storage (Cloudflare R2 - ~500 MB assets, zero egress): **$0.00**
  - Redis Rate Limiter (Upstash): **$0.00** (within free tier)
- **Total Monthly Operational Cost: $39.00 / month** (~$0.39 per client business).

---

#### Scenario C: Scaled Regional Agency (500 Businesses, 50,000 Scans/Month)
- **Workload Profile:** 500 client profiles, ~5,000 pool suggestions, ~50,000 scans/month (~1,650 scans/day).
- **AI Generation Volume:** ~10,000 generations/month. Total tokens: 4.25 Million tokens.
- **Cost Breakdown:**
  - AI Inference: Gemini Flash Paid (4.25M tokens @ blended $0.15/1M): **$0.64**
  - Hosting (Vercel Pro / Railway dedicated): **$20.00 – $35.00**
  - Database (Managed PostgreSQL with 10GB storage & read replicas): **$35.00**
  - Storage & CDN (Cloudflare R2 - ~3 GB assets): **$0.05**
  - Redis Rate Limiting (Upstash 1M commands): **$2.00**
- **Total Monthly Operational Cost: $57.69 – $72.69 / month** (~$0.13 per client business).

---

#### Scenario D: Enterprise Multi-Location Platform (1,000 Businesses, 100,000 Scans/Month)
- **Workload Profile:** 1,000 active businesses, ~10,000 pool suggestions, ~100,000 scans/month (~3,300 scans/day).
- **AI Generation Volume:** ~20,000 generations/month. Total tokens: 8.5 Million tokens.
- **Cost Breakdown:**
  - AI Inference: Gemini Flash Paid (8.5M tokens): **$1.28**
  - Hosting (High-concurrency container cluster on Railway / AWS ECS / Cloud Run): **$65.00**
  - Database (High-availability PostgreSQL with automated daily rollups): **$60.00**
  - Storage & CDN (Cloudflare R2, 10 GB assets): **$0.15**
  - Monitoring & Logging (Datadog / BetterStack): **$15.00**
  - Redis / Caching Layer: **$5.00**
- **Total Monthly Operational Cost: $146.43 / month** (~$0.15 per client business).

---

### 4. Generation Strategy Financial Comparison: Pure On-Demand vs. Hybrid Pool

The table below demonstrates why the **Hybrid Pre-Generated Pool Architecture** is economically superior to Pure Live On-Demand generation at 100,000 scans/month:

| Dimension | Pure On-Demand (Call AI on every scan) | Hybrid Suggestion Pool (1:10 reuse with smart rotation) | Efficiency Gain |
| :--- | :--- | :--- | :--- |
| **Monthly AI API Calls** | 100,000 calls | 10,000 calls | **90% reduction** |
| **Token Volume** | 42.5 Million tokens | 4.25 Million tokens | **90% reduction** |
| **Monthly AI API Cost** | ~$6.38 (Gemini) / $45.00 (OpenAI 4o-mini) | ~$0.64 (Gemini) / $4.50 (OpenAI) | **10x cost savings** |
| **Customer Landing Page Latency** | 450ms – 1,800ms (Customer waits for AI) | **< 40ms** (Served directly from PostgreSQL/Edge) | **95% faster TTI** |
| **Vulnerability to API Outages** | High (Page hangs if AI provider is down) | **Zero** (Always served from local cache) | **100% resilient** |

---

### 5. Architectural Scalability Bottlenecks & Hardening

1. **Database Connection Exhaustion:**
   - *Risk:* 1,000 concurrent QR scans during a peak shopping hour could overwhelm PostgreSQL connection limits (e.g. max 100 connections).
   - *Mitigation:* Deploy **Prisma Accelerate** or **PgBouncer** connection pooler in transaction mode, supporting up to 10,000 concurrent edge connections with minimal memory overhead.
2. **Edge Cache Strategy for Public Funnels:**
   - Public business metadata and suggestion payloads are cached on the CDN edge using `stale-while-revalidate` headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`).
   - Database is queried only once every 60 seconds per business slug regardless of scan volume spikes.
3. **Analytics Ingestion Offloading:**
   - High-throughput analytics beacons (`POST /api/analytics/track`) are batched in memory or pushed to a Redis stream before bulk insertion into PostgreSQL, avoiding individual database write locks per scan.

