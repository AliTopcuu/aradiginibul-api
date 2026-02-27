"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Trash2, 
  CreditCard, 
  ShoppingBag, 
  Plus, 
  Minus,
  Loader2,
  Store,
  ShoppingCart,
  History,
  MapPin,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CartPage() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı verilerini çek
    api.get('/auth/me').then((res) => {
      setUser(res.data);
    }).catch(() => {
      setUser({ first_name: "Değerli", last_name: "Bayimiz", company_name: "AradığınıBul Partner" });
    });

    // Sepet verilerini yükle
    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cartData', JSON.stringify(newCart));
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cartData', JSON.stringify(newCart));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Sidebar sayacı için

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005]">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-200 bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed">
      
      {/* 🛠️ SOL SIDEBAR (Ana Sayfa ile Aynı) */}
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-amber-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Store className="text-[#1a0005] w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-white">AradığınıBul</span>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 px-4">Market</p>
          <Link href="/">
            <SidebarItem icon={<Store size={18} />} label="Ürün Marketi" />
          </Link>
          <SidebarItem 
            icon={<ShoppingCart size={18} />} 
            label="Sepetim" 
            active 
            count={totalItemCount > 0 ? totalItemCount.toString() : null} 
          />
          
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

      {/* 🚀 ANA İÇERİK ALANI */}
      <main className="flex-1 overflow-y-auto">
        {/* Üst Bar (Kullanıcı Bilgileri) */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Markete Dön
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-black text-white leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-[9px] text-amber-500 font-black uppercase mt-1.5 tracking-widest">{user?.company_name}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-amber-500 font-black">
              {user?.first_name?.[0]}
            </div>
          </div>
        </header>

        {/* Sepet İçeriği */}
        <div className="p-10 max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-10 italic uppercase">Sipariş Detayı</h1>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* ÜRÜN LİSTESİ */}
            <div className="xl:col-span-2 space-y-4">
              {cart.length === 0 ? (
                <div className="bg-black/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-20 text-center">
                  <ShoppingBag className="mx-auto text-white/10 mb-6" size={64} />
                  <p className="text-white/40 font-medium italic">Sepetiniz şu an boş.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-black/20 backdrop-blur-3xl rounded-3xl border border-white/5 p-6 flex items-center gap-6 hover:border-amber-500/30 transition-all group">
                    <div className="w-20 h-20 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">{item.category}</p>
                      <h3 className="text-base font-black text-white leading-tight">{item.name}</h3>
                      <p className="text-xs text-white/40 font-bold mt-1">₺{item.price.toLocaleString()} / adet</p>
                    </div>
                    
                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:text-amber-500 transition-colors"><Minus size={14}/></button>
                      <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:text-amber-500 transition-colors"><Plus size={14}/></button>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-lg font-black text-white tracking-tighter font-mono">₺{(item.price * item.quantity).toLocaleString()}</p>
                      <button onClick={() => removeItem(item.id)} className="text-white/10 hover:text-red-500 transition-colors mt-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SİPARİŞ ÖZETİ KARTI */}
            <div className="space-y-6">
              <div className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-amber-500/20 p-8 shadow-2xl sticky top-32">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <CreditCard className="text-amber-500" size={20} /> Ödeme Özeti
                </h2>
                
                <div className="space-y-4 text-[11px] font-black uppercase tracking-widest">
                  <div className="flex justify-between text-white/40">
                    <span>Ara Toplam</span>
                    <span className="font-mono">₺{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>Vergi (KDV %20)</span>
                    <span className="font-mono">₺{(cartTotal * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-6 flex justify-between text-lg text-white italic">
                    <span>GENEL TOPLAM</span>
                    <span className="text-amber-500 font-mono">₺{(cartTotal * 1.2).toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout">
      <button className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase tracking-[0.15em] text-[11px] mt-10 shadow-2xl shadow-amber-500/30 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        Güvenli Ödeme Yap <ChevronRight size={18} />
      </button>
    </Link>
                


                
                <p className="text-[9px] text-white/20 text-center mt-8 font-bold leading-relaxed">
                  ŞİRKETİNİZ İÇİN EN İYİ FİYAT GARANTİSİ
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// SIDEBAR ITEM BİLEŞENİ (Ana sayfa ile aynı)
function SidebarItem({ icon, label, active = false, count = null }: any) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest w-full transition-all group cursor-pointer ${
      active ? 'bg-amber-500 text-[#1a0005] shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
    }`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {count && <span className={`px-2 py-0.5 rounded-lg text-[8px] ${active ? 'bg-black/20 text-black' : 'bg-amber-500 text-black'} animate-pulse`}>{count}</span>}
    </div>
  );
}