'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ChefHat, Cookie, ShoppingCart, Wallet, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Produksi', href: '/produksi', icon: ChefHat },
  { name: 'Bahan', href: '/bahan-baku', icon: Package },
  { name: 'Produk', href: '/produk', icon: Cookie },
  { name: 'Jual', href: '/penjualan', icon: ShoppingCart },
  { name: 'Uang', href: '/keuangan', icon: Wallet },
  { name: 'Set', href: '/pengaturan', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <nav className="flex items-center px-2 py-2 overflow-x-auto hide-scrollbar gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
