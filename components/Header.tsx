import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Product Content Generator
      </h1>
      <p className="mt-2 text-lg text-slate-400">
        AI-Powered Content for Your E-Commerce Store
      </p>
    </header>
  );
};

export default Header;