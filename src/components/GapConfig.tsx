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
    <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700">Gap Settings</h3>

      <div className="flex items-center gap-2">
        <label htmlFor="edge-margin-input" className="text-xs text-gray-600 whitespace-nowrap">
          Edge Margin (cm)
        </label>
        <input
          id="edge-margin-input"
          data-testid="edge-margin-input"
          type="number"
          min="0"
          step="0.5"
          value={edgeMarginCm}
          onChange={handleEdgeMarginChange}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="gap-input" className="text-xs text-gray-600 whitespace-nowrap">
          Inter-Product Gap (cm)
        </label>
        <input
          id="gap-input"
          data-testid="gap-input"
          type="number"
          min="0"
          step="0.5"
          value={interProductGapCm}
          onChange={handleInterProductGapChange}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>

      <button
        onClick={handleResetToDefaults}
        className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
