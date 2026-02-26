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
  CreditCard,
  ShoppingCart,
  ArrowUpRight,
  Clock
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

    // Backend'den kullanıcı verilerini çek ve PostgreSQL senkronizasyonunu sağla
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

  // Mouse hareketini takip eden fonksiyon
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // RangeError hatasını önleyen güvenli baş harf oluşturucu
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
      {/* 🌊 MOUSE TAKİP EDEN DALGA EFEKTİ (Daha Belirgin) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.12), transparent 80%)`
        }}
      />

      {/* 🛠️ KURUMSAL SIDEBAR */}
      <aside className="relative z-20 w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic tracking-widest">B2B PORTAL</span>
        </div>
        
        <nav className="space-y-3 flex-1">
          <SidebarItem icon={<LayoutDashboard size={22} />} label="Genel Panel" active />
          <SidebarItem icon={<Package size={22} />} label="Ürün Yönetimi" />
          <SidebarItem icon={<ShoppingCart size={22} />} label="Siparişlerim" />
          <SidebarItem icon={<Users size={22} />} label="Bayi Ağı" />
          <SidebarItem icon={<CreditCard size={22} />} label="Finansal Rapor" />
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            className="flex items-center gap-3 text-slate-500 hover:text-red-500 font-bold transition-all w-full px-4 py-2"
          >
            <LogOut size={20} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* 🚀 ANA PANEL */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-white/5 h-24 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Sistem Çevrimiçi</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-right">
              <div>
                {/* PostgreSQL Verisi: Ali Topçu */}
                <p className="text-sm font-black text-white leading-none mb-1">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Premium Bayi</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10 transition-transform hover:scale-105">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD İÇERİĞİ */}
        <div className="p-10 max-w-7xl mx-auto space-y-10">
          {/* Karşılama Kartı */}
          <div className="bg-gradient-to-br from-blue-600/20 to-transparent backdrop-blur-3xl rounded-[3rem] border border-blue-500/20 p-16 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                Hoş Geldin, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {user?.first_name}!
                </span> 👋
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                PostgreSQL veritabanı ile anlık senkronizasyon sağlandı. Bayi portalınız üzerinden tüm stok ve finansal hareketlerinizi takip edebilirsiniz.
              </p>
            </div>
          </div>

          {/* İstatistikler Bölümü */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Aylık Ciro" value="₺84.250" trend="+14.2%" icon={<TrendingUp size={24} />} />
            <StatCard title="Aktif Stok" value="2.450 Ürün" trend="Güncel" icon={<Package size={24} />} />
            <StatCard title="Bekleyen Sipariş" value="12 Adet" trend="Acil" icon={<Clock size={24} />} />
          </div>

          {/* Örnek Tablo Alanı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="text-2xl font-black tracking-tight">Son Hareketler</h2>
              <button className="text-blue-400 font-bold text-sm hover:underline">Tümünü Gör</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ShoppingCart size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Yeni Sipariş #{i}4829</p>
                      <p className="text-xs text-slate-500 font-medium uppercase mt-1">24 Şubat 2026, 14:20</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-lg">₺1.450</span>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
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

function StatCard({ title, value, trend, icon }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/30 transition-all transform group-hover:scale-110">
        {icon}
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">{title}</p>
      <h3 className="text-4xl font-black text-white mb-3 tracking-tighter">{value}</h3>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {trend}
        </span>
        <span className="text-[10px] font-bold text-slate-600 uppercase">Anlık Veri</span>
      </div>
    </div>
  );
}