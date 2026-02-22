import { useState } from 'react';
import type { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onDragStart?: (product: Product) => void;
}

export function ProductCatalog({ products, onDragStart }: ProductCatalogProps) {
  const [query, setQuery] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Product Catalog</h2>
      </div>
      <div className="px-4 pt-3 pb-2">
        <input
          type="text"
          placeholder="Search products..."
          data-testid="product-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(product => (
          <div
            key={product.id}
            draggable
            data-testid="product-card"
            onDragStart={e => {
              e.dataTransfer.setData('productId', product.id);
              onDragStart?.(product);
            }}
            className="flex items-center gap-3 p-2 rounded-lg cursor-grab hover:bg-orange-50 active:cursor-grabbing border border-transparent hover:border-orange-200 transition-colors"
          >
            <img
              src={product.imageSrc}
              alt={product.name}
              className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-100"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-tight truncate">{product.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.widthCm}cm × {product.heightCm}cm</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No products found</p>
        )}
      </div>
    </div>
  );
}
