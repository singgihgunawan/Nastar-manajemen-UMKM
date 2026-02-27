'use client';

import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsIcon, Image as ImageIcon, Check, Database, Cloud, Info, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { isFirebaseConfigured } from '../../lib/firebase';

export default function Pengaturan() {
  const { state, updateSettings } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    appName: state.appSettings?.appName || 'NastarKu',
    appTagline: state.appSettings?.appTagline || '',
    appIconUrl: state.appSettings?.appIconUrl || '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, appIconUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Aplikasi</h1>
        <p className="text-slate-500">Sesuaikan tampilan aplikasi Anda</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-slate-700 mb-2">Ikon Aplikasi</label>
              <div 
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                {settings.appIconUrl ? (
                  <>
                    <img src={settings.appIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Ubah Ikon</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Upload Ikon</span>
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

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Usaha / Aplikasi</label>
                <input 
                  required 
                  type="text" 
                  value={settings.appName} 
                  onChange={e => setSettings({...settings, appName: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                  placeholder="Contoh: NastarKu" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tagline / Slogan</label>
                <input 
                  type="text" 
                  value={settings.appTagline} 
                  onChange={e => setSettings({...settings, appTagline: e.target.value})} 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                  placeholder="Contoh: Manajemen UMKM Kue" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5" />
                  Tersimpan
                </>
              ) : (
                <>
                  <SettingsIcon className="w-5 h-5" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              Sinkronisasi Cloud (Firebase)
            </h2>
            <p className="text-sm text-slate-500 mt-1">Simpan data Anda dengan aman di cloud agar tidak hilang dan bisa diakses dari perangkat lain.</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${isFirebaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isFirebaseConfigured ? (
              <><CheckCircle2 className="w-4 h-4" /> Terhubung</>
            ) : (
              <><AlertCircle className="w-4 h-4" /> Belum Dikonfigurasi</>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!isFirebaseConfigured && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3 items-start">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Saat ini aplikasi menggunakan <strong>Penyimpanan Lokal (Local Storage)</strong>. Data hanya tersimpan di browser perangkat ini dan akan hilang jika Anda membersihkan cache browser. Ikuti panduan di bawah untuk mengaktifkan Cloud Sync.</p>
            </div>
          )}

          <div className="space-y-4 text-sm text-slate-700">
            <h3 className="font-bold text-slate-900 text-base">Langkah-langkah Konfigurasi:</h3>
            
            <ol className="list-decimal list-inside space-y-3 ml-2">
              <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Firebase Console</a> dan login dengan akun Google Anda.</li>
              <li>Klik <strong>"Create a project"</strong> (Buat proyek), beri nama proyek (misal: NastarKu App), lalu ikuti langkahnya sampai selesai.</li>
              <li>Di halaman utama proyek, klik ikon <strong>Web (&lt;/&gt;)</strong> untuk menambahkan aplikasi web.</li>
              <li>Beri nama aplikasi web (misal: NastarKu Web), lalu klik <strong>"Register app"</strong>.</li>
              <li>Anda akan melihat blok kode berisi <code>firebaseConfig</code>. Biarkan halaman itu terbuka.</li>
              <li>Di menu sebelah kiri, buka <strong>Build &gt; Authentication</strong>, klik "Get Started", lalu aktifkan <strong>Google</strong> sebagai *Sign-in method*.</li>
              <li>Di menu sebelah kiri, buka <strong>Build &gt; Firestore Database</strong>, klik "Create database", pilih lokasi, dan mulai dalam <strong>Test mode</strong> (atau atur Rules agar aman).</li>
            </ol>

            <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 mb-3">Masukkan Environment Variables</h4>
              <p className="mb-4">Salin nilai dari <code>firebaseConfig</code> Anda dan masukkan ke dalam <strong>Environment Variables</strong> di platform AI Studio (atau file <code>.env</code> jika di lokal):</p>
              
              <div className="space-y-3">
                {[
                  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', desc: 'Nilai dari apiKey' },
                  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', desc: 'Nilai dari authDomain' },
                  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', desc: 'Nilai dari projectId' },
                  { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', desc: 'Nilai dari storageBucket' },
                  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', desc: 'Nilai dari messagingSenderId' },
                  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', desc: 'Nilai dari appId' }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg gap-3">
                    <div className="flex-1">
                      <code className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{item.key}</code>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleCopy(item.key, item.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                    >
                      {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === item.key ? 'Disalin!' : 'Salin Nama'}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500 italic">* Setelah menambahkan variabel di atas, aplikasi akan otomatis terhubung ke Firebase dan tombol Login Google akan muncul di halaman utama.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
