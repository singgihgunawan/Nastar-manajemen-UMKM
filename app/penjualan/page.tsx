'use client';

import { useState } from 'react';
import { useAppContext, SaleItem } from '../context/AppContext';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle2, Edit3, Search, Filter } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Penjualan() {
  const { state, addSale, updateSale, deleteSale } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [completeConfirmId, setCompleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [newSale, setNewSale] = useState({
    customerName: '',
    paymentMethod: 'Cash',
    status: 'Selesai' as 'Selesai' | 'Pre-Order',
    source: 'Offline',
    deliveryDate: '',
  });

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (editingSaleId) {
      updateSale(editingSaleId, {
        customerName: newSale.customerName || 'Pelanggan Umum',
        items: cartItems,
        totalPrice,
        paymentMethod: newSale.paymentMethod,
        status: newSale.status,
        source: newSale.source,
        deliveryDate: newSale.status === 'Pre-Order' ? newSale.deliveryDate : undefined,
      });
    } else {
      addSale({
        customerName: newSale.customerName || 'Pelanggan Umum',
        date: new Date().toISOString(),
        items: cartItems,
        totalPrice,
        paymentMethod: newSale.paymentMethod,
        status: newSale.status,
        source: newSale.source,
        deliveryDate: newSale.status === 'Pre-Order' ? newSale.deliveryDate : undefined,
      });
    }

    setShowAddModal(false);
    setEditingSaleId(null);
    setNewSale({ customerName: '', paymentMethod: 'Cash', status: 'Selesai', source: 'Offline', deliveryDate: '' });
    setCartItems([]);
  };

  const openEditModal = (saleId: string) => {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;

    setEditingSaleId(sale.id);
    setNewSale({
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      status: sale.status || 'Selesai',
      source: sale.source || 'Offline',
      deliveryDate: sale.deliveryDate || '',
    });
    setCartItems([...sale.items]);
    setShowAddModal(true);
  };

  const addToCart = (productId: string, price?: number, priceName: string = 'Normal') => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const itemPrice = price !== undefined ? price : product.price;

    const existingIndex = cartItems.findIndex(item => item.productId === productId && item.priceName === priceName);
    if (existingIndex >= 0) {
      const existing = cartItems[existingIndex];
      if (newSale.status === 'Selesai' && existing.quantity >= product.stock) return; // Prevent overselling only if Selesai
      const newCart = [...cartItems];
      newCart[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
      setCartItems(newCart);
    } else {
      if (newSale.status === 'Selesai' && product.stock <= 0) return;
      setCartItems([...cartItems, { productId, quantity: 1, price: itemPrice, priceName }]);
    }
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    const item = cartItems[index];
    if (!item) return;
    const product = state.products.find(p => p.id === item.productId);
    if (!product || quantity < 1) return;
    if (newSale.status === 'Selesai' && quantity > product.stock) return;

    const newCart = [...cartItems];
    newCart[index] = { ...item, quantity };
    setCartItems(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const uniqueCustomers = Array.from(
    new Set(state.sales.map(s => s.customerName).filter(name => name && name !== 'Pelanggan Umum'))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredSalesHistory = state.sales.filter(sale => {
    const matchSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true : sale.status === statusFilter;
    
    const date = parseISO(sale.date);
    let matchDate = true;
    if (dateFilter === 'today') matchDate = isToday(date);
    if (dateFilter === 'week') matchDate = isThisWeek(date, { weekStartsOn: 1 });
    if (dateFilter === 'month') matchDate = isThisMonth(date);
    
    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Penjualan</h1>
          <p className="text-slate-500">Catat transaksi dan cetak struk</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Transaksi Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari pelanggan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-3 sm:w-auto w-full">
          <div className="relative flex-1 sm:w-40">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Pre-Order">Pre-Order</option>
            </select>
          </div>
          <div className="relative flex-1 sm:w-40">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Pelanggan</th>
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Status & Sumber</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium text-center">Pembayaran</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSalesHistory.slice().reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600">
                    {format(new Date(sale.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </td>
                  <td className="p-4 font-medium text-slate-900">{sale.customerName}</td>
                  <td className="p-4 text-slate-600">
                    {sale.items.reduce((acc, item) => acc + item.quantity, 0)} pcs
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.status === 'Pre-Order' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sale.status || 'Selesai'}
                      </span>
                      <span className="text-xs text-slate-500">{sale.source || 'Offline'}</span>
                      {sale.status === 'Pre-Order' && sale.deliveryDate && (
                        <span className="text-[10px] text-amber-600">Kirim: {format(new Date(sale.deliveryDate), 'dd MMM yyyy', { locale: id })}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(sale.totalPrice)}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(sale.id)}
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center justify-end gap-1"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => setShowReceipt(sale.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-end gap-1"
                        >
                          <Printer className="w-4 h-4" /> Struk
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(sale.id)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center justify-end gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {sale.status === 'Pre-Order' && (
                        <button
                          onClick={() => setCompleteConfirmId(sale.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-end gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Selesaikan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSalesHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[80vh] my-auto">
            
            {/* Product List (Left side) */}
            <div className="flex-none h-[50vh] md:h-auto md:flex-1 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50">
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-lg font-bold text-slate-900">Pilih Produk</h2>
                <button onClick={() => setShowAddModal(false)} className="md:hidden text-slate-400 hover:text-slate-600 font-medium">Tutup</button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 gap-3 content-start">
                {state.products.map(product => (
                  <div
                    key={product.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col ${
                      product.stock > 0 
                        ? 'bg-white border-slate-200' 
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="text-slate-500">Stok:</span>
                      <span className={`font-bold ${product.stock > 0 ? 'text-slate-700' : 'text-red-500'}`}>
                        {product.stock}
                      </span>
                    </div>
                    <div className="mt-auto space-y-1">
                      <button 
                        onClick={() => addToCart(product.id, product.price, 'Normal')}
                        disabled={product.stock <= 0}
                        className="w-full text-left px-2 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex justify-between items-center disabled:cursor-not-allowed"
                      >
                        <span>Normal</span>
                        <span className="font-bold">{formatCurrency(product.price)}</span>
                      </button>
                      {product.wholesalePrices?.map((wp, i) => (
                        <button 
                          key={i}
                          onClick={() => addToCart(product.id, wp.price, wp.name)}
                          disabled={product.stock <= 0}
                          className="w-full text-left px-2 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex justify-between items-center disabled:cursor-not-allowed"
                        >
                          <span className="truncate mr-1">{wp.name}</span>
                          <span className="font-bold shrink-0">{formatCurrency(wp.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart & Checkout (Right side) */}
            <div className="w-full md:w-96 flex flex-col bg-white shrink-0 flex-none md:flex-auto">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-slate-900">Keranjang</h2>
                <button onClick={() => setShowAddModal(false)} className="hidden md:block text-slate-400 hover:text-slate-600 font-medium">Batal</button>
              </div>
              
              <div className="flex-none md:flex-1 overflow-y-auto p-4 space-y-3 max-h-[40vh] md:max-h-none">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                    <p>Keranjang kosong</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => {
                    const product = state.products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                        <div className="flex-1 pr-2">
                          <p className="font-medium text-slate-900 text-sm line-clamp-1">{product?.name}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-600 text-xs font-medium">{formatCurrency(item.price)}</span>
                            {item.priceName && item.priceName !== 'Normal' && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">{item.priceName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            max={product?.stock}
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(index, parseInt(e.target.value))}
                            className="w-12 text-center p-1 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                          />
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(cartTotal)}</span>
                </div>
                
                <form onSubmit={handleAddSale} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      list="customer-list"
                      placeholder="Nama Pelanggan (Opsional)" 
                      value={newSale.customerName}
                      onChange={e => setNewSale({...newSale, customerName: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white"
                    />
                    <datalist id="customer-list">
                      {uniqueCustomers.map((name, i) => (
                        <option key={i} value={name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={newSale.status}
                      onChange={e => {
                        const newStatus = e.target.value as 'Selesai' | 'Pre-Order';
                        setNewSale({...newSale, status: newStatus});
                        // If changing to Selesai, we might need to check stock again, but for now we just let it be
                      }}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Selesai">Selesai (Ready)</option>
                      <option value="Pre-Order">Pre-Order (PO)</option>
                    </select>
                    <select 
                      value={newSale.source}
                      onChange={e => setNewSale({...newSale, source: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Offline">Toko / Offline</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Shopee">Shopee</option>
                      <option value="Tokopedia">Tokopedia</option>
                      <option value="GoFood">GoFood</option>
                      <option value="GrabFood">GrabFood</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  {newSale.status === 'Pre-Order' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Pengiriman / Ambil</label>
                      <input 
                        required
                        type="date" 
                        value={newSale.deliveryDate}
                        onChange={e => setNewSale({...newSale, deliveryDate: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                  <div>
                    <select 
                      value={newSale.paymentMethod}
                      onChange={e => setNewSale({...newSale, paymentMethod: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Cash">Tunai (Cash)</option>
                      <option value="Transfer">Transfer Bank</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={cartItems.length === 0}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Simpan Transaksi
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto print:p-0 print:bg-transparent">
          <div id="receipt-print-area" className="bg-white rounded-xl w-full max-w-sm overflow-hidden flex flex-col my-auto print:w-[58mm] print:shadow-none print:rounded-none">
            <div className="p-6 flex-1 text-center border-b border-slate-100 border-dashed print:p-2 print:border-none">
              <h2 className="text-xl font-bold text-slate-900 mb-1 print:text-sm">NastarKu</h2>
              <p className="text-xs text-slate-500 mb-6 print:mb-2 print:text-[10px]">Struk Penjualan</p>
              
              {(() => {
                const sale = state.sales.find(s => s.id === showReceipt);
                if (!sale) return null;
                return (
                  <div className="text-left text-sm space-y-4 print:space-y-2 print:text-[10px]">
                    <div className="flex justify-between text-xs text-slate-500 print:text-[10px] print:text-black">
                      <span>{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</span>
                      <span>{sale.customerName}</span>
                    </div>
                    
                    <div className="border-t border-b border-slate-100 border-dashed py-3 space-y-2 print:py-1 print:space-y-1 print:border-black">
                      {sale.items.map((item, i) => {
                        const product = state.products.find(p => p.id === item.productId);
                        return (
                          <div key={i} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-900 print:text-black">
                                {product?.name}
                                {item.priceName && item.priceName !== 'Normal' && ` (${item.priceName})`}
                              </p>
                              <p className="text-xs text-slate-500 print:text-black">{item.quantity} x {formatCurrency(item.price)}</p>
                            </div>
                            <span className="font-medium text-slate-900 print:text-black">{formatCurrency(item.quantity * item.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between items-center font-bold text-base print:text-xs print:text-black">
                      <span>Total</span>
                      <span>{formatCurrency(sale.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 print:text-[10px] print:text-black">
                      <span>Pembayaran</span>
                      <span>{sale.paymentMethod}</span>
                    </div>
                    <div className="text-center mt-6 print:mt-4 text-xs text-slate-500 print:text-[10px] print:text-black">
                      <p>Terima Kasih!</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="p-4 bg-slate-50 flex gap-2 no-print">
              <button 
                onClick={() => setShowReceipt(null)}
                className="flex-1 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteSale(deleteConfirmId); 
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

      {/* Complete Confirm Modal */}
      {completeConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Selesaikan Pesanan</h3>
            <p className="text-slate-600 mb-6">Tandai pesanan ini sebagai Selesai? Stok produk akan dikurangi.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCompleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  updateSale(completeConfirmId, { status: 'Selesai' }); 
                  setCompleteConfirmId(null); 
                }} 
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
              >
                Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
