"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Trash2, Store, ShoppingCart, History, LogOut } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function SavedCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const fallbackID = btoa(token).substring(0, 15);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        // ✅ KRİTİK: Sadece giriş yapanın kutusunu aç
        const saved = JSON.parse(localStorage.getItem(`savedCards_${res.data.email}`) || '[]');
        setCards(saved);
      } catch (error) {
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: fallbackID });
        const saved = JSON.parse(localStorage.getItem(`savedCards_${fallbackID}`) || '[]');
        setCards(saved);
      }
    };
    init();
  }, [router]);

  const deleteCard = (cardId: number) => {
    const userId = user?.email || "guest";
    const updated = cards.filter(c => c.id !== cardId);
    setCards(updated);
    localStorage.setItem(`savedCards_${userId}`, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200 font-sans">
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white italic font-black uppercase"><Store className="text-amber-500" /> AradığınıBul</div>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" /></Link>
          <SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" active />
          <SidebarItem icon={<History size={18} />} label="Siparişlerim" />
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>
      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white italic uppercase mb-10 tracking-tighter">Kartlarım</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.length === 0 ? (
            <div className="col-span-2 bg-black/20 p-20 rounded-[3rem] border border-white/5 text-center text-white/20 italic font-bold text-xs uppercase tracking-widest uppercase">Henüz kartınız yok.</div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="bg-gradient-to-br from-white/10 to-transparent p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative group transition-all hover:border-amber-500/30">
                <div className="flex justify-between items-start mb-12">
                  <div className="bg-amber-500 p-3 rounded-xl"><CreditCard className="text-black" size={28} /></div>
                  <button onClick={() => deleteCard(card.id)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
                <p className="text-xl font-mono tracking-[0.25em] text-white mb-4">{card.number}</p>
                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                  <div><p className="text-[8px] font-black uppercase text-amber-500 mb-1">Sahibi</p><p className="text-xs font-black uppercase text-white/80">{card.holder}</p></div>
                  <div><p className="text-[8px] font-black uppercase text-amber-500 mb-1">SKT</p><p className="text-xs font-black text-white/80">{card.expiry}</p></div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
      {icon} {label}
    </div>
  );
}