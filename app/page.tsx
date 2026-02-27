'use client';

import { useAppContext } from './context/AppContext';
import { PackageOpen, TrendingUp, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';
import { format, isToday, isThisMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard() {
  const { state } = useAppContext();

  // Calculate metrics
  const lowStockMaterials = state.materials.filter(m => m.stock <= m.minStock);
  const totalProducts = state.products.reduce((acc, p) => acc + p.stock, 0);
  
  const todaySales = state.sales.filter(s => isToday(new Date(s.date)));
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalPrice, 0);

  const thisMonthSales = state.sales.filter(s => isThisMonth(new Date(s.date)));
  const thisMonthRevenue = thisMonthSales.reduce((acc, s) => acc + s.totalPrice, 0);
  
  const thisMonthExpenses = state.expenses.filter(e => isThisMonth(new Date(e.date)));
  const thisMonthExpenseTotal = thisMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  const thisMonthProductions = state.productions.filter(p => isThisMonth(new Date(p.date)));
  const thisMonthProductionCost = thisMonthProductions.reduce((acc, p) => acc + p.totalCost, 0);

  const estimatedProfit = thisMonthRevenue - thisMonthExpenseTotal - thisMonthProductionCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Penjualan Hari Ini</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(todayRevenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">{todaySales.length} transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Estimasi Laba (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(estimatedProfit)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Pendapatan - Pengeluaran</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Stok Nastar (Siap Jual)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{totalProducts} Toples</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Dari {state.products.length} jenis produk</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Peringatan Stok Bahan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{lowStockMaterials.length} Item</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Perlu segera dibeli</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Bahan Baku Menipis
          </h3>
          {lowStockMaterials.length > 0 ? (
            <div className="space-y-3">
              {lowStockMaterials.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-red-600">Sisa: {m.stock} {m.unit} (Min: {m.minStock})</p>
                  </div>
                  <button className="text-sm font-medium text-red-700 hover:text-red-800">
                    Beli
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center">
              <PackageOpen className="w-12 h-12 text-slate-300 mb-2" />
              <p>Semua stok bahan baku aman.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Transaksi Terakhir</h3>
          {state.sales.length > 0 ? (
            <div className="space-y-3">
              {state.sales.slice(-5).reverse().map(sale => (
                <div key={sale.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{sale.customerName}</p>
                    <p className="text-xs text-slate-500">{format(new Date(sale.date), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(sale.totalPrice)}</p>
                    <p className="text-xs text-slate-500">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Belum ada transaksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
