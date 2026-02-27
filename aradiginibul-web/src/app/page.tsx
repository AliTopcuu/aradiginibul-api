"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Package, 
  History, 
  CreditCard, 
  Search, 
  LogOut, 
  Loader2, 
  Store,
  ShoppingCart,
  MapPin,
  Plus,
  Info
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

// Örnek Ürün Listesi
const INITIAL_PRODUCTS = [
  { id: 1, name: "Endüstriyel Rulman Seti", price: 2450, stock: 45, category: "Yedek Parça", image: "⚙️" },
  { id: 2, name: "Yüksek Devirli Motor", price: 18200, stock: 12, category: "Makine", image: "⚡" },
  { id: 3, name: "Dijital Kumpas Pro", price: 850, stock: 120, category: "Ölçüm Aletleri", image: "📏" },
  { id: 4, name: "Çelik Dişli Takımı", price: 4100, stock: 8, category: "Donanım", image: "🔩" },
  { id: 5, name: "Lazer Hizalama Cihazı", price: 12750, stock: 5, category: "Optik", image: "🔴" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>(
    INITIAL_PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      return;
    }

    // Kullanıcı verilerini çek
    api.get('/auth/me').then((res) => {
      setUser(res.data);
      setLoading(false);
    }).catch(() => {
      setUser({ first_name: "Değerli", last_name: "Bayimiz", company_name: "AradığınıBul Partner" });
      setLoading(false);
    });

    // Sayfa açıldığında varsa eski sepeti yükle
    const savedCart = localStorage.getItem('cartData');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [router]);

  // 🛒 Sepete Miktarıyla Birlikte Ekleme
  const addToCart = (product: any) => {
    const amount = quantities[product.id] || 1;
    setCart((prevCart) => {
      let newCart;
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        newCart = prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + amount } : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: amount }];
      }
      // Veriyi diğer sayfaya aktarmak için kaydet
      localStorage.setItem('cartData', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleQuantityChange = (id: number, val: string) => {
    const num = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: isNaN(num) || num < 1 ? 1 : num }));
  };

  // Hesaplamalar
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Toplam adet sayacı

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005]">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-200 bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed">
      
      {/* 🛠️ SIDEBAR */}
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-amber-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Store className="text-[#1a0005] w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-white">AradığınıBul</span>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <SidebarItem icon={<Store size={18} />} label="Ürün Marketi" active />
          
          {/* 🛒 Sepete Yönlendirme */}
          <Link href="/cart">
            <SidebarItem 
              icon={<ShoppingCart size={18} />} 
              label="Sepetim" 
              count={totalItemCount > 0 ? totalItemCount.toString() : null} 
            />
          </Link>

          <div className="my-6 border-t border-white/10 pt-4">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 px-4">Hesabım</p>
            <SidebarItem icon={<History size={18} />} label="Siparişlerim" />
            <SidebarItem icon={<MapPin size={18} />} label="Adresler" />
            <SidebarItem icon={<CreditCard size={18} />} label="Kartlar & Finans" />
          </div>
        </nav>

        <button onClick={() => {localStorage.removeItem('token'); router.push("/login");}} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs mt-auto pt-6 border-t border-white/10 px-2 uppercase tracking-widest transition-all">
          <LogOut size={16} /> Güvenli Çıkış
        </button>
      </aside>

      {/* 🚀 ANA İÇERİK */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
          <div className="relative hidden md:block w-96">
            <Search className="absolute left-3 top-2.5 text-white/30 w-4 h-4" />
            <input type="text" placeholder="Ürün ara..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-amber-500 text-xs" />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              {/* Ad Soyad ve Şirket Bilgisi */}
              <p className="text-sm font-black text-white leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-[9px] text-amber-500 font-black uppercase mt-1.5 tracking-widest">{user?.company_name}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-500 font-black shadow-xl">
              {user?.first_name?.[0]}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic uppercase">Ürün Marketi</h2>
            <p className="text-white/40 text-sm font-medium italic">"Güvenle çok al az öde mekanizması ile şirketinizin değerini arttırın."</p>
          </div>

          {/* ÜRÜN GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
            {INITIAL_PRODUCTS.map((product) => (
              <div key={product.id} className="group bg-black/20 backdrop-blur-2xl rounded-[2rem] border border-white/5 p-6 hover:border-amber-500/50 transition-all duration-500 flex flex-col shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center text-5xl mb-6 group-hover:scale-105 transition-all shadow-inner">
                  {product.image}
                </div>
                
                <div className="flex-1 space-y-2">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{product.category}</span>
                  <h3 className="text-sm font-black text-white leading-tight h-10 overflow-hidden">{product.name}</h3>
                  <p className="text-lg font-black text-white tracking-tighter">₺{product.price.toLocaleString()}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
                    <span className="text-[9px] font-black text-white/30 uppercase mr-2">Adet:</span>
                    <input 
                      type="number" 
                      min="1"
                      value={quantities[product.id]}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="w-full bg-transparent py-2 text-xs font-black text-amber-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-tighter hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Sepete Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FİNANSAL ÖZET */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/10">
            <StatCard title="Kullanılabilir Limit" value="₺125.000" sub="Cari Bakiyeniz" />
            <StatCard title="Sepetteki Tutar" value={`₺${cartTotal.toLocaleString()}`} sub={`${totalItemCount} Parça Ürün`} highlight />
            <StatCard title="Seçili Adres" value="Merkez Depo" sub="Samsun / Tekkeköy" />
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, count = null }: any) {
  return (
    <button className={`flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest w-full transition-all group ${
      active ? 'bg-amber-500 text-[#1a0005] shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
    }`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {count && <span className="px-2 py-0.5 rounded-lg text-[8px] bg-amber-500 text-black font-black animate-pulse">{count}</span>}
    </button>
  );
}

function StatCard({ title, value, sub, highlight = false }: any) {
  return (
    <div className={`bg-black/20 backdrop-blur-2xl p-8 rounded-[2.5rem] border ${highlight ? 'border-amber-500/30 shadow-amber-500/10' : 'border-white/5'} hover:border-amber-500/30 transition-all shadow-lg group`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${highlight ? 'text-amber-500' : 'text-white/30'} group-hover:text-amber-500 transition-colors`}>{title}</p>
      <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{value}</h3>
      <p className="text-[10px] text-white/40 font-bold uppercase">{sub}</p>
    </div>
  );
}