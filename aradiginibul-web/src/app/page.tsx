"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, LogOut, Loader2, Bell, User } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    api.get('/auth/me')
      .then(res => {
        setUser(res.data); // Veritabanından gelen Ali Topçu verisi
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight uppercase">AradığınıBul</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm w-full bg-blue-600 text-white shadow-lg shadow-blue-100"><LayoutDashboard size={20} /> Panel</button>
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm w-full text-slate-400 hover:bg-slate-50 transition-all"><Package size={20} /> Ürünler</button>
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="flex items-center gap-3 text-slate-400 hover:text-red-600 font-bold mt-auto pt-6 border-t border-slate-100"><LogOut size={20} /> Çıkış Yap</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Yönetim Paneli</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase mt-1">Onaylı Bayi</p>
            </div>
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-blue-100">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden mb-8">
            <div className="relative z-10">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
                Hoş Geldin, <span className="text-blue-600">{user?.first_name}!</span> 👋
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                PostgreSQL üzerindeki profil bilgileriniz başarıyla senkronize edildi.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-4">Aktif Stok</p><h3 className="text-4xl font-black text-slate-900 mb-2">452</h3></div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-4">Bakiye</p><h3 className="text-4xl font-black text-slate-900 mb-2">₺12.450</h3></div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-4">Siparişler</p><h3 className="text-4xl font-black text-slate-900 mb-2">3 Yeni</h3></div>
          </div>
        </div>
      </main>
    </div>
  );
}