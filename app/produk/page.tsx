'use client';

import { useState, useRef } from 'react';
import { useAppContext, RecipeItem, ProductPrice } from '../context/AppContext';
import { Plus, Cookie, Edit3, Trash2, Image as ImageIcon, Search, Filter } from 'lucide-react';

export default function Produk() {
  const { state, addProduct, updateProduct, updateRecipe, deleteProduct } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    wholesalePrices: [] as ProductPrice[],
    stock: 0,
    imageUrl: '',
  });

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [recipeYield, setRecipeYield] = useState<number>(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct(editingProductId, newProduct);
    } else {
      addProduct(newProduct);
    }
    setShowAddModal(false);
    setEditingProductId(null);
    setNewProduct({ name: '', price: 0, wholesalePrices: [], stock: 0, imageUrl: '' });
  };

  const openEditModal = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      wholesalePrices: product.wholesalePrices || [],
      stock: product.stock,
      imageUrl: product.imageUrl || '',
    });
    setShowAddModal(true);
  };

  const openRecipeModal = (productId: string) => {
    setSelectedProductId(productId);
    const existingRecipe = state.recipes.find(r => r.productId === productId);
    if (existingRecipe) {
      setRecipeItems(existingRecipe.items);
      setRecipeYield(existingRecipe.yield || 1);
    } else {
      setRecipeItems([]);
      setRecipeYield(1);
    }
    setShowRecipeModal(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    updateRecipe(selectedProductId, recipeItems, recipeYield);
    setShowRecipeModal(false);
  };

  const addRecipeItem = () => {
    setRecipeItems([...recipeItems, { materialId: '', quantity: 0 }]);
  };

  const updateRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
    const newItems = [...recipeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeItems(newItems);
  };

  const removeRecipeItem = (index: number) => {
    const newItems = [...recipeItems];
    newItems.splice(index, 1);
    setRecipeItems(newItems);
  };

  const addWholesalePrice = () => {
    setNewProduct({
      ...newProduct,
      wholesalePrices: [...newProduct.wholesalePrices, { name: '', price: 0 }]
    });
  };

  const updateWholesalePrice = (index: number, field: keyof ProductPrice, value: any) => {
    const newPrices = [...newProduct.wholesalePrices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setNewProduct({ ...newProduct, wholesalePrices: newPrices });
  };

  const removeWholesalePrice = (index: number) => {
    const newPrices = [...newProduct.wholesalePrices];
    newPrices.splice(index, 1);
    setNewProduct({ ...newProduct, wholesalePrices: newPrices });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredProducts = state.products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStock = stockFilter === 'all' ? true : stockFilter === 'in-stock' ? p.stock > 0 : p.stock <= 0;
    return matchSearch && matchStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produk Jadi</h1>
          <p className="text-slate-500">Kelola varian nastar dan resepnya</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
          >
            <option value="all">Semua Stok</option>
            <option value="in-stock">Tersedia</option>
            <option value="out-of-stock">Habis</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const recipe = state.recipes.find(r => r.productId === product.id);
          
          // Calculate HPP
          let hpp = 0;
          if (recipe) {
            recipe.items.forEach(item => {
              const material = state.materials.find(m => m.id === item.materialId);
              if (material) {
                hpp += item.quantity * material.pricePerUnit;
              }
            });
          }

          const profit = product.price - hpp;
          const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  ) : (
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                      <Cookie className="w-6 h-6" />
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                  {product.wholesalePrices && product.wholesalePrices.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {product.wholesalePrices.map((wp, i) => (
                        <div key={i} className="flex justify-between text-xs bg-slate-50 px-2 py-1 rounded">
                          <span className="text-slate-600">{wp.name}</span>
                          <span className="font-medium text-emerald-600">{formatCurrency(wp.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>HPP (Modal Bahan):</span>
                    <span className="font-medium text-slate-900">{recipe ? formatCurrency(hpp / (recipe.yield || 1)) : 'Belum diatur'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimasi Laba Kotor:</span>
                    <span className="font-medium text-emerald-600">{recipe ? formatCurrency(product.price - (hpp / (recipe.yield || 1))) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Margin:</span>
                    <span className="font-medium text-blue-600">{recipe ? `${(((product.price - (hpp / (recipe.yield || 1))) / product.price) * 100).toFixed(1)}%` : '-'}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => openRecipeModal(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Cookie className="w-4 h-4" />
                  {recipe ? 'Resep' : 'Buat Resep'}
                </button>
                <button 
                  onClick={() => openEditModal(product.id)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(product.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            <Cookie className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>Tidak ada produk yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden my-auto md:my-8 shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {newProduct.imageUrl ? (
                    <>
                      <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-medium">Upload Foto</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk (Varian)</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="Contoh: Nastar Keju 500g" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual (Normal)</label>
                <input required type="number" min="0" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="Rp" />
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-700">Harga Khusus (Opsional)</label>
                  <button type="button" onClick={addWholesalePrice} className="text-xs text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah Harga
                  </button>
                </div>
                {newProduct.wholesalePrices.map((wp, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input required type="text" placeholder="Nama (cth: Reseller)" value={wp.name} onChange={e => updateWholesalePrice(index, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white" />
                    </div>
                    <div className="flex-1">
                      <input required type="number" min="0" placeholder="Harga" value={wp.price || ''} onChange={e => updateWholesalePrice(index, 'price', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white" />
                    </div>
                    <button type="button" onClick={() => removeWholesalePrice(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newProduct.wholesalePrices.length === 0 && (
                  <p className="text-xs text-slate-500">Tambahkan harga khusus seperti harga reseller, grosir, dll.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal (Siap Jual)</label>
                <input required type="number" min="0" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingProductId(null); setNewProduct({ name: '', price: 0, wholesalePrices: [], stock: 0, imageUrl: '' }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-start md:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden my-auto md:my-8 shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Resep Bahan Baku</h2>
              <button onClick={() => setShowRecipeModal(false)} className="text-slate-400 hover:text-slate-600">Tutup</button>
            </div>
            <form onSubmit={handleSaveRecipe} className="p-6 space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
                Tentukan bahan baku yang dibutuhkan untuk membuat <strong>1 resep (adonan)</strong>, lalu tentukan berapa banyak produk yang dihasilkan dari 1 resep tersebut.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hasil Produksi (Yield)</label>
                <div className="flex items-center gap-2">
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    value={recipeYield || ''} 
                    onChange={e => setRecipeYield(Number(e.target.value))} 
                    className="w-32 p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" 
                  />
                  <span className="text-slate-600 text-sm">Produk dihasilkan dari 1 resep ini</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Daftar Bahan Baku</label>
                {recipeItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <select 
                        required 
                        value={item.materialId} 
                        onChange={e => updateRecipeItem(index, 'materialId', e.target.value)} 
                        className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                      >
                        <option value="" disabled>Pilih Bahan</option>
                        {state.materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input 
                        required 
                        type="number" 
                        min="0.1" 
                        step="any"
                        placeholder="Jumlah"
                        value={item.quantity || ''} 
                        onChange={e => updateRecipeItem(index, 'quantity', Number(e.target.value))} 
                        className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeRecipeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-0.5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addRecipeItem}
                className="flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 text-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Bahan
              </button>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowRecipeModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">Simpan Resep</button>
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
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus produk ini? Data resep terkait juga akan ikut terhapus.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
              <button 
                onClick={() => { 
                  deleteProduct(deleteConfirmId); 
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
