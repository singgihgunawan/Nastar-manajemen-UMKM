'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ChefHat, Cookie, ShoppingCart, Wallet, Settings, ChevronUp } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, hasSubmenu: true },
  { name: 'Produksi', href: '/produksi', icon: ChefHat },
  { name: 'Bahan', href: '/bahan-baku', icon: Package },
  { name: 'Produk', href: '/produk', icon: Cookie },
  { name: 'Jual', href: '/penjualan', icon: ShoppingCart },
  { name: 'Set', href: '/pengaturan', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDashboardMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setShowDashboardMenu(false);
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      {/* Submenu for Dashboard */}
      {showDashboardMenu && (
        <div ref={menuRef} className="absolute bottom-full left-2 mb-2 bg-white rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-slate-100 p-2 w-48 flex flex-col gap-1 z-50">
          <Link href="/" className={`flex items-center gap-3 p-3 rounded-xl ${pathname === '/' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard className="w-5 h-5" />
            Ringkasan
          </Link>
          <Link href="/keuangan" className={`flex items-center gap-3 p-3 rounded-xl ${pathname === '/keuangan' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Wallet className="w-5 h-5" />
            Laporan Keuangan
          </Link>
        </div>
      )}

      <nav className="flex items-center px-2 py-2 overflow-x-auto hide-scrollbar gap-1">
        {navItems.map((item) => {
          const isActive = item.hasSubmenu ? (pathname === '/' || pathname === '/keuangan') : pathname === item.href;
          
          if (item.hasSubmenu) {
            return (
              <button
                key={item.name}
                onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                className={`flex flex-col items-center justify-center w-[72px] h-14 shrink-0 rounded-xl transition-colors relative ${
                  isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-medium flex items-center gap-0.5">
                  {item.name}
                  <ChevronUp className={`w-3 h-3 transition-transform ${showDashboardMenu ? 'rotate-180' : ''}`} />
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-[72px] h-14 shrink-0 rounded-xl transition-colors ${
                isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
