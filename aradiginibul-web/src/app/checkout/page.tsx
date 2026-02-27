"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, CreditCard, Lock, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'review' | 'payment'>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cardData, setCardData] = useState({ holder: '', number: '', expiry: '', cvc: '' });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const fallbackID = btoa(token).substring(0, 15);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        calculateTotal(res.data.email);
      } catch (error) {
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: fallbackID });
        calculateTotal(fallbackID);
      } finally { setLoading(false); }
    };
    const calculateTotal = (id: string) => {
      const savedCart = JSON.parse(localStorage.getItem(`cartData_${id}`) || '[]');
      const total = savedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity * 1.2), 0);
      setCartTotal(total);
    };
    checkAuth();
  }, [router]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 16);
    const parts = v.match(/.{1,4}/g);
    setCardData({ ...cardData, number: parts ? parts.join(' ') : v });
  };

  // ✅ SKT: 2 rakamdan sonra "/" ekleyen ve toplam 5 karakter sınırı (AA/YY) olan fonksiyon
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      v = v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    setCardData({ ...cardData, expiry: v.substring(0, 5) });
  };

  const handlePayment = () => {
    if (cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvc.length < 3) {
      alert("Lütfen tüm alanları doldurun."); return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      // ✅ KRİTİK İZOLASYON: Kullanıcıya özel mühürlü anahtar
      const userId = user?.email;
      if (saveCard) {
        const storageKey = `savedCards_${userId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!existing.some((c: any) => c.number === cardData.number)) {
          localStorage.setItem(storageKey, JSON.stringify([...existing, { 
            id: Date.now(), holder: cardData.holder, number: cardData.number, expiry: cardData.expiry 
          }]));
        }
      }
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem(`cartData_${userId}`);
    }, 2500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  if (isSuccess) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005] p-10 text-center">
      <div className="bg-black/20 backdrop-blur-3xl p-16 rounded-[3rem] border border-amber-500/30 max-w-xl">
        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/40"><CheckCircle2 size={48} className="text-black" /></div>
        <h2 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">İşlem Tamam!</h2>
        <Link href="/"><button className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase text-[11px] hover:bg-amber-400 mt-10">Markete Dön</button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200 font-sans">
      <main className="flex-1 max-w-4xl mx-auto p-10">
        <div className="bg-black/20 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-16 shadow-2xl">
          {step === 'review' ? (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
               <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-12">Ödeme Onayı</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"><p className="text-[10px] text-white/30 uppercase mb-2">Sevk Adresi</p><p className="text-xs font-bold leading-relaxed text-white">Mimarsinan, Samsun</p></div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4 text-white"><CreditCard className="text-amber-500" /> Kredi Kartı</div>
               </div>
               <button onClick={() => setStep('payment')} className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase text-[11px] hover:bg-amber-400 transition-all shadow-xl">Kart Bilgilerine Geç</button>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 italic">Güvenli Ödeme</h1>
                <div className="inline-block px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full font-mono text-amber-500 font-black">₺{cartTotal.toLocaleString()}</div>
              </div>
              <div className="space-y-5">
                <input type="text" onChange={(e) => setCardData({...cardData, holder: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-amber-500 font-black text-xs uppercase text-white" placeholder="KART ÜZERİNDEKİ İSİM"/>
                <input type="text" value={cardData.number} onChange={handleCardNumberChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-amber-500 font-mono text-sm tracking-[0.2em] text-white" placeholder="0000 0000 0000 0000"/>
                <div className="grid grid-cols-2 gap-5">
                  <input type="text" value={cardData.expiry} onChange={handleExpiryChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-amber-500 font-mono text-xs text-white" placeholder="AA / YY"/>
                  <input type="password" maxLength={3} onChange={(e) => setCardData({...cardData, cvc: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-amber-500 font-mono text-xs text-white" placeholder="CVC / CVV"/>
                </div>
                <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setSaveCard(!saveCard)}>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${saveCard ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`}>{saveCard && <CheckCircle2 size={12} className="text-black" />}</div>
                  <span className="text-[10px] font-black uppercase text-white/40">Bu kartı sadece bana özel kaydet</span>
                </div>
                <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-amber-500 text-black py-6 rounded-full font-black uppercase text-[11px] shadow-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3">
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Lock size={16} /> Ödemeyi Onayla</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}