import React from 'react';

export const Spinner: React.FC = () => (
  <div className="inline-flex items-center">
    <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
    <span className="ml-3 text-gray-700">Loading...</span>
  </div>
);