import type { Product, Shelf, ShelfPlacement, RackConfig } from '../types';

/**
 * Calculate the usable width of a shelf (total width minus both edge margins).
 */
export function getUsableShelfWidth(rackConfig: RackConfig): number {
  return rackConfig.widthCm - 2 * rackConfig.edgeMarginCm;
}

/**
 * Calculate the total width consumed by current placements on a shelf,
 * including inter-product gaps between them.
 * Formula: sum(product widths) + (numProducts - 1) × interProductGap
 * If 0 products, returns 0.
 */
export function getOccupiedWidth(shelf: Shelf, products: Product[], rackConfig: RackConfig): number {
  if (shelf.placements.length === 0) return 0;

  const productMap = new Map(products.map(p => [p.id, p]));
  let totalWidth = 0;

  for (const placement of shelf.placements) {
    const product = productMap.get(placement.productId);
    if (product) {
      totalWidth += product.widthCm;
    }
  }

  // Add gaps between products: (numProducts - 1) gaps
  totalWidth += (shelf.placements.length - 1) * rackConfig.interProductGapCm;

  return totalWidth;
}

/**
 * Calculate remaining available width on a shelf for new products.
 * Empty shelf: usableWidth (no gap deducted).
 * Non-empty shelf: usableWidth - occupiedWidth - interProductGapCm
 * (the extra gap accounts for the gap that would precede the next product).
 */
export function getRemainingSpace(shelf: Shelf, products: Product[], rackConfig: RackConfig): number {
  const usableWidth = getUsableShelfWidth(rackConfig);

  if (shelf.placements.length === 0) {
    return usableWidth;
  }

  const occupiedWidth = getOccupiedWidth(shelf, products, rackConfig);
  // Subtract one more gap for the gap before the next product
  return usableWidth - occupiedWidth - rackConfig.interProductGapCm;
}

/**
 * Check if a specific product can fit on a shelf:
 * - Product height must be <= shelf height
 * - Product width must be <= remaining space
 * Returns { fits: boolean, reason?: string }
 */
export function canFitOnShelf(
  product: Product,
  shelf: Shelf,
  products: Product[],
  rackConfig: RackConfig
): { fits: boolean; reason?: string } {
  if (product.heightCm > rackConfig.shelfHeightCm) {
    return {
      fits: false,
      reason: `Product height (${product.heightCm}cm) exceeds shelf height (${rackConfig.shelfHeightCm}cm)`,
    };
  }

  const remaining = getRemainingSpace(shelf, products, rackConfig);
  if (product.widthCm > remaining) {
    return {
      fits: false,
      reason: `Product width (${product.widthCm}cm) exceeds remaining shelf width (${remaining.toFixed(1)}cm)`,
    };
  }

  return { fits: true };
}

/**
 * Calculate the next valid X position (in cm) for a product dropped on a shelf.
 * Empty shelf: returns 0 (relative to left usable edge, i.e., after edge margin).
 * Non-empty: lastProduct.xPositionCm + lastProduct.widthCm + interProductGapCm.
 * Returns null if product won't fit.
 */
export function getNextAvailablePosition(
  product: Product,
  shelf: Shelf,
  products: Product[],
  rackConfig: RackConfig
): number | null {
  const fitCheck = canFitOnShelf(product, shelf, products, rackConfig);
  if (!fitCheck.fits) return null;

  if (shelf.placements.length === 0) {
    return 0;
  }

  const productMap = new Map(products.map(p => [p.id, p]));
  const sorted = getSortedPlacements(shelf, products);

  if (sorted.length === 0) return 0;

  const last = sorted[sorted.length - 1];
  const lastProduct = productMap.get(last.placement.productId);
  if (!lastProduct) return 0;

  return last.placement.xPositionCm + lastProduct.widthCm + rackConfig.interProductGapCm;
}

/**
 * Validate that a proposed placement doesn't overlap with existing placements.
 * Checks if placing a product of width productWidthCm at xPositionCm would
 * overlap any existing product, accounting for inter-product gap.
 */
export function isPositionValid(
  xPositionCm: number,
  productWidthCm: number,
  shelf: Shelf,
  products: Product[],
  rackConfig: RackConfig
): boolean {
  if (shelf.placements.length === 0) return true;

  const productMap = new Map(products.map(p => [p.id, p]));
  const gap = rackConfig.interProductGapCm;
  const newLeft = xPositionCm;
  const newRight = xPositionCm + productWidthCm;

  for (const placement of shelf.placements) {
    const existingProduct = productMap.get(placement.productId);
    if (!existingProduct) continue;

    const existingLeft = placement.xPositionCm;
    const existingRight = placement.xPositionCm + existingProduct.widthCm;

    // Check overlap considering gap: [existingLeft - gap, existingRight + gap]
    const gapLeft = existingLeft - gap;
    const gapRight = existingRight + gap;

    // Overlap if ranges intersect
    if (newLeft < gapRight && newRight > gapLeft) {
      return false;
    }
  }

  return true;
}

/**
 * Get all placements on a shelf sorted by x position (left to right).
 */
export function getSortedPlacements(
  shelf: Shelf,
  products: Product[]
): Array<{ placement: ShelfPlacement; product: Product }> {
  const productMap = new Map(products.map(p => [p.id, p]));

  const result: Array<{ placement: ShelfPlacement; product: Product }> = [];

  for (const placement of shelf.placements) {
    const product = productMap.get(placement.productId);
    if (product) {
      result.push({ placement, product });
    }
  }

  return result.sort((a, b) => a.placement.xPositionCm - b.placement.xPositionCm);
}
