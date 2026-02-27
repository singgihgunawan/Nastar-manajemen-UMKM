import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-slate-600 mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
      <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
