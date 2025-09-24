import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
        copied
          ? 'bg-emerald-500 text-white focus:ring-emerald-400'
          : 'bg-slate-600 text-slate-200 hover:bg-slate-500 focus:ring-brand-accent'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default CopyButton;
