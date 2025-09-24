import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center sm:text-left">
      <h1 className="text-xl md:text-2xl font-bold text-ht-accent tracking-wide capitalize">
        HT Listing Lab
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Content Engine for Refurbished Tech Listings
      </p>
    </header>
  );
};

export default Header;