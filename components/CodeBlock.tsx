import React from 'react';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="relative bg-slate-900/70 rounded-lg group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton textToCopy={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-300 rounded-lg">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
