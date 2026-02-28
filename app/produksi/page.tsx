'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, ChefHat, Info, Trash2, Search, Filter } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Produksi() {
  const { state, addProduction, deleteProduction } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [newProduction, setNewProduction] = useState({
    productId: '',
    quantity: 1,
  });

  const selectedProduct = state.products.find(p => p.id === newProduction.productId);
  const selectedRecipe = state.recipes.find(r => r.productId === newProduction.productId);

  // Calculate costs and check stock
  let totalCost = 0;
  let canProduce = true;
  const materialsNeeded: any[] = [];

  if (selectedRecipe) {
    const multiplier = newProduction.quantity / (selectedRecipe.yield || 1);
    selectedRecipe.items.forEach(item => {
      const material = state.materials.find(m => m.id === item.materialId);
      if (material) {
        const totalNeeded = item.quantity * multiplier;
        const cost = totalNeeded * material.pricePerUnit;
        totalCost += cost;
        
        const isEnough = material.stock >= totalNeeded;
        if (!isEnough) canProduce = false;

        materialsNeeded.push({
          name: material.name,
          needed: totalNeeded,
          unit: material.unit,
          stock: material.stock,
          isEnough,
          cost
        });
      }
    });
  }

  const handleAddProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduction.productId || !canProduce) return;

    addProduction({
      productId: newProduction.productId,
      quantity: newProduction.quantity,
      date: new Date().toISOString(),
      totalCost,
      costPerUnit: totalCost / newProduction.quantity,
    });

    setShowAddModal(false);
    setNewProduction({ productId: '', quantity: 1 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredProductions = state.productions.filter(prod => {
    const product = state.products.find(p => p.id === prod.productId);
    const productName = product?.name || 'Produk Dihapus';
    const matchSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const date = parseISO(prod.date);
    let matchDate = true;
    if (dateFilter === 'today') matchDate = isToday(date);
    if (dateFilter === 'week') matchDate = isThisWeek(date, { weekStartsOn: 1 });
    if (dateFilter === 'month') matchDate = isThisMonth(date);
    
    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produksi Nastar</h1>
          <p className="text-slate-500">Catat produksi harian dan hitung HPP</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
        >
          <ChefHat className="w-4 h-4" />
          Mulai Produksi
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari produk..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Riwayat Produksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Produk</th>
                <th className="p-4 font-medium text-center">Jumlah</th>
                <th className="p-4 font-medium text-right">Total Biaya Bahan</th>
                <th className="p-4 font-medium text-right">HPP / Satuan</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProductions.slice().reverse().map((prod) => {
                const product = state.products.find(p => p.id === prod.productId);
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-600">
                      {format(new Date(prod.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </td>
                    <td className="p-4 font-medium text-slate-900">{product?.name || 'Produk Dihapus'}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{prod.quantity}</td>
                    <td className="p-4 text-right text-slate-600">{formatCurrency(prod.totalCost)}</td>
                    <td className="p-4 text-right font-medium text-slate-900">{formatCurrency(prod.costPerUnit)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setDeleteConfirmId(prod.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProductions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada riwayat produksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden my-auto md:my-8 shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Catat Produksi Baru</h2>
            </div>
            <form onSubmit={handleAddProduction} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Produk (Resep)</label>
                  <select 
                    required 
                    value={newProduction.productId} 
                    onChange={e => setNewProduction({...newProduction, productId: e.target.value})} 
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- Pilih Produk --</option>
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                {newProduction.productId && !selectedRecipe && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-start gap-2 text-sm">
                    <Info className="w-5 h-5 shrink-0" />
                    <p>Produk ini belum memiliki resep. Silakan atur resep di menu Produk Jadi terlebih dahulu.</p>
                  </div>
                )}

                {selectedRecipe && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Produksi (Toples/Pcs)</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={newProduction.quantity || ''} 
                      onChange={e => setNewProduction({...newProduction, quantity: Number(e.target.value)})} 
                      className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-lg font-bold" 
                    />
                  </div>
                )}
              </div>

              {selectedRecipe && materialsNeeded.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Kebutuhan Bahan Baku:</h3>
                  <div className="space-y-2">
                    {materialsNeeded.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{m.name}</span>
                        <div className="text-right">
                          <span className={`font-medium ${m.isEnough ? 'text-slate-900' : 'text-red-600'}`}>
                            {m.needed} {m.unit}
                          </span>
                          {!m.isEnough && (
                            <p className="text-[10px] text-red-500">Stok: {m.stock} {m.unit}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200 mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">Estimasi Biaya Bahan:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">HPP per Satuan:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(totalCost / newProduction.quantity)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button 
                  type="submit" 
                  disabled={!canProduce || !selectedRecipe}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus riwayat produksi ini? Stok produk akan dikurangi dan stok bahan baku akan dikembalikan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteProduction(deleteConfirmId); 
                  setDeleteConfirmId(null); 
                }} 
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
