"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Kullanıcı bilgilerini backend'den çekiyoruz
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Token geçersizse çıkış yaptır
        handleLogout();
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sol Menü (Sidebar) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">AradığınıBul</span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Panel" active />
            <NavItem icon={<Package size={20} />} label="Ürünlerim" />
            <NavItem icon={<Users size={20} />} label="Müşteriler" />
            <NavItem icon={<Settings size={20} />} label="Ayarlar" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-red-600 font-bold transition-colors w-full"
          >
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1">
        {/* Üst Bar */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Sipariş veya ürün ara..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={22} />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] text-slate-400 font-medium">B2B Yöneticisi</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* İçerik Alanı */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Hoş Geldin, {user?.first_name}! 👋</h1>
            <p className="text-slate-500 mt-1">İşletmenizin bugünkü özetine göz atın.</p>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Toplam Sipariş" value="128" color="bg-blue-600" />
            <StatCard title="Aktif Ürünler" value="1,042" color="bg-emerald-500" />
            <StatCard title="Bekleyen Talepler" value="12" color="bg-amber-500" />
          </div>
        </div>
      </main>
    </div>
  );
}

// Yardımcı Bileşenler
function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}>
      {icon} {label}
    </a>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-4xl font-black text-slate-900">{value}</h3>
        <div className={`${color} p-2 rounded-lg text-white`}>
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}