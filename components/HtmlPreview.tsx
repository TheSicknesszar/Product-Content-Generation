import React, { useState } from 'react';

interface HtmlPreviewProps {
  htmlContent: string;
}

type ViewMode = 'desktop' | 'mobile';

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ htmlContent }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  const styledHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          background-color: #1e293b; /* slate-800 */
          color: #cbd5e1; /* slate-300 */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          margin: 0;
          padding: 1rem;
          line-height: 1.6;
        }
        h2, h3 { 
          color: #3b82f6; /* brand-accent */
          line-height: 1.3;
          border-bottom: 1px solid #334155; /* slate-700 */
          padding-bottom: 0.5rem;
        }
        ul { 
          padding-left: 20px;
        }
        li {
          margin-bottom: 0.5rem;
        }
        strong { 
          color: #93c5fd; /* blue-300 */
        }
        p {
          margin-top: 0;
        }
        a {
            color: #60a5fa; /* blue-400 */
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  return (
    <div className="bg-slate-900/70 rounded-lg p-2">
      <div className="flex justify-end mb-2">
        <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
            <button 
                onClick={() => setViewMode('desktop')} 
                title="Desktop View"
                className={`p-1 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-brand-accent' : 'hover:bg-slate-600'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
            <button 
                onClick={() => setViewMode('mobile')} 
                title="Mobile View"
                className={`p-1 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-brand-accent' : 'hover:bg-slate-600'}`}
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </button>
        </div>
      </div>
      <div 
        className={`mx-auto transition-all duration-300 ease-in-out ${viewMode === 'desktop' ? 'w-full' : 'w-[375px]'}`}
        style={{ maxWidth: '100%' }}
      >
        <iframe
          srcDoc={styledHtml}
          title="HTML Content Preview"
          className="w-full h-96 rounded-md border border-slate-700"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};

export default HtmlPreview;
