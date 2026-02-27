"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Loader2, Store, ShoppingCart, History, Plus, ChevronRight, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

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

  const loadCart = useCallback((id: string) => {
    const saved = localStorage.getItem(`cartData_${id}`);
    setCart(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      
      const fallbackID = btoa(token).substring(0, 15); 

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        loadCart(res.data.email);
      } catch (error) {
        // Hata durumunda isim "Bayi Üyesi" olur
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: fallbackID, company_name: "AUT Partner" });
        loadCart(fallbackID);
      } finally { setLoading(false); }
    };
    checkAuth();
  }, [router, loadCart]);

  const addToCart = (p: any) => {
    const id = user?.email || "guest";
    const amount = quantities[p.id] || 1;
    setCart(prev => {
      const newCart = prev.find(i => i.id === p.id) 
        ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + amount } : i)
        : [...prev, { ...p, quantity: amount }];
      localStorage.setItem(`cartData_${id}`, JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartTotalWithTax = cart.reduce((sum, item) => sum + (item.price * 1.2 * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200 font-sans">
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white font-black uppercase italic text-xl">AradığınıBul</div>
        <nav className="space-y-2 flex-1">
          <SidebarItem icon={<Store size={18} />} label="Ürün Marketi" active />
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" count={totalItems > 0 ? totalItems.toString() : null} /></Link>
          <Link href="/saved-cards"><SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" /></Link>
          <SidebarItem icon={<History size={18} />} label="Siparişlerim" />
        </nav>
        {/* ✅ DÜZELTİLDİ: Kartların silinmemesi için clear() kaldırıldı */}
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1">
        <header className="bg-black/20 backdrop-blur-md h-20 flex items-center justify-between px-10 border-b border-white/5 sticky top-0 z-50">
          <div className="relative hidden md:block w-80 text-white/30"><Search className="absolute left-3 top-2.5 w-4 h-4" /><input type="text" placeholder="Hızlı ürün ara..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none" /></div>
          {/* ✅ DİNAMİK HEADER: İsmi user state'inden çeker */}
          <div className="flex items-center gap-4">
            <div className="text-right"><p className="text-sm font-black text-white">{user?.first_name} {user?.last_name}</p><p className="text-[9px] text-amber-500 font-black uppercase">{user?.company_name}</p></div>
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-500 font-black">{user?.first_name?.[0]}</div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-12 pb-20">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Pazar Yeri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
            {INITIAL_PRODUCTS.map((p) => (
              <div key={p.id} className="bg-black/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-6 hover:border-amber-500/50 transition-all flex flex-col shadow-xl group">
                <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-5xl mb-6 group-hover:scale-105 transition-transform">{p.image}</div>
                <div className="flex-1 space-y-2">
                  <span className="text-[8px] font-black text-amber-500 uppercase">{p.category}</span>
                  <h3 className="text-sm font-black text-white h-10 overflow-hidden leading-tight">{p.name}</h3>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-white tracking-tighter font-mono leading-none">₺{p.price.toLocaleString()} <span className="text-[9px] text-white/30 ml-1 font-bold italic">+ KDV</span></p>
                    <p className="text-[11px] font-black text-amber-500/90 tracking-tight italic">₺{(p.price * 1.2).toLocaleString()} <span className="text-[8px] opacity-60 ml-1 uppercase">KDV Dahil</span></p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <input type="number" min="1" value={quantities[p.id]} onChange={(e) => setQuantities({...quantities, [p.id]: parseInt(e.target.value) || 1})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs font-black text-amber-500 outline-none" />
                  <button onClick={() => addToCart(p)} className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Sepete Ekle</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, count = null }: any) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {count && <span className="px-2 py-0.5 rounded-lg text-[8px] bg-amber-500 text-black font-black animate-pulse">{count}</span>}
    </div>
  );
}