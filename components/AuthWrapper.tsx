'use client';

import { useAppContext } from '../app/context/AppContext';
import { Cookie } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, authLoading, login } = useAppContext();

  // If Firebase is not configured, bypass authentication
  if (!isFirebaseConfigured) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Cookie className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">NastarKu</h1>
          <p className="text-slate-500 mb-8">Masuk untuk mengelola usaha kue Anda dengan aman dan tersinkronisasi.</p>
          <button 
            onClick={login} 
            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
