"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Trash2, Store, ShoppingCart, History, LogOut, Loader2, Moon, Sun, Heart } from 'lucide-react';
import Link from 'next/link';
import api, { getUserEmailFromToken } from '@/lib/api';
import { useDarkMode } from '@/lib/useDarkMode';

export default function SavedCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useDarkMode();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        // Kartları API'den yükle
        const cardsRes = await api.get('/saved-cards/');
        setCards(cardsRes.data || []);
      } catch (error) {
        const tokenEmail = getUserEmailFromToken();
        const userId = tokenEmail || "guest";
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: userId });
        setCards([]);
      } finally { setLoading(false); }
    };
    init();
  }, [router]);

  const deleteCard = async (id: number) => {
    try {
      await api.delete(`/saved-cards/${id}`);
      setCards(cards.filter(c => c.id !== id));
    } catch (error) {
      alert("Kart silinirken bir hata oluştu.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className={`min-h-screen w-full flex ${theme.bg} bg-fixed text-slate-200 transition-colors duration-500`}>
      <aside className={`w-64 ${theme.sidebar} backdrop-blur-3xl border-r hidden lg:flex flex-col p-6 sticky top-0 h-screen transition-colors duration-500`}>
        <Link href="/"><div className="flex items-center gap-3 mb-10 px-2 text-white font-black uppercase italic text-xl cursor-pointer hover:text-amber-400 transition-colors">AradığınıBul</div></Link>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" theme={theme} /></Link>
          <Link href="/"><SidebarItem icon={<Heart size={18} />} label="Favorilerim" theme={theme} /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" theme={theme} /></Link>
          <SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" active theme={theme} />
          <Link href="/orders"><SidebarItem icon={<History size={18} />} label="Siparişlerim" theme={theme} /></Link>
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Kartlarım</h1>
          <button onClick={theme.toggle} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title={theme.isDark ? 'Açık Mod' : 'Koyu Mod'}>
            {theme.isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-white/40" />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.length === 0 ? (
            <div className={`col-span-2 ${theme.card} p-20 rounded-[3rem] border text-center text-white/20 italic transition-colors duration-500`}>Kartınız bulunmuyor.</div>
          ) : (
            cards.map(c => (
              <div key={c.id} className="bg-gradient-to-br from-white/10 to-transparent p-10 rounded-[2.5rem] border border-white/10 relative group">
                <CreditCard className={theme.accent} size={32} />
                <button onClick={() => deleteCard(c.id)} className="absolute top-10 right-10 text-red-500/30 hover:text-red-500"><Trash2 size={18} /></button>
                <p className="text-xl font-mono tracking-widest text-white mb-4 mt-8">{c.card_number}</p>
                <div className={`flex justify-between border-t border-white/5 pt-6 uppercase text-[8px] font-black ${theme.accent}`}>
                  <div><span>Sahibi</span><p className="text-xs text-white/80">{c.card_holder}</p></div>
                  <div><span>SKT</span><p className="text-xs text-white/80">{c.card_expiry}</p></div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, theme }: any) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${active ? `${theme.accentBg} text-black shadow-lg ${theme.accentShadow}` : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
      {icon} {label}
    </div>
  );
}
