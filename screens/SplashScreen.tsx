
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary animate-pulse">Gest-Immo</h1>
        <p className="text-gray-500 mt-2">Caricamento in corso...</p>
      </div>
    </div>
  );
};

export default SplashScreen;