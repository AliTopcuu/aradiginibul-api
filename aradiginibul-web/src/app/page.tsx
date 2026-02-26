"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings, LogOut, Search, Bell, Loader2, ChevronRight } from 'lucide-react';
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
        // Backend'den gelen verileri state'e aktar
        setUser({
          firstName: res.data.first_name,
          lastName: res.data.last_name
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">AradığınıBul</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Panel" active />
          <NavItem icon={<Package size={20} />} label="Ürün Kataloğu" />
          <NavItem icon={<Users size={20} />} label="Siparişlerim" />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-600 font-bold transition-colors mt-auto pt-6 border-t border-slate-100">
          <LogOut size={20} /> Çıkış Yap
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">B2B Bayi Portalı</div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 tracking-tighter">Onaylı Bayi</p>
            </div>
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100 uppercase">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden mb-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-50"></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
                Hoş Geldin, <span className="text-blue-600">{user?.firstName}!</span> 👋
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                PostgreSQL üzerindeki profil bilgileriniz ve işletme verileriniz başarıyla senkronize edildi.
              </p>
              <div className="mt-10 flex gap-4">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Yeni Ürün Ekle</button>
                <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">Siparişler</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Aktif Stok" value="452" desc="Ürünleriniz satışta" />
            <StatCard title="Bakiye" value="₺12.450" desc="Kullanılabilir kredi" />
            <StatCard title="Bildirim" value="2 Yeni" desc="Son 24 saat" />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <button className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm w-full transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
    }`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-blue-600 transition-colors">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{value}</h3>
      <p className="text-sm text-slate-400 font-medium">{desc}</p>
    </div>
  );
}