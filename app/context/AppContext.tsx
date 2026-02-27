'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, setDoc, getDoc, isFirebaseConfigured } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export type Material = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  stock: number;
  minStock: number;
};

export type MaterialTransaction = {
  id: string;
  materialId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  note: string;
};

export type ProductPrice = {
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  wholesalePrices?: ProductPrice[];
  stock: number;
  imageUrl?: string;
};

export type RecipeItem = {
  materialId: string;
  quantity: number;
};

export type Recipe = {
  id: string;
  productId: string;
  yield: number;
  items: RecipeItem[];
};

export type Production = {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  totalCost: number;
  costPerUnit: number;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  price: number;
  priceName?: string;
};

export type Sale = {
  id: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  totalPrice: number;
  paymentMethod: string;
  status?: 'Selesai' | 'Pre-Order';
  source?: string;
  deliveryDate?: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
};

export type AppSettings = {
  appName: string;
  appTagline?: string;
  appIconUrl?: string;
};

type AppState = {
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  products: Product[];
  recipes: Recipe[];
  productions: Production[];
  sales: Sale[];
  expenses: Expense[];
  appSettings: AppSettings;
};

const initialState: AppState = {
  materials: [
    { id: 'm1', name: 'Tepung Terigu', unit: 'gram', pricePerUnit: 12, stock: 5000, minStock: 1000 },
    { id: 'm2', name: 'Mentega', unit: 'gram', pricePerUnit: 50, stock: 2000, minStock: 500 },
    { id: 'm3', name: 'Telur', unit: 'pcs', pricePerUnit: 2000, stock: 30, minStock: 10 },
    { id: 'm4', name: 'Selai Nanas', unit: 'gram', pricePerUnit: 40, stock: 1500, minStock: 500 },
    { id: 'm5', name: 'Gula Halus', unit: 'gram', pricePerUnit: 15, stock: 1000, minStock: 200 },
  ],
  materialTransactions: [],
  products: [
    { id: 'p1', name: 'Nastar Klasik (Toples 500g)', price: 85000, stock: 10 },
  ],
  recipes: [
    {
      id: 'r1',
      productId: 'p1',
      yield: 1,
      items: [
        { materialId: 'm1', quantity: 250 },
        { materialId: 'm2', quantity: 150 },
        { materialId: 'm3', quantity: 2 },
        { materialId: 'm4', quantity: 200 },
        { materialId: 'm5', quantity: 50 },
      ],
    },
  ],
  productions: [],
  sales: [],
  expenses: [],
  appSettings: {
    appName: 'NastarKu',
    appTagline: 'Manajemen UMKM Kue',
  },
};

type AppContextType = {
  state: AppState;
  user: User | null;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addMaterialTransaction: (transaction: Omit<MaterialTransaction, 'id'>) => void;
  deleteMaterialTransaction: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateRecipe: (productId: string, items: RecipeItem[], recipeYield: number) => void;
  addProduction: (production: Omit<Production, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  deleteProduction: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fallback to localStorage if Firebase is not configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem('nastarku_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Use setTimeout to avoid synchronous state update in effect
          setTimeout(() => {
            setState(parsed);
            setIsInitialLoad(false);
            setAuthLoading(false);
          }, 0);
          return;
        } catch (e) {
          console.error('Failed to parse saved data', e);
        }
      }
      setTimeout(() => {
        setIsInitialLoad(false);
        setAuthLoading(false);
      }, 0);
    }
  }, []);

  // Sync to localStorage if Firebase is not configured
  useEffect(() => {
    if (!isFirebaseConfigured && !isInitialLoad) {
      localStorage.setItem('nastarku_data', JSON.stringify(state));
    }
  }, [state, isInitialLoad]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setTimeout(() => {
        setAuthLoading(false);
      }, 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setState(docSnap.data() as AppState);
          } else {
            await setDoc(docRef, initialState);
            setState(initialState);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        // If logged out, try to load from local storage as fallback
        const saved = localStorage.getItem('nastarku_data');
        if (saved) {
          try {
            setState(JSON.parse(saved));
          } catch (e) {
            setState(initialState);
          }
        } else {
          setState(initialState);
        }
      }
      setIsInitialLoad(false);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialLoad && user && db && isFirebaseConfigured) {
      const syncData = async () => {
        try {
          // Add non-null assertion since we already checked db in the if condition
          const docRef = doc(db!, 'users', user.uid);
          await setDoc(docRef, state);
        } catch (error) {
          console.error("Error syncing data:", error);
        }
      };
      syncData();
    }
  }, [state, isInitialLoad, user]);

  const login = async () => {
    if (!isFirebaseConfigured || !auth) {
      alert("Firebase belum dikonfigurasi. Silakan tambahkan API Key di file .env");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const updateSettings = (settings: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      appSettings: { ...prev.appSettings, ...settings },
    }));
  };

  const addMaterial = (material: Omit<Material, 'id'>) => {
    setState((prev) => ({
      ...prev,
      materials: [...prev.materials, { ...material, id: generateId() }],
    }));
  };

  const updateMaterial = (id: string, material: Partial<Material>) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, ...material } : m)),
    }));
  };

  const deleteMaterial = (id: string) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
      materialTransactions: prev.materialTransactions.filter((t) => t.materialId !== id),
      recipes: prev.recipes.map(r => ({
        ...r,
        items: r.items.filter(item => item.materialId !== id)
      }))
    }));
  };

  const addMaterialTransaction = (transaction: Omit<MaterialTransaction, 'id'>) => {
    setState((prev) => {
      const newTransaction = { ...transaction, id: generateId() };
      const updatedMaterials = prev.materials.map((m) => {
        if (m.id === transaction.materialId) {
          const newStock = transaction.type === 'in' ? m.stock + transaction.quantity : m.stock - transaction.quantity;
          return { ...m, stock: newStock };
        }
        return m;
      });
      return {
        ...prev,
        materialTransactions: [...prev.materialTransactions, newTransaction],
        materials: updatedMaterials,
      };
    });
  };

  const deleteMaterialTransaction = (id: string) => {
    setState((prev) => {
      const transaction = prev.materialTransactions.find(t => t.id === id);
      if (!transaction) return prev;

      const updatedMaterials = prev.materials.map((m) => {
        if (m.id === transaction.materialId) {
          // Reverse the transaction: if it was 'in', subtract stock. If 'out', add stock.
          const newStock = transaction.type === 'in' ? m.stock - transaction.quantity : m.stock + transaction.quantity;
          return { ...m, stock: newStock };
        }
        return m;
      });

      return {
        ...prev,
        materialTransactions: prev.materialTransactions.filter(t => t.id !== id),
        materials: updatedMaterials,
      };
    });
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setState((prev) => ({
      ...prev,
      products: [...prev.products, { ...product, id: generateId() }],
    }));
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
    }));
  };

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      recipes: prev.recipes.filter((r) => r.productId !== id),
    }));
  };

  const updateRecipe = (productId: string, items: RecipeItem[], recipeYield: number) => {
    setState((prev) => {
      const existing = prev.recipes.find((r) => r.productId === productId);
      if (existing) {
        return {
          ...prev,
          recipes: prev.recipes.map((r) => (r.productId === productId ? { ...r, items, yield: recipeYield } : r)),
        };
      }
      return {
        ...prev,
        recipes: [...prev.recipes, { id: generateId(), productId, items, yield: recipeYield }],
      };
    });
  };

  const addProduction = (production: Omit<Production, 'id'>) => {
    setState((prev) => {
      const newProduction = { ...production, id: generateId() };
      
      // Update product stock
      const updatedProducts = prev.products.map((p) => 
        p.id === production.productId ? { ...p, stock: p.stock + production.quantity } : p
      );

      // Deduct materials
      const recipe = prev.recipes.find((r) => r.productId === production.productId);
      let updatedMaterials = [...prev.materials];
      const newTransactions: MaterialTransaction[] = [];

      if (recipe) {
        const multiplier = production.quantity / (recipe.yield || 1);
        recipe.items.forEach((item) => {
          const totalNeeded = item.quantity * multiplier;
          updatedMaterials = updatedMaterials.map((m) => 
            m.id === item.materialId ? { ...m, stock: m.stock - totalNeeded } : m
          );
          newTransactions.push({
            id: generateId(),
            materialId: item.materialId,
            type: 'out',
            quantity: totalNeeded,
            date: production.date,
            note: `Produksi ${production.quantity}x ${prev.products.find(p => p.id === production.productId)?.name}`,
          });
        });
      }

      return {
        ...prev,
        productions: [...prev.productions, newProduction],
        products: updatedProducts,
        materials: updatedMaterials,
        materialTransactions: [...prev.materialTransactions, ...newTransactions],
      };
    });
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    setState((prev) => {
      const newSale = { ...sale, id: generateId() };
      
      // Deduct product stock only if status is Selesai or undefined
      let updatedProducts = [...prev.products];
      if (sale.status === 'Selesai' || !sale.status) {
        sale.items.forEach((item) => {
          updatedProducts = updatedProducts.map((p) => 
            p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
          );
        });
      }

      return {
        ...prev,
        sales: [...prev.sales, newSale],
        products: updatedProducts,
      };
    });
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setState((prev) => {
      const existingSale = prev.sales.find(s => s.id === id);
      if (!existingSale) return prev;

      let updatedProducts = [...prev.products];
      
      // 1. Revert old stock if it was previously deducted
      if (existingSale.status === 'Selesai' || !existingSale.status) {
        existingSale.items.forEach((item) => {
          updatedProducts = updatedProducts.map((p) => 
            p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p
          );
        });
      }

      // 2. Apply new stock if the new status is Selesai
      const newStatus = updates.status !== undefined ? updates.status : existingSale.status;
      const newItems = updates.items !== undefined ? updates.items : existingSale.items;
      
      if (newStatus === 'Selesai' || !newStatus) {
        newItems.forEach((item) => {
          updatedProducts = updatedProducts.map((p) => 
            p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
          );
        });
      }

      return {
        ...prev,
        sales: prev.sales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        products: updatedProducts,
      };
    });
  };

  const deleteSale = (id: string) => {
    setState((prev) => {
      const existingSale = prev.sales.find(s => s.id === id);
      if (!existingSale) return prev;

      let updatedProducts = [...prev.products];
      
      // Revert stock if it was deducted
      if (existingSale.status === 'Selesai' || !existingSale.status) {
        existingSale.items.forEach((item) => {
          updatedProducts = updatedProducts.map((p) => 
            p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p
          );
        });
      }

      return {
        ...prev,
        sales: prev.sales.filter(s => s.id !== id),
        products: updatedProducts,
      };
    });
  };

  const deleteProduction = (id: string) => {
    setState((prev) => {
      const production = prev.productions.find(p => p.id === id);
      if (!production) return prev;

      // Revert product stock
      const updatedProducts = prev.products.map((p) => 
        p.id === production.productId ? { ...p, stock: p.stock - production.quantity } : p
      );

      // Revert materials
      const recipe = prev.recipes.find((r) => r.productId === production.productId);
      let updatedMaterials = [...prev.materials];
      
      if (recipe) {
        const multiplier = production.quantity / (recipe.yield || 1);
        recipe.items.forEach((item) => {
          const totalNeeded = item.quantity * multiplier;
          updatedMaterials = updatedMaterials.map((m) => 
            m.id === item.materialId ? { ...m, stock: m.stock + totalNeeded } : m
          );
        });
      }

      // Remove associated material transactions
      const notePrefix = `Produksi ${production.quantity}x`;
      const updatedTransactions = prev.materialTransactions.filter(t => 
        !(t.date === production.date && t.note.startsWith(notePrefix))
      );

      return {
        ...prev,
        productions: prev.productions.filter(p => p.id !== id),
        products: updatedProducts,
        materials: updatedMaterials,
        materialTransactions: updatedTransactions,
      };
    });
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: generateId() }],
    }));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  if (authLoading) return null; // Or a loading spinner

  return (
    <AppContext.Provider value={{
      state,
      user,
      authLoading,
      login,
      logout,
      updateSettings,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addMaterialTransaction,
      deleteMaterialTransaction,
      addProduct,
      updateProduct,
      deleteProduct,
      updateRecipe,
      addProduction,
      deleteProduction,
      addSale,
      updateSale,
      deleteSale,
      addExpense,
      updateExpense,
      deleteExpense,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
