"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, CreditCard, Lock, Calendar, User, Hash, ShieldCheck, Moon, Sun, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import api, { getUserEmailFromToken } from '@/lib/api';
import { useDarkMode } from '@/lib/useDarkMode';

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
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const router = useRouter();
  const theme = useDarkMode();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const tokenEmail = getUserEmailFromToken();
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        calculateTotal(res.data.email);
        // Kayıtlı kartları yükle
        const cardsRes = await api.get('/saved-cards/');
        setSavedCards(cardsRes.data || []);
      } catch (error) {
        const userId = tokenEmail || "guest";
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: userId });
        calculateTotal(userId);
      } finally { setLoading(false); }
    };
    const calculateTotal = (id: string) => {
      const savedCart = JSON.parse(localStorage.getItem(`cartData_${id}`) || '[]');
      // Fiyat hesaplamaları (Cart sayfasıyla aynı)
      const subTotal = savedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const tax = subTotal * 0.20;
      const subTotalWithTax = subTotal + tax;
      // 50+ adet olan ürünlere %10 indirim
      const discountAmount = savedCart.reduce((sum: number, item: any) => {
        if (item.quantity >= 50) {
          return sum + (item.price * item.quantity * 1.2 * 0.10);
        }
        return sum;
      }, 0);
      const total = subTotalWithTax - discountAmount;
      setCartTotal(total);
    };
    checkAuth();
  }, [router]);

  const handleSelectSavedCard = (card: any) => {
    setSelectedCardId(card.id);
    setCardData({
      holder: card.card_holder,
      number: card.card_number,
      expiry: card.card_expiry,
      cvc: ''  // CVC boş kalır, güvenlik için
    });
    setShowCardSelector(false);
    setSaveCard(false);  // Zaten kaydedilmiş kart seçilmiş
  };

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

  const handlePayment = async () => {
    if (cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvc.length < 3) {
      alert("Lütfen bilgileri eksiksiz doldurun."); return;
    }
    setIsProcessing(true);
    const userId = user?.email || "guest";

    try {
      // Sepet verilerini al
      const savedCart = JSON.parse(localStorage.getItem(`cartData_${userId}`) || '[]');
      if (savedCart.length === 0) {
        alert("Sepetiniz boş!"); setIsProcessing(false); return;
      }

      // Fiyat hesapla (Cart sayfasıyla aynı)
      const subTotal = savedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const tax = subTotal * 0.20;
      const subTotalWithTax = subTotal + tax;
      const discountAmount = savedCart.reduce((sum: number, item: any) => {
        if (item.quantity >= 50) {
          return sum + (item.price * item.quantity * 1.2 * 0.10);
        }
        return sum;
      }, 0);
      const finalTotal = subTotalWithTax - discountAmount;
      
      // Backend'e sipariş gönder (indirimli fiyatlarla)
      const orderItems = savedCart.map((item: any) => {
        let unitPrice = item.price * 1.2; // KDV'li fiyat
        // 50+ adet = %10 indirim
        if (item.quantity >= 50) {
          unitPrice = unitPrice * 0.9; // %10 indirim
        }
        return {
          product_id: item.id,
          quantity: item.quantity,
          unit_price: unitPrice
        };
      });

      const res = await api.post('/orders/', { items: orderItems, total_price: finalTotal });
      const orderId = res.data?.id || 'N/A';

      // Kartı kaydet (isteğe bağlı - sadece yeni kart ise)
      if (saveCard && !selectedCardId) {
        try {
          await api.post('/saved-cards/', {
            card_holder: cardData.holder,
            card_number: cardData.number,
            card_expiry: cardData.expiry,
            is_default: false
          });
        } catch (e) {
          console.log('Kart kaydetme başarısız, sipariş yine de tamamlandı');
        }
      }

      setOrderNumber(`SİPARİŞ #${orderId}`);
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem(`cartData_${userId}`);
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err.response?.data?.detail || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.";
      alert(`Hata: ${msg}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  if (isSuccess) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.isDark ? 'bg-[#0a0a0f]' : 'bg-[#1a0005]'} p-10 text-center text-white transition-colors duration-500`}>
      <div className={`bg-black/20 backdrop-blur-3xl p-16 rounded-[3rem] border ${theme.accentBorder} max-w-xl`}>
        <CheckCircle2 size={64} className={`${theme.accent} mx-auto mb-6`} />
        <h2 className="text-3xl font-black italic uppercase mb-4">İşlem Başarılı</h2>
        <div className="bg-white/5 p-4 rounded-xl mb-8 font-mono text-xl tracking-widest">{orderNumber}</div>
        <Link href="/orders"><button className={`w-full ${theme.accentBg} text-black py-4 rounded-full font-black uppercase text-xs`}>Siparişlerim</button></Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-10 text-white font-sans transition-colors duration-500`}>
      <div className={`max-w-md w-full ${theme.isDark ? 'bg-[#12121a]/80' : 'bg-black/40'} backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 shadow-2xl transition-colors duration-500`}>
        <div className="flex justify-end mb-4">
          <button onClick={theme.toggle} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title={theme.isDark ? 'Açık Mod' : 'Koyu Mod'}>
            {theme.isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-white/40" />}
          </button>
        </div>
        <div className="text-center mb-10"><h1 className="text-2xl font-black italic uppercase tracking-tighter">Güvenli Ödeme</h1><p className={`${theme.accent} font-mono text-xl mt-2 font-black`}>₺{cartTotal.toLocaleString()}</p></div>
        <div className="space-y-4">
          {/* KAYıTLı KARTLAR SEÇİCİ */}
          {savedCards.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowCardSelector(!showCardSelector)} className="w-full flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-amber-500 transition-all">
                <span className="text-[9px] font-black uppercase text-white/40">
                  {selectedCardId ? `Seçili: ${savedCards.find(c => c.id === selectedCardId)?.card_number}` : 'Kayıtlı Kart Seç'}
                </span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${showCardSelector ? 'rotate-180' : ''}`} />
              </button>
              {showCardSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a]/95 border border-white/10 rounded-xl overflow-hidden z-50">
                  {savedCards.map(card => (
                    <button key={card.id} onClick={() => handleSelectSavedCard(card)} className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all flex items-center justify-between ${selectedCardId === card.id ? 'bg-white/10' : ''}`}>
                      <div>
                        <p className="text-xs font-black text-white">{card.card_holder}</p>
                        <p className="text-[9px] text-white/30 font-mono">{card.card_number}</p>
                      </div>
                      {selectedCardId === card.id && <div className="w-3 h-3 rounded-full bg-amber-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* KART BİLGİLERİ FORMU */}
          <div className="relative"><User className="absolute left-4 top-4 text-white/20" size={18} /><input type="text" placeholder="KART SAHİBİ" value={cardData.holder} onChange={(e) => setCardData({ ...cardData, holder: e.target.value })} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 uppercase font-black text-xs" /></div>
          <div className="relative"><CreditCard className="absolute left-4 top-4 text-white/20" size={18} /><input type="text" value={cardData.number} placeholder="KART NUMARASI" onChange={handleCardNumberChange} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative"><Calendar className="absolute left-4 top-4 text-white/20" size={18} /><input type="text" value={cardData.expiry} placeholder="AA/YY" onChange={handleExpiryChange} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-xs" /></div>
            <div className="relative"><Lock className="absolute left-4 top-4 text-white/20" size={18} /><input type="password" placeholder="CVC" maxLength={3} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 3); setCardData({ ...cardData, cvc: v }); e.target.value = v; }} className="w-full bg-white/5 p-4 pl-12 rounded-xl border border-white/10 outline-none focus:border-amber-500 font-mono text-xs" /></div>
          </div>
          {!selectedCardId && <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setSaveCard(!saveCard)}><div className={`w-4 h-4 border rounded ${saveCard ? theme.accentBg : 'border-white/20'}`} /> <span className="text-[9px] font-black uppercase text-white/40">Kartı Kaydet</span></div>}
          <button onClick={handlePayment} disabled={isProcessing} className={`w-full ${theme.accentBg} text-black py-4 rounded-full font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2`}>{isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={16} /> Ödemeyi Tamamla</>}</button>
        </div>
      </div>
    </div>
  );
}