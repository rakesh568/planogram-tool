export interface Product {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  imageSrc: string; // local path, e.g., "/products/lipstick-01.png"
}

export interface ShelfPlacement {
  productId: string;
  xPositionCm: number; // left edge position relative to shelf's usable area start (after edge margin)
}

export interface Shelf {
  id: string;
  placements: ShelfPlacement[];
}

export interface RackConfig {
  id: string;
  name: string;
  widthCm: number;
  totalHeightCm: number;
  numberOfShelves: number;
  shelfHeightCm: number; // uniform height per shelf
  edgeMarginCm: number;
  interProductGapCm: number;
}

export interface RackTemplate {
  id: string;
  name: string;
  description: string;
  config: RackConfig;
}
