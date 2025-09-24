import React from 'react';
import type { OEMLabelData } from '../types';

interface SpecPreviewModalProps {
  specs: Partial<OEMLabelData>;
  onApply: (specs: Partial<OEMLabelData>) => void;
  onCancel: () => void;
}

const SpecPreviewModal: React.FC<SpecPreviewModalProps> = ({ specs, onApply, onCancel }) => {
  const specEntries = Object.entries(specs);
  const foundSpecsCount = specEntries.filter(([, value]) => value && String(value).trim() !== '').length;
  const totalSpecsCount = specEntries.length;
  const confidenceScore = totalSpecsCount > 0 ? Math.round((foundSpecsCount / totalSpecsCount) * 100) : 0;

  const fieldLabels: Record<keyof OEMLabelData, string> = {
      brand: "Brand",
      model_name: "Model Name",
      mtm: "MTM (SKU)",
      cpu: "CPU",
      ram: "RAM",
      storage: "Storage",
      display: "Display",
      resolution: "Resolution",
      os: "OS",
      gpu: "GPU",
      webcam: "Webcam",
      color: "Color",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100">Auto-fill Specs Preview</h2>
          <p className="text-slate-400 mt-1">Review the specifications found by the AI before applying them.</p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold text-brand-accent">Confidence Score: {confidenceScore}%</p>
            <p className="text-sm text-slate-400">({foundSpecsCount} of {totalSpecsCount} fields found)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-md">
            {Object.keys(fieldLabels).map((key) => {
              const specKey = key as keyof OEMLabelData;
              const value = specs[specKey];
              return (
                <div key={specKey}>
                  <p className="text-sm font-medium text-slate-400">{fieldLabels[specKey]}</p>
                  <p className={`text-base font-semibold rounded p-1 ${value ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                    {value || 'Not found'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onCancel}
            className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(specs)}
            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent transition"
          >
            Apply Specs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecPreviewModal;
