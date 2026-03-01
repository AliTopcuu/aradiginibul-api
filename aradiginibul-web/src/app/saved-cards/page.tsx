"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Trash2, Store, ShoppingCart, History, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api, { getUserEmailFromToken } from '@/lib/api';

export default function SavedCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }

      // JWT token'dan email'i doğrudan çöz (backend'e gerek yok)
      const tokenEmail = getUserEmailFromToken();

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        const userId = res.data.email;
        const data = JSON.parse(localStorage.getItem(`savedCards_${userId}`) || '[]');
        setCards(data);
      } catch (error) {
        // Backend erişilemezse, token'dan çözülen email'i kullan
        const userId = tokenEmail || "guest";
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: userId });
        const data = JSON.parse(localStorage.getItem(`savedCards_${userId}`) || '[]');
        setCards(data);
      } finally { setLoading(false); }
    };
    init();
  }, [router]);

  const deleteCard = (id: number) => {
    const userId = user?.email || "guest";
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    localStorage.setItem(`savedCards_${userId}`, JSON.stringify(updated));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200">
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white font-black uppercase italic text-xl">AradığınıBul</div>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" /></Link>
          <SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" active />
          <Link href="/orders"><SidebarItem icon={<History size={18} />} label="Siparişlerim" /></Link>
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white italic uppercase mb-10 tracking-tighter">Kartlarım</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.length === 0 ? (
            <div className="col-span-2 bg-black/20 p-20 rounded-[3rem] border border-white/5 text-center text-white/20 italic">Kartınız bulunmuyor.</div>
          ) : (
            cards.map(c => (
              <div key={c.id} className="bg-gradient-to-br from-white/10 to-transparent p-10 rounded-[2.5rem] border border-white/10 relative group">
                <CreditCard className="text-amber-500 mb-8" size={32} />
                <button onClick={() => deleteCard(c.id)} className="absolute top-10 right-10 text-red-500/30 hover:text-red-500"><Trash2 size={18} /></button>
                <p className="text-xl font-mono tracking-widest text-white mb-4">{c.number}</p>
                <div className="flex justify-between border-t border-white/5 pt-6 uppercase text-[8px] font-black text-amber-500">
                  <div><span>Sahibi</span><p className="text-xs text-white/80">{c.holder}</p></div>
                  <div><span>SKT</span><p className="text-xs text-white/80">{c.expiry}</p></div>
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
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
      {icon} {label}
    </div>
  );
}