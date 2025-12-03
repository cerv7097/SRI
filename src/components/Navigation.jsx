import React from 'react';

const Navigation = ({ currentScreen, setCurrentScreen }) => {
  return (
    <nav className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`rounded-full px-5 py-2.5 transition ${
              currentScreen === 'dashboard'
                ? 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentScreen('reports')}
            className={`rounded-full px-5 py-2.5 transition ${
              currentScreen === 'reports'
                ? 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setCurrentScreen('history')}
            className={`rounded-full px-5 py-2.5 transition ${
              currentScreen === 'history'
                ? 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
