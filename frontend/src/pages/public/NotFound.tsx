import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-sm text-gray-500">
          The placement page or resource you are looking for might have been moved, renamed, or is unavailable.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
