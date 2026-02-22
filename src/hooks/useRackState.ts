import { useState, useCallback } from 'react';
import type { Shelf, ShelfPlacement, RackConfig, Product } from '../types';
import {
  canFitOnShelf,
  getNextAvailablePosition,
} from '../engine/placementEngine';

interface UseRackStateReturn {
  shelves: Shelf[];
  rackConfig: RackConfig;
  addPlacement: (shelfIndex: number, productId: string, products: Product[]) => boolean;
  removePlacement: (shelfId: string, productId: string) => void;
  updateRackConfig: (updates: Partial<RackConfig>) => void;
}

export function useRackState(initialConfig: RackConfig): UseRackStateReturn {
  const [rackConfig, setRackConfig] = useState<RackConfig>(initialConfig);
  const [shelves, setShelves] = useState<Shelf[]>(() =>
    Array.from({ length: initialConfig.numberOfShelves }, (_, i) => ({
      id: `shelf-${i}`,
      placements: [] as ShelfPlacement[],
    }))
  );

  const addPlacement = useCallback(
    (shelfIndex: number, productId: string, products: Product[]): boolean => {
      const shelf = shelves[shelfIndex];
      if (!shelf) return false;

      const product = products.find(p => p.id === productId);
      if (!product) return false;

      const fitCheck = canFitOnShelf(product, shelf, products, rackConfig);
      if (!fitCheck.fits) return false;

      const xPosition = getNextAvailablePosition(product, shelf, products, rackConfig);
      if (xPosition === null) return false;

      setShelves(prev =>
        prev.map((s, idx) =>
          idx === shelfIndex
            ? { ...s, placements: [...s.placements, { productId, xPositionCm: xPosition }] }
            : s
        )
      );
      return true;
    },
    [shelves, rackConfig]
  );

  const removePlacement = useCallback((shelfId: string, productId: string) => {
    setShelves(prev =>
      prev.map(s =>
        s.id === shelfId
          ? { ...s, placements: s.placements.filter(p => p.productId !== productId) }
          : s
      )
    );
  }, []);

  const updateRackConfig = useCallback((updates: Partial<RackConfig>) => {
    setRackConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return { shelves, rackConfig, addPlacement, removePlacement, updateRackConfig };
}
