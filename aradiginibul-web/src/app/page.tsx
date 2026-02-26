"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  LogOut, 
  Loader2, 
  ShieldCheck, 
  BarChart3,
  Briefcase
} from 'lucide-react';
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

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser({ first_name: "İş Ortağımız", last_name: "" });
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  const getInitials = () => {
    if (!user?.first_name) return "?";
    return (user.first_name[0] + (user.last_name?.[0] || "")).toUpperCase();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005]">
      <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
    </div>
  );

  return (
    // 🎨 DAHA KARANLIK GEÇİŞ: Koyu Altın -> Yanık Turuncu -> Derin Bordo-Siyah
    <div className="min-h-screen w-full flex font-sans text-slate-200 bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed">
      
      {/* 🛠️ SIDEBAR - DAHA KOYU CAM EFEKTİ */}
      <aside className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 hidden lg:flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-white/10 p-2 rounded-xl border border-white/20 shadow-lg">
            <Briefcase className="text-amber-500 w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-white">Aradığını Bul</span>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Panel Özeti" active />
          <SidebarItem icon={<Package size={18} />} label="Ürünler" />
          <SidebarItem icon={<Users size={18} />} label="Bayiler" />
          <SidebarItem icon={<BarChart3 size={18} />} label="Raporlar" />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-white/40 hover:text-white font-bold text-xs transition-all mt-auto pt-6 border-t border-white/10 px-2 uppercase tracking-widest"
        >
          <LogOut size={16} /> Güvenli Çıkış
        </button>
      </aside>

      {/* 🚀 ANA İÇERİK */}
      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-600 w-4 h-4 opacity-70" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Satış Uygulaması AUT</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-none">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-amber-600/80 font-black uppercase mt-1 tracking-widest">Bayi Üyesi</p>
              </div>
              <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-500 font-black text-sm shadow-xl">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD İÇERİĞİ */}
        <div className="p-10 max-w-6xl mx-auto space-y-10">
          <div className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-16 shadow-2xl">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
              Hoş Geldin, <br />
              <span className="text-amber-500 italic">
                {user?.first_name}!
              </span> 👋
            </h1>
            <p className="text-lg text-white/50 font-medium max-w-2xl leading-relaxed italic">
              Güvenle çok al az öde mekanizması ile şirketinizin değerini arttırın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Günlük Ciro" value="₺42.850" trend="+%12" />
            <StatCard title="Stok Seviyesi" value="1.840" trend="Stabil" />
            <StatCard title="Aktif İşlemler" value="12" trend="Normal" />
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: any) {
  return (
    <button className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest w-full transition-all ${
      active 
      ? 'bg-amber-600 text-white shadow-xl' 
      : 'text-white/40 hover:bg-white/10 hover:text-white'
    }`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, trend }: any) {
  return (
    <div className="bg-black/20 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all shadow-lg">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{title}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{value}</h3>
      <span className="text-[10px] font-black px-2 py-1 rounded bg-white/5 text-amber-500 border border-white/10 uppercase">
        {trend}
      </span>
    </div>
  );
}