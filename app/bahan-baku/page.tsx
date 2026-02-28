'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, ArrowDownToLine, ArrowUpFromLine, Search, Edit3, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function BahanBaku() {
  const { state, addMaterial, updateMaterial, deleteMaterial, addMaterialTransaction, deleteMaterialTransaction } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTransactionConfirmId, setDeleteTransactionConfirmId] = useState<string | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    unit: 'gram',
    pricePerUnit: 0,
    stock: 0,
    minStock: 0,
  });

  const [newTransaction, setNewTransaction] = useState({
    quantity: 0,
    note: '',
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterialId) {
      updateMaterial(editingMaterialId, newMaterial);
    } else {
      addMaterial(newMaterial);
    }
    setShowAddModal(false);
    setEditingMaterialId(null);
    setNewMaterial({ name: '', unit: 'gram', pricePerUnit: 0, stock: 0, minStock: 0 });
  };

  const openEditModal = (materialId: string) => {
    const material = state.materials.find(m => m.id === materialId);
    if (!material) return;
    setEditingMaterialId(material.id);
    setNewMaterial({
      name: material.name,
      unit: material.unit,
      pricePerUnit: material.pricePerUnit,
      stock: material.stock,
      minStock: material.minStock,
    });
    setShowAddModal(true);
  };

  const handleDeleteMaterial = (materialId: string) => {
    setDeleteConfirmId(materialId);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId) return;
    addMaterialTransaction({
      materialId: selectedMaterialId,
      type: transactionType,
      quantity: newTransaction.quantity,
      date: new Date().toISOString(),
      note: newTransaction.note,
    });
    setShowTransactionModal(false);
    setNewTransaction({ quantity: 0, note: '' });
  };

  const filteredMaterials = state.materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStock = stockFilter === 'all' ? true : stockFilter === 'aman' ? m.stock > m.minStock : m.stock <= m.minStock;
    return matchSearch && matchStock;
  });

  const filteredTransactions = state.materialTransactions.filter(t => {
    const material = state.materials.find(m => m.id === t.materialId);
    const materialName = material?.name || 'Bahan Dihapus';
    const matchSearch = materialName.toLowerCase().includes(transactionSearch.toLowerCase()) || (t.note && t.note.toLowerCase().includes(transactionSearch.toLowerCase()));
    const matchType = transactionTypeFilter === 'all' ? true : t.type === transactionTypeFilter;
    return matchSearch && matchType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bahan Baku</h1>
          <p className="text-slate-500">Kelola stok dan harga bahan baku</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => { setTransactionType('in'); setShowTransactionModal(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Stok Masuk
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Bahan Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari bahan baku..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="aman">Stok Aman</option>
              <option value="menipis">Stok Menipis</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Nama Bahan</th>
                <th className="p-4 font-medium">Stok</th>
                <th className="p-4 font-medium">Harga / Satuan</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{material.name}</td>
                  <td className="p-4">
                    <span className="font-medium">{material.stock}</span> <span className="text-slate-500 text-sm">{material.unit}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {formatCurrency(material.pricePerUnit)} <span className="text-sm">/ {material.unit}</span>
                  </td>
                  <td className="p-4">
                    {material.stock <= material.minStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Aman
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          setSelectedMaterialId(material.id);
                          setTransactionType('out');
                          setShowTransactionModal(true);
                        }}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Pakai
                      </button>
                      <button 
                        onClick={() => openEditModal(material.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Tidak ada bahan baku yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900">Riwayat Transaksi Bahan Baku</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari riwayat..." 
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="relative sm:w-36">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
              >
                <option value="all">Semua Jenis</option>
                <option value="in">Masuk</option>
                <option value="out">Keluar</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Bahan Baku</th>
                <th className="p-4 font-medium">Jenis</th>
                <th className="p-4 font-medium">Jumlah</th>
                <th className="p-4 font-medium">Catatan</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.slice().reverse().map((transaction) => {
                const material = state.materials.find(m => m.id === transaction.materialId);
                return (
                  <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-600">
                      {format(new Date(transaction.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </td>
                    <td className="p-4 font-medium text-slate-900">{material?.name || 'Bahan Dihapus'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'in' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {transaction.type === 'in' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} <span className="text-slate-500 text-sm font-normal">{material?.unit}</span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{transaction.note || '-'}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setDeleteTransactionConfirmId(transaction.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada riwayat transaksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden my-auto shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingMaterialId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</h2>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bahan</label>
                <input required type="text" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" placeholder="Contoh: Tepung Terigu Segitiga Biru" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                  <select value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white">
                    <option value="gram">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Pcs / Butir</option>
                    <option value="liter">Liter (L)</option>
                    <option value="ml">Mililiter (ml)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga per Satuan</label>
                  <input required type="number" min="0" value={newMaterial.pricePerUnit || ''} onChange={e => setNewMaterial({...newMaterial, pricePerUnit: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" placeholder="Rp" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                  <input required type="number" min="0" value={newMaterial.stock || ''} onChange={e => setNewMaterial({...newMaterial, stock: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batas Minimum Stok</label>
                  <input required type="number" min="0" value={newMaterial.minStock || ''} onChange={e => setNewMaterial({...newMaterial, minStock: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingMaterialId(null); setNewMaterial({ name: '', unit: 'gram', pricePerUnit: 0, stock: 0, minStock: 0 }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden my-auto shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {transactionType === 'in' ? 'Stok Masuk (Beli)' : 'Stok Keluar (Pakai)'}
              </h2>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Bahan Baku</label>
                <select required value={selectedMaterialId} onChange={e => setSelectedMaterialId(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white">
                  <option value="" disabled>-- Pilih Bahan --</option>
                  {state.materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.stock} {m.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input required type="number" min="0.1" step="any" value={newTransaction.quantity || ''} onChange={e => setNewTransaction({...newTransaction, quantity: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                <input type="text" value={newTransaction.note} onChange={e => setNewTransaction({...newTransaction, note: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" placeholder={transactionType === 'in' ? 'Contoh: Beli di pasar' : 'Contoh: Tumpah / Rusak'} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTransactionModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className={`px-4 py-2 text-white rounded-xl font-medium transition-colors ${transactionType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Material Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus bahan baku ini? Semua riwayat transaksi dan resep terkait juga akan dihapus.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteMaterial(deleteConfirmId); 
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

      {/* Delete Transaction Confirm Modal */}
      {deleteTransactionConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Transaksi</h3>
            <p className="text-slate-600 mb-6">Hapus riwayat transaksi ini? Stok bahan baku akan dikembalikan seperti semula.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTransactionConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteMaterialTransaction(deleteTransactionConfirmId); 
                  setDeleteTransactionConfirmId(null); 
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
