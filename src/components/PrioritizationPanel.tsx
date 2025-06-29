"use client";

import { PrioritizationWeights } from '@/types/data';

interface PrioritizationPanelProps {
  priorities: PrioritizationWeights;
  setPriorities: (p: PrioritizationWeights) => void;
}

const criteria = [
  { key: 'priorityLevel', label: 'Priority Level' },
  { key: 'fulfillment', label: 'Requested Task Fulfillment' },
  { key: 'fairness', label: 'Fairness' },
  { key: 'workload', label: 'Workload' },
  { key: 'efficiency', label: 'Efficiency' },
];

export default function PrioritizationPanel({ priorities, setPriorities }: PrioritizationPanelProps) {
  const handleSlider = (key: keyof PrioritizationWeights, value: number) => {
    setPriorities({ ...priorities, [key]: value });
  };

  const total = Object.values(priorities).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-2">Set Prioritization Weights</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Adjust the sliders to assign relative importance to each criterion. Total: <span className="font-bold">{total.toFixed(2)}</span>
      </p>
      <div className="space-y-4">
        {criteria.map(c => (
          <div key={c.key} className="flex items-center space-x-4">
            <label className="w-48 text-gray-700">{c.label}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={priorities[c.key as keyof PrioritizationWeights]}
              onChange={e => handleSlider(c.key as keyof PrioritizationWeights, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right">{priorities[c.key as keyof PrioritizationWeights].toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-sm text-gray-500">
        <p>Tip: The sum of all weights does not have to be exactly 1, but relative values matter for downstream allocation.</p>
      </div>
    </div>
  );
} 