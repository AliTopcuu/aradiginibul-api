"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, Users, Settings, 
  LogOut, Search, Bell, ChevronRight, Loader2 
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 🔑 1. Kontrol: Token yoksa direkt login'e at
    if (!token) {
      router.push('/login');
      return;
    }

    // 🔑 2. Kontrol: Backend'den kullanıcıyı çek, hata alırsan yine de sayfayı göster
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.warn("Kullanıcı detayları alınamadı, genel profil gösteriliyor.");
        // Eğer backend'de /me ucu henüz yoksa hata vermemesi için varsayılan bir isim atayalım
        setUser({ first_name: "Değerli", last_name: "İş Ortağımız" });
      })
      .finally(() => {
        setLoading(false); // Her durumda yükleme ekranını kapat
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Yükleme ekranı tasarımı
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      <p className="text-slate-500 font-bold animate-pulse">Panel Hazırlanıyor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Sol Menü */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">AradığınıBul</span>
          </div>

          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard size={20} />} label="Panel" active />
            <NavItem icon={<Package size={20} />} label="Ürün Kataloğu" />
            <NavItem icon={<Users size={20} />} label="Siparişlerim" />
            <NavItem icon={<Settings size={20} />} label="Hesap Ayarları" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-600 font-bold transition-all w-full group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-y-auto">
        {/* Üst Header */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">Yönetim Paneli</h2>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter mt-1">Onaylı Bayi</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Dashoard İçeriği */}
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hoş Geldin, {user?.first_name}! 👋</h1>
            <p className="text-slate-500 mt-2 font-medium">Railway PostgreSQL üzerindeki verilerinle panelin hazır.</p>
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Aktif Stok" value="452" desc="Ürünleriniz satışa hazır" />
            <StatCard title="Bakiye" value="₺12.450" desc="Kullanılabilir kredi" />
            <StatCard title="Son Sipariş" value="Bugün" desc="2 saat önce güncellendi" />
          </div>

          {/* Alt Kısım Boşluğu */}
          <div className="mt-12 bg-white border border-slate-100 rounded-[2rem] p-12 text-center shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Henüz Siparişiniz Yok</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Kataloğa göz atarak işletmeniz için toptan sipariş vermeye başlayabilirsiniz.</p>
            <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
              Ürünleri Keşfet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Yardımcı Bileşenler
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