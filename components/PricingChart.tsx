import React from 'react';
import type { Competitor } from '../types';

interface PricingChartProps {
  suggestedPrice: number | null;
  competitors: Competitor[];
}

const PricingChart: React.FC<PricingChartProps> = ({ suggestedPrice, competitors }) => {
  const validPrices = [suggestedPrice, ...competitors.map(c => c.price)]
    .filter(p => typeof p === 'number') as number[];

  if (validPrices.length === 0) {
    return (
        <div className="bg-slate-700/50 p-4 rounded-lg text-center text-slate-400">
            No valid pricing data available to display chart.
        </div>
    );
  }

  const maxPrice = Math.max(...validPrices);

  const formatCurrency = (value: number) => `R ${value.toFixed(2)}`;

  const chartData = [
    ...(typeof suggestedPrice === 'number' ? [{ name: 'Our Suggested Price', price: suggestedPrice, isSuggested: true }] : []),
    ...competitors.map(c => ({ ...c, isSuggested: false })),
  ].sort((a, b) => b.price - a.price);

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <div className="space-y-3">
        {chartData.map((item, index) => {
          const barWidthPercentage = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0;
          const barColor = item.isSuggested
            ? 'bg-emerald-500'
            : 'bg-brand-accent';

          return (
            <div key={index} className="flex items-center group">
              <div className="w-1/3 pr-4 text-right">
                <p className={`text-sm font-medium ${item.isSuggested ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {item.name}
                </p>
              </div>
              <div className="w-2/3 flex items-center">
                <div
                  className={`h-6 rounded-r-md transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${barWidthPercentage}%` }}
                ></div>
                 <p className="pl-3 text-sm font-semibold text-slate-200">
                    {formatCurrency(item.price)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
       <div className="flex justify-end mt-4 border-t border-slate-600 pt-2">
            <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-xs text-slate-400">Our Suggested Price</span>
            </div>
            <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-brand-accent mr-2"></div>
                <span className="text-xs text-slate-400">Competitor Price</span>
            </div>
        </div>
    </div>
  );
};

export default PricingChart;