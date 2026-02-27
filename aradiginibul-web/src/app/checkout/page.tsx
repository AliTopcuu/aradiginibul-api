"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CreditCard, Loader2, Store, ShoppingCart, 
  History, MapPin, LogOut, ChevronRight, CheckCircle2, 
  ShieldCheck, Lock
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Kullanıcı bilgilerini çek
    api.get('/auth/me').then((res) => setUser(res.data)).catch(() => {
      setUser({ first_name: "Değerli", last_name: "Bayimiz", company_name: "AradığınıBul Partner" });
    });

    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleFinalPayment = () => {
    setIsProcessing(true);
    // 3 saniyelik mock banka onayı
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem('cartData');
    }, 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005]">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  if (isSuccess) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans text-slate-200 bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed p-6 text-center">
      <div className="bg-black/30 backdrop-blur-3xl p-12 rounded-[3rem] border border-amber-500/30 shadow-2xl max-w-lg w-full space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.4)]">
          <CheckCircle2 size={48} className="text-[#1a0005]" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Sipariş Onaylandı</h1>
          <p className="text-white/60 font-medium italic">Ödemeniz başarıyla alındı.</p>
        </div>
        <Link href="/" className="block w-full bg-amber-500 text-black py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all">
          Yeni Alışverişe Başla
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-200 bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed">
      
      {/* 🛠️ SOL SIDEBAR */}
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white">
          <Store className="text-amber-500" /> <span className="font-black italic uppercase">AradığınıBul</span>
        </div>
        <nav className="space-y-1.5 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" count={totalItemCount > 0 ? totalItemCount.toString() : null} /></Link>
          <SidebarItem icon={<CreditCard size={18} />} label="Ödeme" active />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
          <Link href="/cart" className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
            <ArrowLeft size={14} /> Sepete Dön
          </Link>
          <div className="flex items-center gap-4">
             <Lock className="text-amber-500" size={16} />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">SSL Güvenli Ödeme</span>
          </div>
        </header>

        <div className="p-10 max-w-5xl mx-auto space-y-10">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Ödeme Bilgileri</h1>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* 💳 KART GİRİŞ ALANI - Havale seçeneği kaldırıldı */}
            <div className="bg-black/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                <CreditCard className="text-amber-500" size={24} />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Kredi Kartı İle Ödeme</h3>
              </div>

              <div className="space-y-4 animate-in fade-in duration-500">
                <MockInput label="Kart Üzerindeki İsim" placeholder="Ad Soyad" />
                <MockInput label="Kart Numarası" placeholder="0000 0000 0000 0000" />
                <div className="grid grid-cols-2 gap-4">
                  <MockInput label="Son Kullanma (AA/YY)" placeholder="01/28" />
                  <MockInput label="Güvenlik Kodu (CVC)" placeholder="***" />
                </div>
              </div>
              
              <p className="text-[10px] text-white/20 font-bold italic text-center">Tüm ödemeleriniz 256-bit SSL ile korunmaktadır.</p>
            </div>

            {/* 💰 ÖDEME ÖZETİ */}
            <div className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-amber-500/20 p-10 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Ödenecek Tutar</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-white/40 font-bold uppercase text-[11px]"><span>Ara Toplam</span><span>₺{cartTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-white/40 font-bold uppercase text-[11px]"><span>KDV (%20)</span><span>₺{(cartTotal * 0.2).toLocaleString()}</span></div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Genel Toplam</span>
                    <span className="text-4xl font-black text-amber-500 italic tracking-tighter font-mono">₺{(cartTotal * 1.2).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleFinalPayment}
                disabled={isProcessing}
                className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] mt-10 shadow-2xl shadow-amber-500/30 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] disabled:bg-white/10 disabled:text-white/30 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? <><Loader2 className="animate-spin" size={18} /> Ödeme Alınıyor...</> : <><ShieldCheck size={18} /> Ödemeyi Tamamla</>}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MockInput({ label, placeholder }: any) {
  return (
    <div>
      <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">{label}</label>
      <input type="text" placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-black text-amber-500 outline-none placeholder:text-amber-500/30" disabled />
    </div>
  );
}

function SidebarItem({ icon, label, active = false, count = null }: any) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest w-full transition-all group cursor-pointer ${active ? 'bg-amber-500 text-[#1a0005] shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {count && <span className={`px-2 py-0.5 rounded-lg text-[8px] ${active ? 'bg-black/20 text-black' : 'bg-amber-500 text-black'}`}>{count}</span>}
    </div>
  );
}