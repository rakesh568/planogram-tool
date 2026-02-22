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
    <div className="w-72 h-full flex flex-col bg-white border-r border-stone-200/60" style={{ boxShadow: 'var(--shadow-sidebar)' }}>
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="text-[11px] font-semibold text-stone-400 tracking-widest uppercase">Product Catalog</h2>
        <p className="text-xs text-stone-400 mt-1 tabular-nums">{products.length} items</p>
      </div>
      <div className="px-4 pt-3 pb-2">
        <input
          type="text"
          placeholder="Search products…"
          data-testid="product-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-stone-200 rounded-md text-[13px] bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 focus:bg-white transition-all"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-px">
        {filtered.map(product => (
          <div
            key={product.id}
            draggable
            data-testid="product-card"
            onDragStart={e => {
              e.dataTransfer.setData('productId', product.id);
              onDragStart?.(product);
            }}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-md cursor-grab hover:bg-orange-50/60 active:cursor-grabbing border border-transparent hover:border-orange-200/50 transition-all select-none group"
          >
            <img
              src={product.imageSrc}
              alt={product.name}
              className="w-10 h-14 object-cover rounded flex-shrink-0 bg-stone-100"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-stone-800 leading-tight truncate">{product.name}</p>
              <p className="text-[11px] font-medium text-stone-400 mt-0.5 tabular-nums">{product.widthCm} × {product.heightCm} cm</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <p className="text-[13px]">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
