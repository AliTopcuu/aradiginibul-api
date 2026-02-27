"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, CreditCard, ShoppingBag, Plus, Minus, Loader2, Store, ShoppingCart, History, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CartPage() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadCartData = useCallback((id: string) => {
    const saved = localStorage.getItem(`cartData_${id}`);
    setCart(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const fallbackID = btoa(token).substring(0, 15);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        loadCartData(res.data.email);
      } catch (error) {
        setUser({ first_name: "Ali Ufuktan", last_name: "Topcu", email: fallbackID });
        loadCartData(fallbackID);
      } finally { setLoading(false); }
    };
    init();
  }, [router, loadCartData]);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem(`cartData_${user?.email || "guest"}`, JSON.stringify(newCart));
  };

  const updateQty = (id: number, delta: number) => {
    const newCart = cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    saveCart(newCart);
  };

  const removeItem = (id: number) => saveCart(cart.filter(i => i.id !== id));

  const subTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const tax = subTotal * 0.20;
  const grandTotal = subTotal + tax;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200 font-sans">
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white italic font-black uppercase"><Store className="text-amber-500" /> AradığınıBul</div>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" /></Link>
          <SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" active count={cart.length > 0 ? cart.length.toString() : null} />
          <Link href="/saved-cards"><SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" /></Link>
          <SidebarItem icon={<History size={18} />} label="Siparişlerim" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20">
        <header className="bg-black/20 backdrop-blur-md h-20 flex items-center justify-between px-10 border-b border-white/5 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={14} /> Markete Dön</Link>
          <div className="text-right"><p className="text-sm font-black text-white leading-none">{user?.first_name} {user?.last_name}</p><p className="text-[9px] text-amber-500 font-black uppercase mt-1">Sepet Detayı</p></div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-white italic uppercase mb-10 tracking-tighter">Sipariş Detayı</h1>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-black/20 backdrop-blur-3xl rounded-3xl border border-white/5 p-6 flex items-center gap-6 shadow-xl group">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">{item.image}</div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{item.category}</p>
                    <h3 className="text-base font-black text-white">{item.name}</h3>
                    <p className="text-xs text-white/40 font-bold mt-1">Birim: ₺{item.price.toLocaleString()} <span className="text-[9px]">+ KDV</span></p>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:text-amber-500 transition-colors"><Minus size={14}/></button>
                    <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:text-amber-500 transition-colors"><Plus size={14}/></button>
                  </div>
                  <div className="text-right min-w-[140px]">
                    <p className="text-lg font-black text-white font-mono leading-none">₺{(item.price * item.quantity * 1.2).toLocaleString()}</p>
                    <p className="text-[9px] text-amber-500 font-bold italic mt-1 uppercase">KDV Dahil</p>
                    <button onClick={() => removeItem(item.id)} className="text-white/10 hover:text-red-500 transition-colors mt-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-amber-500/20 p-10 shadow-2xl h-fit sticky top-32">
              <h2 className="text-lg font-black text-white uppercase mb-8 flex items-center gap-3"><CreditCard className="text-amber-500" size={20} /> Ödeme Özeti</h2>
              <div className="space-y-4 text-[11px] font-black uppercase tracking-widest">
                <div className="flex justify-between text-white/40"><span>Ara Toplam (KDV Hariç)</span><span>₺{subTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-white/40"><span>Hesaplanan KDV (%20)</span><span className="text-amber-500/80">₺{tax.toLocaleString()}</span></div>
                <div className="border-t border-white/10 pt-6 flex justify-between text-xl text-white italic">
                  <span>TOPLAM</span>
                  <div className="text-right"><span className="text-amber-500 font-mono text-3xl block">₺{grandTotal.toLocaleString()}</span><span className="text-[9px] text-white/20 not-italic tracking-normal">Tüm vergiler dahildir</span></div>
                </div>
              </div>
              <Link href="/checkout"><button className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase text-[11px] mt-10 shadow-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3">Güvenli Ödeme Yap <ChevronRight size={18} /></button></Link>
            </div>
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
      {count && <span className="px-2 py-0.5 rounded-lg text-[8px] bg-amber-500 text-black font-black">{count}</span>}
    </div>
  );
}