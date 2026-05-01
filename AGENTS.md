<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Suggest App Rules

## Product Context

suggest-app is a dark-cinema movie recommendation app. The core promise is helping a signed-in user decide tonight's movie quickly from mood, watch context, runtime, MBTI, and their evolving taste profile.

## Mandatory References

- Read `docs/APP_DESIGN_SPEC.md` before changing product behavior, routes, data flow, recommendation logic, or onboarding.
- Read `docs/DESIGN_SYSTEM.md` before changing UI, copy density, colors, spacing, cards, buttons, or interaction patterns.
- Use `.cursor/skills/suggest-app-consistency/SKILL.md` for broad cleanup, i18n, design consistency, and cross-screen polish.
- Use `.cursor/skills/swipe-target-onboarding/SKILL.md` when changing swipe card UX.

## Internationalization Rules

- Supported locales are `ja`, `en`, and `ko`; `ja` is the default locale.
- User-facing UI text must come from `src/i18n/messages/{ja,en,ko}.json` through `next-intl`.
- Do not add Japanese-only strings to React components, route pages, buttons, placeholders, aria labels, empty states, toasts, or loading states.
- Keep message keys aligned across all three locale files in the same shape.
- Domain IDs such as mood tags, genres, watch contexts, reactions, and route params stay in English snake_case; only labels are translated.
- Movie titles may use the title-language preference, but surrounding UI must use the active app locale.

## UI Consistency Rules

- Preserve the Dark Cinema tone: poster-first, low-noise, restrained gold accent, and short recommendation reasons.
- Reuse existing shared components before inventing new surfaces: `ScreenHeader`, `PopCard`, `PopButton`, `ReactionPill`, `ReasonBadge`, and person/movie components.
- Avoid nested cards and marketing-style sections inside logged-in product screens.
- Keep recommendation reasons short, tag-like, and limited to three visible reasons.

## Data And API Rules

- Auth-required route handlers should use `requireUser()` unless the local file already has a deliberate pattern.
- Shared taxonomy values belong in `src/lib/constants/taxonomy.ts`.
- Validation belongs in `src/lib/validation/schemas.ts`; avoid duplicating ad hoc request parsing in routes.
- Prisma schema changes require a migration and a generated client check.

## Verification

- For broad UI/i18n changes, run `npm run lint`.
- Run `npm run build` when changing route boundaries, server/client component boundaries, Prisma types, or Next.js APIs.
- Run `npm test` when changing recommendation scoring, retrieval, ranking, or taste profile logic.
