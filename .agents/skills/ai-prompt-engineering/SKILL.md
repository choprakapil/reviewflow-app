---
name: ai-prompt-engineering
description: >-
  Constructs dynamic prompts tailoring review length, style, language, and specific service highlights.
---

# Skill: ai-prompt-engineering

## 1. Purpose & Domain Scope
**Owning Agent:** Agent 07 (AI)  
**Engineering Domain:** AI / LLM  
**Core Objective:** Constructs dynamic prompts tailoring review length, style, language, and specific service highlights.

---

## 2. When to Use This Skill
Activate this skill whenever:
- The task requires engineering execution within the **AI / LLM** domain.
- Designing, implementing, modifying, or reviewing `ai-prompt-engineering` components, contracts, or tests.
- Auditing code compliance against `ai-prompt-engineering` architectural standards.

---

## 3. Required Inputs & Context
1. Specific task requirements and acceptance criteria from `PROJECT_COMPLETE_IMPLEMENTATION_CHECKLIST.md`.
2. Relevant architectural specifications from `docs/PROJECT_TECHNICAL_ARCHITECTURE.md` and `docs/ENGINEERING_SYSTEM/`.
3. Existing schema models, types, and utility helpers.

---

## 4. Step-by-Step Engineering Procedure
1. **Analyze Context & Requirements:** Review inputs, invariants, and edge cases.
2. **Design Interface & Type Contracts:** Define strict TypeScript interfaces and Zod schemas.
3. **Implement Module Logic:** Write clean, modular, self-documenting implementation code.
4. **Enforce Error Handling & Fallbacks:** Account for unexpected inputs, network timeouts, and downstream failures.
5. **Apply Security & Safety Controls:** Verify multi-tenant isolation, input sanitization, and compliance guardrails.
6. **Execute Automated Verification:** Run unit/integration tests and verify quality gates.

---

## 5. Engineering Standards & Best Practices
- **Strict Typing:** Never use `any`. Use strongly typed models and runtime Zod validation.
- **Fail-Safe Operation:** Design for resilience; downstream consumers must never encounter an unhandled crash.
- **Minimal Complexity:** Write the simplest maintainable code that satisfies all requirements.

---

## 6. Recommended Patterns & Anti-Patterns
- **RECOMMENDED:** Pure functions, explicit dependency injection, structured logging, defensive validation.
- **ANTI-PATTERN:** Hardcoded secrets, unhandled promise rejections, swallowed error catch blocks, arbitrary timeouts.

---

## 7. Security & Compliance Considerations
- Treat all external input as untrusted.
- Ensure strict adherence to Google Review Policies (no gating, no incentives, full user editing agency).
- Protect API keys and prevent cross-tenant data leaks.

---

## 8. Verification Checklist & Definition of Done
- [ ] TypeScript compiles with zero errors (`tsc --noEmit`).
- [ ] Unit/integration tests pass cleanly.
- [ ] Error conditions and edge cases are explicitly handled.
- [ ] Code adheres strictly to `AGENTS.md` and `docs/ENGINEERING_SYSTEM/ENGINEERING_RULES.md`.
- [ ] Acceptance criteria satisfied and documented in the execution ledger.
