import { describe, it, expect } from 'vitest';
import type { Product, Shelf, RackConfig } from '../types';
import {
  getUsableShelfWidth,
  getOccupiedWidth,
  getRemainingSpace,
  canFitOnShelf,
  getNextAvailablePosition,
  isPositionValid,
  getSortedPlacements,
} from './placementEngine';

const makeRack = (overrides: Partial<RackConfig> = {}): RackConfig => ({
  id: 'rack-1',
  name: 'Standard Rack',
  widthCm: 120,
  totalHeightCm: 180,
  numberOfShelves: 5,
  shelfHeightCm: 36,
  edgeMarginCm: 2,
  interProductGapCm: 2,
  ...overrides,
});

const makeShelf = (placements: { productId: string; xPositionCm: number }[] = []): Shelf => ({
  id: 'shelf-1',
  placements,
});

const makeProduct = (id: string, widthCm: number, heightCm: number): Product => ({
  id,
  name: `Product ${id}`,
  widthCm,
  heightCm,
  imageSrc: `/products/${id}.png`,
});

const p1 = makeProduct('p1', 10, 20);
const p2 = makeProduct('p2', 12, 25);

describe('getUsableShelfWidth', () => {
  it('subtracts both edge margins from rack width', () => {
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2 });
    expect(getUsableShelfWidth(rack)).toBe(116);
  });

  it('returns full width when edge margins are zero', () => {
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 0 });
    expect(getUsableShelfWidth(rack)).toBe(120);
  });
});

describe('getOccupiedWidth', () => {
  it('returns 0 for an empty shelf', () => {
    const shelf = makeShelf([]);
    expect(getOccupiedWidth(shelf, [p1, p2], makeRack())).toBe(0);
  });

  it('returns just product width for a single product with no gap', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    expect(getOccupiedWidth(shelf, [p1, p2], makeRack())).toBe(10);
  });

  it('includes one inter-product gap for two products', () => {
    const shelf = makeShelf([
      { productId: 'p1', xPositionCm: 0 },
      { productId: 'p2', xPositionCm: 12 },
    ]);
    expect(getOccupiedWidth(shelf, [p1, p2], makeRack())).toBe(24);
  });
});

describe('getRemainingSpace', () => {
  it('returns full usable width for an empty shelf', () => {
    const shelf = makeShelf([]);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2 });
    expect(getRemainingSpace(shelf, [p1, p2], rack)).toBe(116);
  });

  it('subtracts product width and one extra gap for a shelf with one product', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2 });
    expect(getRemainingSpace(shelf, [p1, p2], rack)).toBe(104);
  });

  it('accounts for all gaps for a shelf with two products', () => {
    const shelf = makeShelf([
      { productId: 'p1', xPositionCm: 0 },
      { productId: 'p2', xPositionCm: 12 },
    ]);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2 });
    expect(getRemainingSpace(shelf, [p1, p2], rack)).toBe(90);
  });
});

describe('canFitOnShelf', () => {
  it('returns fits=true for a small product on an empty shelf', () => {
    const shelf = makeShelf([]);
    const result = canFitOnShelf(makeProduct('small', 5, 15), shelf, [], makeRack());
    expect(result.fits).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects a product that is too tall', () => {
    const shelf = makeShelf([]);
    const tall = makeProduct('tall', 5, 40);
    const rack = makeRack({ shelfHeightCm: 36 });
    const result = canFitOnShelf(tall, shelf, [], rack);
    expect(result.fits).toBe(false);
    expect(result.reason).toMatch(/height/i);
  });

  it('rejects a product that is too wide', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const wide = makeProduct('wide', 110, 20);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2 });
    const result = canFitOnShelf(wide, shelf, [p1], rack);
    expect(result.fits).toBe(false);
    expect(result.reason).toMatch(/width/i);
  });

  it('BOUNDARY: accepts a product that exactly fills remaining space', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2, shelfHeightCm: 36 });
    const exactly104 = makeProduct('exact', 104, 20);
    const result = canFitOnShelf(exactly104, shelf, [p1], rack);
    expect(result.fits).toBe(true);
  });

  it('BOUNDARY: rejects a product 0.1cm wider than remaining space', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2, shelfHeightCm: 36 });
    const tooWide = makeProduct('toowide', 104.1, 20);
    const result = canFitOnShelf(tooWide, shelf, [p1], rack);
    expect(result.fits).toBe(false);
  });
});

describe('getNextAvailablePosition', () => {
  it('returns 0 for an empty shelf', () => {
    const shelf = makeShelf([]);
    const pos = getNextAvailablePosition(p1, shelf, [], makeRack());
    expect(pos).toBe(0);
  });

  it('returns position after first product plus gap', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const small = makeProduct('small', 5, 15);
    const rack = makeRack({ widthCm: 120, edgeMarginCm: 2, interProductGapCm: 2 });
    const pos = getNextAvailablePosition(small, shelf, [p1], rack);
    expect(pos).toBe(12);
  });

  it('returns null when product does not fit', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const huge = makeProduct('huge', 200, 20);
    const pos = getNextAvailablePosition(huge, shelf, [p1], makeRack());
    expect(pos).toBeNull();
  });
});

describe('isPositionValid', () => {
  it('returns true for an empty shelf', () => {
    const shelf = makeShelf([]);
    expect(isPositionValid(0, 10, shelf, [], makeRack())).toBe(true);
  });

  it('returns false for an overlapping position', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    expect(isPositionValid(5, 10, shelf, [p1], makeRack())).toBe(false);
  });

  it('returns true for a valid position with proper gap', () => {
    const shelf = makeShelf([{ productId: 'p1', xPositionCm: 0 }]);
    const rack = makeRack({ interProductGapCm: 2 });
    expect(isPositionValid(12, 10, shelf, [p1], rack)).toBe(true);
  });
});

describe('getSortedPlacements', () => {
  it('returns empty array for an empty shelf', () => {
    const shelf = makeShelf([]);
    expect(getSortedPlacements(shelf, [])).toEqual([]);
  });

  it('sorts placements by xPositionCm ascending', () => {
    const shelf = makeShelf([
      { productId: 'p2', xPositionCm: 15 },
      { productId: 'p1', xPositionCm: 0 },
    ]);
    const sorted = getSortedPlacements(shelf, [p1, p2]);
    expect(sorted[0].placement.productId).toBe('p1');
    expect(sorted[1].placement.productId).toBe('p2');
  });
});
