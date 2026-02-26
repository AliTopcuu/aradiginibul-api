"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  LogOut, 
  Loader2, 
  Bell, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Backend'den kullanıcı bilgilerini çek
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  // Mouse hareketini takip et
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Profil dairesi için güvenli baş harf oluşturucu
  const getInitials = () => {
    if (!user?.first_name) return "??";
    const first = user.first_name[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    </div>
  );

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-slate-950 flex font-sans text-white overflow-hidden"
    >
      {/* 🌊 MOUSE TAKİP EDEN DALGA EFEKTİ */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.08), transparent 80%)`
        }}
      />

      {/* 🛠️ SIDEBAR (SOL MENÜ) */}
      <aside className="relative z-20 w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">AradığınıBul</span>
        </div>
        
        <nav className="space-y-3 flex-1">
          <SidebarItem icon={<LayoutDashboard size={22} />} label="Genel Panel" active />
          <SidebarItem icon={<Package size={22} />} label="Ürün Kataloğu" />
          <SidebarItem icon={<Users size={22} />} label="Bayi Siparişleri" />
          <SidebarItem icon={<CreditCard size={22} />} label="Finansal Durum" />
        </nav>

        <div className="mt-auto">
          <div className="bg-white/5 rounded-3xl p-6 mb-6 border border-white/5">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Destek Hattı</p>
            <p className="text-sm font-medium text-slate-300">Yardıma mı ihtiyacınız var?</p>
            <button className="mt-3 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors">BİZE ULAŞIN →</button>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            className="flex items-center gap-3 text-slate-500 hover:text-red-500 font-bold transition-all w-full px-4 py-2"
          >
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* 🚀 ANA İÇERİK ALANI */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-white/5 h-24 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Güvenli Bayi Hattı</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 px-4">
              <Search className="text-slate-500 w-4 h-4" />
              <input type="text" placeholder="Hızlı ara..." className="bg-transparent border-none outline-none text-sm font-medium w-32 focus:w-48 transition-all" />
            </div>
            <div className="relative p-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950"></span>
            </div>
            <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-none group-hover:text-blue-400 transition-colors">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-tighter">Premium Bayi</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 border border-white/10 group-hover:scale-105 transition-transform">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD İÇERİĞİ */}
        <div className="p-10 max-w-7xl mx-auto space-y-10">
          {/* Karşılama Kartı */}
          <div className="bg-gradient-to-br from-blue-600/20 to-transparent backdrop-blur-3xl rounded-[3rem] border border-blue-500/20 p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black mb-6 border border-blue-500/20">
                <TrendingUp size={14} /> SİSTEM ÇEVRİMİÇİ
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                Hoş Geldin, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {user?.first_name}!
                </span> 👋
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                PostgreSQL üzerindeki işletme verileriniz ve stok bilgileriniz anlık olarak senkronize edildi. Satış paneliniz üzerinden yeni siparişlerinizi yönetebilirsiniz.
              </p>
              <div className="mt-12 flex flex-wrap gap-4">
                <button className="bg-white text-slate-950 px-10 py-5 rounded-[1.5rem] font-black hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95">
                  Ürün Kataloğunu Aç
                </button>
                <button className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-[1.5rem] font-black hover:bg-white/10 transition-all backdrop-blur-md">
                  Sipariş Geçmişi
                </button>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Günlük Satış" value="₺42.850" trend="+12%" />
            <StatCard title="Aktif Stok" value="1.240 Adet" trend="Stabil" />
            <StatCard title="Yeni Mesaj" value="4 Bildirim" trend="Kritik" />
          </div>
        </div>
      </main>
    </div>
  );
}

// Yardımcı Bileşenler
function SidebarItem({ icon, label, active = false }: any) {
  return (
    <button className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold text-sm w-full transition-all group ${
      active 
      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
      : 'text-slate-500 hover:bg-white/5 hover:text-white'
    }`}>
      <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ title, value, trend }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
        <TrendingUp size={48} />
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">{title}</p>
      <h3 className="text-4xl font-black text-white mb-3 tracking-tighter">{value}</h3>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
          {trend}
        </span>
        <span className="text-[10px] font-bold text-slate-600 uppercase">Son 24 Saat</span>
      </div>
    </div>
  );
}