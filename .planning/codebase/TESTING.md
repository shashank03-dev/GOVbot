# Testing Patterns

**Analysis Date:** 2025-02-14

## Test Framework

**Runner:**
- **Not detected.** No testing framework (e.g., `pytest`, `jest`, `vitest`) is configured in the current codebase.

**Assertion Library:**
- **Not detected.**

**Run Commands:**
```bash
# No test commands found in frontend/package.json or root Makefile
```

## Test File Organization

**Location:**
- No test files were found in the current project structure.

**Naming:**
- Not applicable.

**Structure:**
- Not applicable.

## Test Structure

**Suite Organization:**
- Not applicable.

**Patterns:**
- No testing patterns currently implemented.

## Mocking

**Framework:** Not applicable.

**Patterns:**
- No mocking patterns currently implemented.

**What to Mock:**
- [Recommended] External APIs: WhatsApp Business API, Supabase, Google Gemini.
- [Recommended] Scraping: The PM-Kisan portal responses in `gov_agent/pm_kisan_agent.py`.

**What NOT to Mock:**
- [Recommended] Pydantic models and internal data transformations.

## Fixtures and Factories

**Test Data:**
- No test fixtures detected.

**Location:**
- Not applicable.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
- Not applicable.

## Test Types

**Unit Tests:**
- None detected.

**Integration Tests:**
- None detected.

**E2E Tests:**
- While `playwright` is present in `requirements.txt`, it is currently utilized for data scraping (`gov_agent/pm_kisan_agent.py`) rather than end-to-end testing.

## Common Patterns

**Async Testing:**
- Not applicable.

**Error Testing:**
- Not applicable.

---

*Testing analysis: 2025-02-14*
