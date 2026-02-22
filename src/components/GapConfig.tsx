import React from 'react';
import {
  DEFAULT_EDGE_MARGIN_CM,
  DEFAULT_INTER_PRODUCT_GAP_CM,
} from '../utils/constants';

interface GapConfigProps {
  edgeMarginCm: number;
  interProductGapCm: number;
  onEdgeMarginChange: (value: number) => void;
  onInterProductGapChange: (value: number) => void;
}

export function GapConfig({
  edgeMarginCm,
  interProductGapCm,
  onEdgeMarginChange,
  onInterProductGapChange,
}: GapConfigProps) {
  const handleEdgeMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onEdgeMarginChange(value);
    }
  };

  const handleInterProductGapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onInterProductGapChange(value);
    }
  };

  const handleResetToDefaults = () => {
    onEdgeMarginChange(DEFAULT_EDGE_MARGIN_CM);
    onInterProductGapChange(DEFAULT_INTER_PRODUCT_GAP_CM);
  };

  return (
    <div className="flex items-center gap-5 px-6 py-2 bg-white border-b border-stone-200/60">
      <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mr-1">Gaps</h3>

      <div className="flex items-center gap-2">
        <label htmlFor="edge-margin-input" className="text-[13px] font-medium text-stone-500 whitespace-nowrap">
          Edge Margin
        </label>
        <div className="flex items-center gap-1">
          <input
            id="edge-margin-input"
            data-testid="edge-margin-input"
            type="number"
            min="0"
            step="0.5"
            value={edgeMarginCm}
            onChange={handleEdgeMarginChange}
            className="w-16 px-2 py-1 text-[13px] font-medium text-stone-700 border border-stone-200 rounded-md bg-stone-50 focus:bg-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all tabular-nums"
          />
          <span className="text-[11px] text-stone-400">cm</span>
        </div>
      </div>

      <div className="w-px h-4 bg-stone-200" />

      <div className="flex items-center gap-2">
        <label htmlFor="gap-input" className="text-[13px] font-medium text-stone-500 whitespace-nowrap">
          Product Gap
        </label>
        <div className="flex items-center gap-1">
          <input
            id="gap-input"
            data-testid="gap-input"
            type="number"
            min="0"
            step="0.5"
            value={interProductGapCm}
            onChange={handleInterProductGapChange}
            className="w-16 px-2 py-1 text-[13px] font-medium text-stone-700 border border-stone-200 rounded-md bg-stone-50 focus:bg-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all tabular-nums"
          />
          <span className="text-[11px] text-stone-400">cm</span>
        </div>
      </div>

      <button
        onClick={handleResetToDefaults}
        className="px-3 py-1 text-[11px] font-medium text-stone-400 hover:text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors ml-auto"
      >
        Reset
      </button>
    </div>
  );
}
