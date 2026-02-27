"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, CreditCard, Lock, Calendar, User, Hash, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'review' | 'payment'>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
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

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/gi, '');
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
    setCardData({ ...cardData, expiry: v.substring(0, 5) });
  };

  const handlePayment = () => {
    if (cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvc.length < 3) {
      alert("Lütfen bilgileri eksiksiz doldurun."); return;
    }
    setIsProcessing(true);
    const randomID = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrderNo = `ORD-2026-${randomID}`;

    setTimeout(() => {
      const userId = user?.email || "guest";
      
      // ✅ Siparişi Mühürlü Kaydet
      const ordersKey = `orders_${userId}`;
      const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      const newOrder = {
        id: newOrderNo,
        date: new Date().toLocaleDateString('tr-TR'),
        total: cartTotal,
        status: 'Hazırlanıyor'
      };
      localStorage.setItem(ordersKey, JSON.stringify([newOrder, ...existingOrders]));

      if (saveCard) {
        const cardKey = `savedCards_${userId}`;
        const existingCards = JSON.parse(localStorage.getItem(cardKey) || '[]');
        localStorage.setItem(cardKey, JSON.stringify([...existingCards, { id: Date.now(), ...cardData }]));
      }

      setOrderNumber(newOrderNo);
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem(`cartData_${userId}`);
    }, 2500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  if (isSuccess) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0005] p-10 text-center text-white">
      <div className="bg-black/20 backdrop-blur-3xl p-16 rounded-[3rem] border border-amber-500/30 max-w-xl">
        <CheckCircle2 size={64} className="text-amber-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black italic uppercase mb-4">İşlem Başarılı</h2>
        <div className="bg-white/5 p-4 rounded-xl mb-8 font-mono text-xl tracking-widest">{orderNumber}</div>
        <Link href="/orders"><button className="w-full bg-amber-500 text-black py-4 rounded-full font-black uppercase text-xs">Siparişlerim</button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] flex items-center justify-center p-10 text-white font-sans">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 shadow-2xl">
         <div className="text-center mb-10"><h1 className="text-2xl font-black italic uppercase tracking-tighter">Güvenli Ödeme</h1><p className="text-amber-500 font-mono text-xl mt-2 font-black">₺{cartTotal.toLocaleString()}</p></div>
         <div className="space-y-4">
            <div className="relative"><User className="absolute left-4 top-4 text-white/20" size={18}/><input type="text" placeholder="KART SAHİBİ" onChange={(e) => setCardData({...cardData, holder: e.target.value})} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 uppercase font-black text-xs" /></div>
            <div className="relative"><CreditCard className="absolute left-4 top-4 text-white/20" size={18}/><input type="text" value={cardData.number} placeholder="KART NUMARASI" onChange={handleCardNumberChange} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="relative"><Calendar className="absolute left-4 top-4 text-white/20" size={18}/><input type="text" value={cardData.expiry} placeholder="AA/YY" onChange={handleExpiryChange} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-xs" /></div>
               <div className="relative"><Lock className="absolute left-4 top-4 text-white/20" size={18}/><input type="password" placeholder="CVC" onChange={(e) => setCardData({...cardData, cvc: e.target.value})} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-xs" /></div>
            </div>
            <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setSaveCard(!saveCard)}><div className={`w-4 h-4 border rounded ${saveCard ? 'bg-amber-500' : 'border-white/20'}`} /> <span className="text-[9px] font-black uppercase text-white/40">Kartı Kaydet</span></div>
            <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-amber-500 text-black py-4 rounded-full font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2">{isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={16}/> Ödemeyi Tamamla</>}</button>
         </div>
      </div>
    </div>
  );
}