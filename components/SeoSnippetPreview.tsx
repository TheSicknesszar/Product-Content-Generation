import React from 'react';

interface SeoSnippetPreviewProps {
  title: string;
  slug: string;
  description: string;
}

const SeoSnippetPreview: React.FC<SeoSnippetPreviewProps> = ({ title, slug, description }) => {
  const siteUrl = "https://techrestored.co.za/product/";

  // Truncate functions for display purposes
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    // Find the last space within the limit
    const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
    return text.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg font-sans">
        <div className="flex items-center mb-1">
            <span className="text-sm text-slate-300">{siteUrl}{slug}</span>
        </div>
        <h3 className="text-xl text-blue-400 hover:underline cursor-pointer truncate">
            {truncateText(title, 60)}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
            {truncateText(description, 160)}
        </p>
    </div>
  );
};

export default SeoSnippetPreview;
