'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ChefHat, Cookie, ShoppingCart, Wallet, LogOut, Settings } from 'lucide-react';
import { useAppContext } from '../app/context/AppContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Produksi', href: '/produksi', icon: ChefHat },
  { name: 'Bahan Baku', href: '/bahan-baku', icon: Package },
  { name: 'Produk Jadi', href: '/produk', icon: Cookie },
  { name: 'Penjualan', href: '/penjualan', icon: ShoppingCart },
  { name: 'Keuangan', href: '/keuangan', icon: Wallet },
  { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, state } = useAppContext();
  const appSettings = state.appSettings || { appName: 'NastarKu', appTagline: 'Manajemen UMKM Kue' };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {appSettings.appIconUrl ? (
            <img src={appSettings.appIconUrl} alt="App Icon" className="w-10 h-10 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
              {appSettings.appName.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-slate-900 truncate leading-tight">{appSettings.appName}</h1>
            {appSettings.appTagline && (
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">{appSettings.appTagline}</p>
            )}
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 py-3 rounded-xl transition-colors px-4 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      )}
    </aside>
  );
}
