'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Wallet, TrendingUp, TrendingDown, Plus, Receipt, Edit3, Trash2, Search } from 'lucide-react';
import { format, isThisMonth, isThisWeek, isToday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Keuangan() {
  const { state, addExpense, updateExpense, deleteExpense } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'month' | 'week' | 'today'>('month');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expenseSearch, setExpenseSearch] = useState('');
  
  const [newExpense, setNewExpense] = useState({
    category: 'Lain-lain',
    amount: 0,
    note: '',
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpenseId) {
      updateExpense(editingExpenseId, newExpense);
    } else {
      addExpense({
        ...newExpense,
        date: new Date().toISOString(),
      });
    }
    setShowAddModal(false);
    setEditingExpenseId(null);
    setNewExpense({ category: 'Lain-lain', amount: 0, note: '' });
  };

  const openEditModal = (expenseId: string) => {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    setEditingExpenseId(expense.id);
    setNewExpense({
      category: expense.category,
      amount: expense.amount,
      note: expense.note || '',
    });
    setShowAddModal(true);
  };

  // Filter data based on selected period
  const filterDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (filter === 'today') return isToday(date);
    if (filter === 'week') return isThisWeek(date, { weekStartsOn: 1 });
    if (filter === 'month') return isThisMonth(date);
    return true; // 'all'
  };

  const filteredSales = state.sales.filter(s => filterDate(s.date));
  const filteredProductions = state.productions.filter(p => filterDate(p.date));
  const filteredExpenses = state.expenses.filter(e => filterDate(e.date));

  // Calculate totals
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalMaterialCost = filteredProductions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalOtherExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  const totalExpense = totalMaterialCost + totalOtherExpenses;
  const netProfit = totalRevenue - totalExpense;

  // Prepare chart data (group by date for the current filter)
  // For simplicity, we'll just show a summary chart if 'all' or 'month', otherwise daily
  const chartData = [
    {
      name: 'Ringkasan',
      Pemasukan: totalRevenue,
      Pengeluaran: totalExpense,
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const searchedExpenses = filteredExpenses.filter(e => 
    e.category.toLowerCase().includes(expenseSearch.toLowerCase()) || 
    (e.note && e.note.toLowerCase().includes(expenseSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan Keuangan</h1>
          <p className="text-slate-500">Pantau arus kas dan keuntungan usaha</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="flex-1 sm:flex-none p-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="all">Semua Waktu</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pemasukan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Dari {filteredSales.length} transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Bahan baku & biaya lain</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Keuntungan Bersih</p>
              <h3 className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-slate-500">Modal Bahan: <strong className="text-slate-700">{formatCurrency(totalMaterialCost)}</strong></span>
            <span className="text-slate-500">Biaya Lain: <strong className="text-slate-700">{formatCurrency(totalOtherExpenses)}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Grafik Pemasukan vs Pengeluaran</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rp${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-500" />
              Biaya Lain-lain
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari pengeluaran..." 
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
              />
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {searchedExpenses.slice().reverse().map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{expense.category}</p>
                  <p className="text-xs text-slate-500">{format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}</p>
                  {expense.note && <p className="text-xs text-slate-400 mt-1">{expense.note}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-red-600 text-sm">-{formatCurrency(expense.amount)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(expense.id)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(expense.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {searchedExpenses.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Tidak ada pengeluaran yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden my-auto shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingExpenseId ? 'Edit Pengeluaran' : 'Catat Pengeluaran Lain'}</h2>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select 
                  required 
                  value={newExpense.category} 
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none bg-white"
                >
                  <option value="Listrik & Air">Listrik & Air</option>
                  <option value="Gas / Bahan Bakar">Gas / Bahan Bakar</option>
                  <option value="Kemasan / Packaging">Kemasan / Packaging</option>
                  <option value="Gaji Karyawan">Gaji Karyawan</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Biaya</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={newExpense.amount || ''} 
                  onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none" 
                  placeholder="Rp" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  value={newExpense.note} 
                  onChange={e => setNewExpense({...newExpense, note: e.target.value})} 
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none" 
                  placeholder="Contoh: Beli gas 3kg 2 tabung" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingExpenseId(null); setNewExpense({ category: 'Lain-lain', amount: 0, note: '' }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors">Simpan Pengeluaran</button>
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
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus catatan pengeluaran ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteExpense(deleteConfirmId); 
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
