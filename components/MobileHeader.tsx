'use client';

import { useAppContext } from '../app/context/AppContext';
import { Cookie, LogOut } from 'lucide-react';

export function MobileHeader() {
  const { user, logout, state } = useAppContext();
  const appSettings = state.appSettings || { appName: 'NastarKu', appTagline: 'Manajemen UMKM Kue' };

  if (!user) return null;

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center gap-3 overflow-hidden">
        {appSettings.appIconUrl ? (
          <img src={appSettings.appIconUrl} alt="App Icon" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            {appSettings.appName.charAt(0)}
          </div>
        )}
        <div className="overflow-hidden">
          <h1 className="text-lg font-bold text-slate-900 truncate leading-tight">{appSettings.appName}</h1>
          {appSettings.appTagline && (
            <p className="text-[10px] text-slate-500 truncate leading-tight">{appSettings.appTagline}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
          {user.displayName?.charAt(0) || 'U'}
        </div>
        <button 
          onClick={logout} 
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          aria-label="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
