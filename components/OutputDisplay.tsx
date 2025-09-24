import React from 'react';
import type { GeneratedContent } from '../types';
import CopyButton from './CopyButton';
import CodeBlock from './CodeBlock';
import PricingChart from './PricingChart';

interface OutputDisplayProps {
  content: GeneratedContent;
}

const OutputSection: React.FC<{ title: string; children: React.ReactNode; copyText?: string }> = ({ title, children, copyText }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-brand-accent">{title}</h3>
      {copyText && <CopyButton textToCopy={copyText} />}
    </div>
    <div className="text-slate-300 break-words">{children}</div>
  </div>
);

// Helper function to safely format price values
const formatPrice = (price: number | null | undefined): string => {
  if (typeof price === 'number' && !isNaN(price)) {
    return `R ${price.toFixed(2)}`;
  }
  return 'N/A';
};

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content }) => {
  return (
    <div className="space-y-6">
      <OutputSection title="1. Product Title" copyText={content.productTitle}>
        <p className="text-xl font-bold">{content.productTitle}</p>
      </OutputSection>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OutputSection title="2. SEO KeyPhrase" copyText={content.seoKeyPhrase}>
            <p>{content.seoKeyPhrase}</p>
        </OutputSection>
        <OutputSection title="3. URL Slug" copyText={content.urlSlug}>
            <p className="font-mono bg-slate-700 px-2 py-1 rounded-md text-emerald-300">{content.urlSlug}</p>
        </OutputSection>
      </div>

      <OutputSection title="4. Long Description (HTML)">
        <CodeBlock code={content.longDescriptionHtml} language="html" />
      </OutputSection>

      <OutputSection title="5. Short Description (HTML)">
         <CodeBlock code={content.shortDescriptionHtml} language="html" />
      </OutputSection>

      <OutputSection title="6. Meta Description" copyText={content.metaDescription}>
        <p>{content.metaDescription}</p>
      </OutputSection>

      <OutputSection title="7. Product Attributes" copyText={Object.entries(content.productAttributes).map(([key, value]) => `${key}: ${value}`).join('\n')}>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(content.productAttributes).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
      </OutputSection>

      <OutputSection title="8. Product Tags" copyText={content.productTags}>
        <div className="flex flex-wrap gap-2">
          {content.productTags.split(',').map(tag => tag.trim()).map((tag, index) => (
            <span key={index} className="bg-slate-700 text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </OutputSection>

      {content.pricingAnalysis && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-brand-accent mb-3">9. Pricing Analysis & Recommendation</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-700 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Suggested Price</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatPrice(content.pricingAnalysis.suggestedPrice)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market Average</p>
                        <p className="text-lg font-semibold">{formatPrice(content.pricingAnalysis.averageCompetitorPrice)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market Low</p>
                        <p className="text-lg font-semibold">{formatPrice(content.pricingAnalysis.lowestCompetitorPrice)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market High</p>
                        <p className="text-lg font-semibold">{formatPrice(content.pricingAnalysis.highestCompetitorPrice)}</p>
                    </div>
                </div>

                {content.pricingAnalysis.competitors && content.pricingAnalysis.competitors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-200 mt-4 mb-2">Market Comparison</h4>
                    <PricingChart
                      suggestedPrice={content.pricingAnalysis.suggestedPrice}
                      competitors={content.pricingAnalysis.competitors}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                    <h4 className="font-semibold text-slate-200">Rationale:</h4>
                    <p className="mt-1 text-slate-300 bg-slate-700/50 p-3 rounded-md italic">"{content.pricingAnalysis.rationale}"</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;