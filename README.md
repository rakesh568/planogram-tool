# Planogram Tool

A shelf placement simulator for Purplle's ops team. The tool lets ops staff drag beauty products from a catalog onto promotional rack shelves, enforces dimensional constraints, shows remaining space per shelf, and exports the final arrangement as a PNG to share with retail stores.

## Problem Statement

Purplle runs promotional racks across partner retail stores. Each rack has a fixed number of shelves with known dimensions. The ops team needs to plan which products go on which shelf before physically setting up the display.

Today this is done ad-hoc — the team eyeballs it or sketches on paper. This leads to:

- **Wasted shelf space** — products are placed without knowing if they'll actually fit
- **Inconsistent displays** — different stores get different arrangements with no visual reference
- **Repeated trial-and-error** — field teams rearrange products on-site because the plan didn't account for dimensions
- **No shareable reference** — store staff have no image to follow when restocking

The Planogram Tool solves this by providing a drag-and-drop UI where the ops team can simulate the physical arrangement on screen, with the system enforcing real dimensional constraints (width fit, height fit, edge margins, inter-product gaps). The final arrangement is exported as a PNG that stores can print and follow.

### Key Constraints the Tool Enforces

- **Width fit**: A product can only be placed if its width fits within the remaining usable shelf space
- **Height fit**: A product's height must not exceed the shelf height
- **Edge margins**: Configurable dead zones on both ends of each shelf (default: 2cm)
- **Inter-product gaps**: Configurable minimum spacing between products (default: 2cm)
- **Single layer**: One row of products per shelf, no stacking
- **Upright only**: Products are always placed standing upright, no rotation

## What's Built (MVP)

### Core Features

| Feature | Description |
|---------|-------------|
| **Product Catalog Sidebar** | Searchable list of 15 sample beauty products with dimensions. Drag any product onto the rack. |
| **Rack Canvas** | Konva.js canvas rendering the rack with shelf lines, edge margin indicators (orange tint), and placed products. |
| **Drag-and-Drop Placement** | Drag from the catalog sidebar, drop onto a shelf. Product snaps to the next available position. |
| **Constraint Enforcement** | Rejects placement if the product doesn't fit (width or height). Shelf flashes red on rejection. |
| **Remaining Space Indicator** | Each shelf shows "X.X cm free" in green (or red when full). |
| **Rack Template Selector** | Dropdown to switch between 3 preset rack configurations (Small / Standard / Large Promo Rack). |
| **Gap Configuration** | Inline controls to adjust edge margins and inter-product gap (in cm). Reset to defaults button. |
| **Product Removal** | Click the "x" on any placed product to remove it from the shelf. |
| **PNG Export** | One-click export of the canvas as a high-res PNG (2x pixel ratio) for sharing with stores. |

### Rack Templates

| Template | Width | Height | Shelves | Shelf Height | Edge Margin | Product Gap |
|----------|-------|--------|---------|--------------|-------------|-------------|
| Small Promo Rack | 90cm | 150cm | 4 | 37.5cm | 2cm | 1.5cm |
| Standard Promo Rack | 120cm | 180cm | 5 | 36cm | 2cm | 2cm |
| Large Promo Rack | 150cm | 200cm | 5 | 40cm | 3cm | 2.5cm |

### Sample Products

15 beauty products with realistic dimensions: Lipstick (3x8cm), Foundation Bottle (5x15cm), Serum Bottle (4x12cm), Mascara (2x10cm), Compact Powder (8x8cm), Shampoo Bottle (7x22cm), Face Wash Tube (5x16cm), Nail Polish (3x7cm), Perfume Bottle (6x14cm), Hair Oil Bottle (6x18cm), Moisturizer Jar (7x7cm), Sunscreen Tube (4x14cm), Eye Shadow Palette (10x10cm), BB Cream (4x13cm), Setting Spray (5x17cm).

## Architecture

```
src/
├── types.ts                     # Product, Shelf, ShelfPlacement, RackConfig, RackTemplate
├── App.tsx                      # Root — wires catalog, canvas, config, state, export
├── components/
│   ├── ProductCatalog.tsx       # Searchable sidebar with draggable product cards
│   ├── RackCanvas.tsx           # Konva Stage — rack, shelves, products, drop target
│   ├── ProductImage.tsx         # Standalone useImage wrapper (can't use hooks in .map())
│   └── GapConfig.tsx            # Edge margin + inter-product gap number inputs
├── hooks/
│   └── useRackState.ts          # Shelf state, addPlacement, removePlacement, updateRackConfig
├── engine/
│   ├── placementEngine.ts       # Pure functions: fit checks, gap math, position calculation
│   └── placementEngine.test.ts  # 21 unit tests
├── utils/
│   ├── unitConversion.ts        # cmToPx, pxToCm (PIXELS_PER_CM = 5)
│   ├── unitConversion.test.ts   # 9 unit tests
│   └── constants.ts             # DEFAULT_EDGE_MARGIN_CM, SHELF_THICKNESS_PX, etc.
└── data/
    ├── sampleProducts.ts        # 15 hardcoded beauty products
    └── rackTemplates.ts         # 3 rack presets

tests/
└── planogram.spec.ts            # 7 Playwright integration tests

public/
└── products/                    # 15 placeholder product PNGs
```

### Tech Stack

- **React 19** + TypeScript
- **Vite** (dev server + build)
- **Konva.js** / react-konva (canvas rendering)
- **Tailwind CSS v4** (styling)
- **Vitest** (unit tests — 30 passing)
- **Playwright** (integration tests — 7 passing)

### Placement Engine

The placement logic lives in pure, tested functions — no UI coupling:

- `getUsableShelfWidth(config)` — rack width minus both edge margins
- `getOccupiedWidth(shelf, products, config)` — sum of product widths + gaps between them
- `getRemainingSpace(shelf, products, config)` — usable width minus occupied width minus one more gap (for the next product)
- `canFitOnShelf(product, shelf, products, config)` — checks height and width constraints, returns `{ fits, reason }`
- `getNextAvailablePosition(product, shelf, products, config)` — calculates x-position for the next product
- `isPositionValid(x, width, shelf, products, config)` — validates no overlaps considering gaps
- `getSortedPlacements(shelf, products)` — placements sorted left-to-right by x-position

## Running

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Build
bun run build

# Unit tests
bun run test

# Integration tests (requires dev server running)
bun run dev &
bunx playwright test
```

## Future Extensions

### Near-Term (High Value, Low Effort)

**Save/Load Arrangements**
Persist rack arrangements to localStorage or a backend API so users can revisit and edit previous layouts. Export/import as JSON.

**Real Product Data**
Replace sample products with Purplle's actual product catalog. Fetch product dimensions and images from an API. Add category-based filtering (skincare, haircare, makeup).

**Custom Rack Dimensions**
Let users define custom rack configurations beyond the 3 presets — set width, height, number of shelves, and per-shelf height independently.

**Undo/Redo**
Track placement history and allow stepping backward/forward through changes.

### Mid-Term (Medium Effort)

**Drag to Reorder**
Allow dragging products within the canvas to reorder them on a shelf or move between shelves (currently only add/remove is supported).

**Multiple Racks per Session**
Support planning multiple racks in a single session — useful when a store has several promotional displays.

**Per-Shelf Height Configuration**
Allow different shelf heights within the same rack (bottom shelf taller for shampoo bottles, top shelf shorter for lipsticks).

**Product Grouping / Zones**
Mark shelf zones by category (e.g., "Skincare" section vs. "Makeup" section) with visual color coding.

**Print-Optimized Export**
Generate a print-ready PDF with rack dimensions, product list, and placement diagram — not just a screenshot PNG.

### Long-Term (Higher Effort)

**Backend + Multi-User**
Server-side storage with user authentication. Share arrangements via link. Role-based access (ops team creates, store staff views).

**Store-Specific Rack Profiles**
Map physical rack types per store location. Ops selects a store and gets the correct rack dimensions automatically.

**Analytics Integration**
Track which product placements drive the most sales. Feed sell-through data back to inform future arrangements.

**Inventory-Aware Placement**
Connect to inventory system. Warn if a product is out of stock or low inventory before placing it on the rack.

**Auto-Suggest (Optional)**
Suggest optimal placements based on product popularity, margin, or visual balance. This would be opt-in — the core tool remains manual placement per original requirement.
