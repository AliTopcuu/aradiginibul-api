"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings, LogOut, Search, Bell, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Kullanıcı bilgilerini PostgreSQL'den çek
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Hata durumunda (Örn: /me ucu yoksa) varsayılan isimle aç
        setUser({ first_name: "İş Ortağımız", last_name: "" });
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      <p className="text-slate-500 font-bold animate-pulse">Panel Yükleniyor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl"><Package className="text-white w-5 h-5" /></div>
          <span className="font-black text-xl text-slate-900">AradığınıBul</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm w-full bg-blue-600 text-white shadow-lg shadow-blue-100"><LayoutDashboard size={20} /> Panel</button>
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm w-full text-slate-400 hover:bg-slate-50"><Package size={20} /> Ürünler</button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-600 font-bold mt-auto"><LogOut size={20} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase mt-1">Onaylı Bayi</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">{user?.first_name?.[0]}</div>
          </div>
        </header>

        <div className="p-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hoş Geldin, {user?.first_name}! 👋</h1>
          <p className="text-slate-500 mt-2 font-medium">B2B paneliniz kullanıma hazır.</p>
        </div>
      </main>
    </div>
  );
}