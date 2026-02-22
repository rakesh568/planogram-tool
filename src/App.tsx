import { useRef, useState, useCallback } from 'react';
import type Konva from 'konva';
import { RackCanvas } from './components/RackCanvas';
import { ProductCatalog } from './components/ProductCatalog';
import { GapConfig } from './components/GapConfig';
import { useRackState } from './hooks/useRackState';
import { rackTemplates } from './data/rackTemplates';
import { sampleProducts } from './data/sampleProducts';
import { RED_FLASH_DURATION_MS } from './utils/constants';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(1);
  const selectedTemplate = rackTemplates[selectedTemplateIndex];
  const { shelves, rackConfig, addPlacement, removePlacement, updateRackConfig } =
    useRackState(selectedTemplate.config);
  const [flashingShelf, setFlashingShelf] = useState<number | null>(null);

  const handleTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateIndex(Number(e.target.value));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, shelfIndex: number) => {
      const productId = e.dataTransfer.getData('productId');
      if (!productId) return;
      const success = addPlacement(shelfIndex, productId, sampleProducts);
      if (!success) {
        setFlashingShelf(shelfIndex);
        setTimeout(() => setFlashingShelf(null), RED_FLASH_DURATION_MS);
      }
    },
    [addPlacement]
  );

  const handleExportPng = useCallback(() => {
    if (!stageRef.current) return;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'planogram.png';
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <ProductCatalog products={sampleProducts} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-3 bg-white border-b border-stone-200/60 flex items-center justify-between flex-shrink-0" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-orange-600" />
            <h1 className="text-base font-semibold text-stone-900 tracking-tight">Planogram</h1>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rack-template-select" className="text-xs font-medium text-stone-400 whitespace-nowrap">
              Template
            </label>
            <select
              id="rack-template-select"
              data-testid="rack-template-select"
              value={selectedTemplateIndex}
              onChange={handleTemplateChange}
              className="px-2.5 py-1.5 text-[13px] font-medium border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 bg-white text-stone-700 transition-all"
            >
              {rackTemplates.map((t, i) => (
                <option key={t.id} value={i}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="w-px h-5 bg-stone-200 mx-1" />
            <button
              onClick={handleExportPng}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white text-[13px] font-medium rounded-md transition-colors"
            >
              Export PNG
            </button>
          </div>
        </header>

        <GapConfig
          edgeMarginCm={rackConfig.edgeMarginCm}
          interProductGapCm={rackConfig.interProductGapCm}
          onEdgeMarginChange={v => updateRackConfig({ edgeMarginCm: v })}
          onInterProductGapChange={v => updateRackConfig({ interProductGapCm: v })}
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="inline-block bg-white rounded-lg p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <RackCanvas
              rackConfig={rackConfig}
              shelves={shelves}
              products={sampleProducts}
              onRemovePlacement={removePlacement}
              stageRef={stageRef}
              onDrop={handleDrop}
              flashingShelf={flashingShelf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
