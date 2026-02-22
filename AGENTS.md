# AGENTS.md — Planogram Tool

Shelf placement simulator for Purplle (Indian beauty/cosmetics retailer) ops team.
React + TypeScript + Konva canvas + Tailwind CSS v4 + Vite.

## Commands

```bash
bun run dev            # Start dev server (Vite, default port 5173)
bun run build          # Type-check (tsc -b) then bundle (vite build)
bun run lint           # ESLint across the project
bun run test           # Vitest — all unit tests (vitest run --passWithNoTests)
bun run test:watch     # Vitest in watch mode

# Single test file
bunx vitest run src/engine/placementEngine.test.ts
bunx vitest run src/utils/unitConversion.test.ts

# E2E (Playwright — requires dev server running)
bunx playwright test tests/planogram.spec.ts
```

Build = `tsc -b && vite build`. Always run build after changes to verify.

## Architecture

```
src/
├── main.tsx                  # Entry point (StrictMode + createRoot)
├── App.tsx                   # Root layout: sidebar + header + gap bar + canvas
├── index.css                 # Global styles, Tailwind v4 import, CSS variables
├── types.ts                  # All shared types (Product, Shelf, RackConfig, etc.)
├── components/
│   ├── ProductCatalog.tsx    # Left sidebar — draggable product cards with search
│   ├── GapConfig.tsx         # Gap settings toolbar (edge margin, inter-product gap)
│   ├── RackCanvas.tsx        # Konva Stage/Layer — shelf rendering (DO NOT MODIFY lightly)
│   └── ProductImage.tsx      # Konva Image wrapper using useImage hook
├── engine/
│   └── placementEngine.ts    # Pure functions: fit checks, positioning, overlap validation
├── hooks/
│   └── useRackState.ts       # Rack state management (shelves, placements, config)
├── data/
│   ├── sampleProducts.ts     # 15 hardcoded beauty products
│   └── rackTemplates.ts      # 3 rack templates (small/standard/large)
└── utils/
    ├── constants.ts          # App-wide constants (margins, durations, thicknesses)
    └── unitConversion.ts     # cm ↔ px conversion (PIXELS_PER_CM = 5)
```

## Key Patterns

### TypeScript

- **Strict mode** enabled: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax: true` — use `import type { X }` for type-only imports
- Target: ES2022, module: ESNext, JSX: react-jsx
- Never use `as any`, `@ts-ignore`, or `@ts-expect-error`

### Imports

```typescript
// External deps first, then internal, then types
import { useState, useCallback } from 'react';
import type Konva from 'konva';
import { RackCanvas } from './components/RackCanvas';
import type { Product, RackConfig } from '../types';

// Type-only imports MUST use `import type` (enforced by verbatimModuleSyntax)
import type { Product } from '../types';    // correct
import { Product } from '../types';          // ERROR — Product is a type
```

### Components

- Named exports, not default (except `App.tsx` which uses `export default`)
- Function declarations: `export function ComponentName() {}`
- Props interface defined inline above the component
- All interactive elements need `data-testid` attributes for Playwright
- Hooks use `useCallback` for event handlers passed as props

### Styling

- **Tailwind CSS v4** — uses `@import "tailwindcss"` (NOT `@tailwind base/components/utilities`)
- PostCSS plugin: `@tailwindcss/postcss` (not the legacy `tailwindcss` plugin)
- Color palette: `stone-*` (warm grays), NOT `gray-*`
- Accent color: orange (`orange-500`, `orange-600`)
- Font: Inter with optical sizing, loaded via Google Fonts
- CSS custom properties defined in `:root` for shadows (`--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-sidebar`)
- Text sizes: `text-[11px]` for labels, `text-[13px]` for controls, `text-base` for headings
- Focus rings: `focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400`
- Borders: `border-stone-200` or `border-stone-200/60`

### State Management

- React useState/useCallback only — no external state library
- `useRackState` hook owns all shelf/placement/config state
- Immutable state updates via spread operators
- Placement engine is pure functions (no side effects, fully testable)

### Naming

- Files: PascalCase for components (`ProductCatalog.tsx`), camelCase for everything else (`placementEngine.ts`)
- Variables/functions: camelCase (`edgeMarginCm`, `getUsableShelfWidth`)
- Types/interfaces: PascalCase (`RackConfig`, `ShelfPlacement`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_EDGE_MARGIN_CM`, `PIXELS_PER_CM`)
- IDs: kebab-case strings (`'shelf-0'`, `'lipstick-01'`)
- Physical units always suffixed: `widthCm`, `shelfHeightCm`, `xPositionCm`

### Testing

- **Unit tests**: Vitest with jsdom, globals enabled (no need to import `describe/it/expect`)
- Test files colocated: `placementEngine.test.ts` next to `placementEngine.ts`
- Factory helpers: `makeRack()`, `makeShelf()`, `makeProduct()` for test data
- Tests import from vitest explicitly: `import { describe, it, expect } from 'vitest'`
- **E2E tests**: Playwright in `tests/` directory, uses `data-testid` selectors
- E2E navigates to `/` and tests against running dev server

### Error Handling

- Placement failures return `{ fits: false, reason: string }` — no exceptions
- `addPlacement` returns boolean success — caller handles UI feedback (red flash)
- Guard clauses with early returns (`if (!shelf) return false`)

## Sensitive Areas

- `RackCanvas.tsx` — Complex Konva geometry calculations (shelf positions, coordinate transforms). Changes here risk breaking visual layout. The geometry math maps cm → px with origin at top-left, shelves numbered bottom-up.
- `placementEngine.ts` — Core constraint logic. All functions are pure and thoroughly tested. Modify with test coverage.
- `ProductImage.tsx` — Thin Konva wrapper, rarely needs changes.

## Commit Style

Semantic prefixes in English: `fix:`, `feat:`, `chore:`, `refactor:`
Scopes used when relevant: `fix(rack-canvas):`, `chore(scaffold):`
