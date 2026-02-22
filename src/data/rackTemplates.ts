import type { RackTemplate } from '../types';

export const rackTemplates: RackTemplate[] = [
  {
    id: 'small-promo',
    name: 'Small Promo Rack',
    description: '90cm wide, 4 shelves',
    config: {
      id: 'small-promo',
      name: 'Small Promo Rack',
      widthCm: 90,
      totalHeightCm: 150,
      numberOfShelves: 4,
      shelfHeightCm: 37.5,
      edgeMarginCm: 2,
      interProductGapCm: 1.5,
    },
  },
  {
    id: 'standard-promo',
    name: 'Standard Promo Rack',
    description: '120cm wide, 5 shelves',
    config: {
      id: 'standard-promo',
      name: 'Standard Promo Rack',
      widthCm: 120,
      totalHeightCm: 180,
      numberOfShelves: 5,
      shelfHeightCm: 36,
      edgeMarginCm: 2,
      interProductGapCm: 2,
    },
  },
  {
    id: 'large-promo',
    name: 'Large Promo Rack',
    description: '150cm wide, 5 shelves',
    config: {
      id: 'large-promo',
      name: 'Large Promo Rack',
      widthCm: 150,
      totalHeightCm: 200,
      numberOfShelves: 5,
      shelfHeightCm: 40,
      edgeMarginCm: 3,
      interProductGapCm: 2.5,
    },
  },
];
