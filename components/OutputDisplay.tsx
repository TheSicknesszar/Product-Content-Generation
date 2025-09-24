import React, { useState } from 'react';
import type { GeneratedContent } from '../types';
import CopyButton from './CopyButton';
import CodeBlock from './CodeBlock';
import PricingChart from './PricingChart';
import SeoSnippetPreview from './SeoSnippetPreview';
import HtmlPreview from './HtmlPreview';

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

const formatPercentage = (value: number | null | undefined): string => {
    if (typeof value === 'number' && !isNaN(value)) {
        return `${value.toFixed(1)}%`;
    }
    return 'N/A';
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const { pricingAnalysis } = content;

  return (
    <div className="space-y-6">
      <OutputSection title="1. Product Title" copyText={content.productTitle}>
        <p className="text-xl font-bold">{content.productTitle}</p>
      </OutputSection>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-brand-accent mb-3">SEO Preview</h3>
        <SeoSnippetPreview 
            title={content.productTitle}
            slug={content.urlSlug}
            description={content.metaDescription}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OutputSection title="2. SEO KeyPhrase" copyText={content.seoKeyPhrase}>
            <p>{content.seoKeyPhrase}</p>
        </OutputSection>
        <OutputSection title="3. URL Slug" copyText={content.urlSlug}>
            <p className="font-mono bg-slate-700 px-2 py-1 rounded-md text-emerald-300">{content.urlSlug}</p>
        </OutputSection>
      </div>

       <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-brand-accent">4. Long Description</h3>
            <div className="flex items-center gap-1 bg-slate-700/50 p-1 rounded-md">
                <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'preview' ? 'bg-brand-accent text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Preview</button>
                <button onClick={() => setActiveTab('code')} className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'code' ? 'bg-brand-accent text-white' : 'text-slate-300 hover:bg-slate-600'}`}>HTML</button>
            </div>
        </div>
        {activeTab === 'preview' ? (
            <HtmlPreview htmlContent={content.longDescriptionHtml} />
        ) : (
            <CodeBlock code={content.longDescriptionHtml} language="html" />
        )}
       </div>


      <OutputSection title="5. Short Description (HTML)">
         <CodeBlock code={content.shortDescriptionHtml} language="html" />
      </OutputSection>

      <OutputSection title="6. Meta Description" copyText={content.metaDescription}>
        <p>{content.metaDescription}</p>
      </OutputSection>

      <OutputSection title="7. Product Attributes">
        <CodeBlock code={content.productAttributes} language="text" />
      </OutputSection>

      <OutputSection title="8. Product Tags" copyText={content.productTags}>
        <div className="flex flex-wrap gap-2">
          {content.productTags.split(',').map(tag => tag.trim()).map((tag, index) => (
            <span key={index} className="bg-slate-700 text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </OutputSection>

      {pricingAnalysis && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-brand-accent mb-3">9. Pricing Intelligence Engine</h3>
            <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 text-center mb-2">Recommendation</h4>
                    <p className="text-center text-xl font-bold text-emerald-400">"{pricingAnalysis.recommendation}"</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-700 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Suggested Price</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatPrice(pricingAnalysis.suggestedPrice)}</p>
                    </div>
                     <div className="bg-slate-700 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Potential Profit</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatPrice(pricingAnalysis.profit)}</p>
                    </div>
                     <div className="bg-slate-700 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Margin</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatPercentage(pricingAnalysis.margin)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Price Gap</p>
                        <p className={`text-lg font-semibold ${pricingAnalysis.priceGap && pricingAnalysis.priceGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {formatPrice(pricingAnalysis.priceGap)}
                        </p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market Average</p>
                        <p className="text-lg font-semibold">{formatPrice(pricingAnalysis.averageCompetitorPrice)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market Low</p>
                        <p className="text-lg font-semibold">{formatPrice(pricingAnalysis.lowestCompetitorPrice)}</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-md">
                        <p className="text-sm text-slate-400">Market High</p>
                        <p className="text-lg font-semibold">{formatPrice(pricingAnalysis.highestCompetitorPrice)}</p>
                    </div>
                </div>

                {pricingAnalysis.competitors && pricingAnalysis.competitors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-200 mt-4 mb-2">Market Comparison</h4>
                    <PricingChart
                      suggestedPrice={pricingAnalysis.suggestedPrice}
                      competitors={pricingAnalysis.competitors}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                    <h4 className="font-semibold text-slate-200">Rationale:</h4>
                    <p className="mt-1 text-slate-300 bg-slate-700/50 p-3 rounded-md italic">"{pricingAnalysis.rationale}"</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;