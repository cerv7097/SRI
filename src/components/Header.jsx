import { LogOut, User, Settings } from 'lucide-react';

const Header = ({ user, onLogout, onSettings }) => {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
        <img src="/stucco-rite-logo.png" alt="Stucco Rite Inc. Logo" className="h-20 w-auto object-contain drop-shadow" />

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <User size={20} className="text-slate-500" />
              <div className="text-right">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onSettings}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
