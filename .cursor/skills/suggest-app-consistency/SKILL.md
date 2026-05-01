---
name: suggest-app-consistency
description: Use when cleaning up suggest-app for i18n, UI consistency, route copy, Dark Cinema design alignment, shared taxonomy usage, or rules-driven refactors across Next.js screens.
---

# Suggest App Consistency

## Purpose

Use this skill for cleanup work that makes suggest-app feel like one coherent product across Japanese, English, and Korean.

## First Reads

1. `AGENTS.md`
2. `docs/APP_DESIGN_SPEC.md`
3. `docs/DESIGN_SYSTEM.md`
4. Relevant files under `src/i18n/messages/`

## Cleanup Checklist

- Keep supported locales aligned: `ja`, `en`, `ko`.
- Move user-facing text into `src/i18n/messages/{locale}.json`.
- Update all three message files in the same shape.
- Use `useTranslations()` in client components and `getTranslations()` in server components.
- Do not translate persisted enum values, route params, Prisma IDs, taxonomy IDs, or API payload fields.
- Prefer existing shared UI primitives before adding new component patterns.
- Keep copy short, product-like, and consistent with the Dark Cinema tone.
- Replace hardcoded loading, empty, error, button, aria-label, and placeholder text before deeper refactors.

## Common Targets

- Logged-in routes under `src/app/[locale]/`
- Shared product components under `src/components/`
- Recommendation UI under `src/app/[locale]/recommend/`
- Library and mypage components under `src/components/library/` and `src/components/mypage/`

## Verification

Run in this order when relevant:

```bash
npm run lint
npm run build
npm test
```

Use `npm test` for recommendation, retrieval, ranking, taste-profile, or scoring changes.
