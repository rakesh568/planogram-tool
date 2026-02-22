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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ProductCatalog products={sampleProducts} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Planogram Tool</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="rack-template-select" className="text-sm text-gray-600 whitespace-nowrap">
                Rack Template:
              </label>
              <select
                id="rack-template-select"
                data-testid="rack-template-select"
                value={selectedTemplateIndex}
                onChange={handleTemplateChange}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
              >
                {rackTemplates.map((t, i) => (
                  <option key={t.id} value={i}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportPng}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Export PNG
            </button>
          </div>
        </div>

        <GapConfig
          edgeMarginCm={rackConfig.edgeMarginCm}
          interProductGapCm={rackConfig.interProductGapCm}
          onEdgeMarginChange={v => updateRackConfig({ edgeMarginCm: v })}
          onInterProductGapChange={v => updateRackConfig({ interProductGapCm: v })}
        />

        <div className="flex-1 overflow-auto p-6">
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
  );
}

export default App;
