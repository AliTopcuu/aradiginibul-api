"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Store, ShoppingCart, CreditCard, LogOut, Loader2, ChevronDown, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import api, { getUserEmailFromToken } from '@/lib/api';
import { useDarkMode } from '@/lib/useDarkMode';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();
  const theme = useDarkMode();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const tokenEmail = getUserEmailFromToken();
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        const userId = res.data.email;
        const data = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
        setOrders(data);
      } catch (error) {
        const userId = tokenEmail || "guest";
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: userId });
        const data = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
        setOrders(data);
      } finally { setLoading(false); }
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className={`min-h-screen w-full flex ${theme.bg} bg-fixed text-slate-200 transition-colors duration-500`}>
      <aside className={`w-64 ${theme.sidebar} backdrop-blur-3xl border-r hidden lg:flex flex-col p-6 sticky top-0 h-screen transition-colors duration-500`}>
        <Link href="/"><div className="flex items-center gap-3 mb-10 px-2 text-white font-black uppercase italic text-xl cursor-pointer hover:text-amber-400 transition-colors">AradığınıBul</div></Link>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" theme={theme} /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" theme={theme} /></Link>
          <Link href="/saved-cards"><SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" theme={theme} /></Link>
          <SidebarItem icon={<History size={18} />} label="Siparişlerim" active theme={theme} />
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Siparişlerim</h1>
          <button onClick={theme.toggle} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title={theme.isDark ? 'Açık Mod' : 'Koyu Mod'}>
            {theme.isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-white/40" />}
          </button>
        </div>
        <div className={`${theme.card} backdrop-blur-3xl rounded-[2.5rem] border overflow-hidden shadow-2xl transition-colors duration-500`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b border-white/5 bg-white/5 ${theme.accent} text-[10px] font-black uppercase`}>
                <th className="p-6">Sipariş No</th>
                <th className="p-6">Tarih</th>
                <th className="p-6">Tutar</th>
                <th className="p-6">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-white/20 italic">Henüz siparişiniz yok.</td></tr>
              ) : (
                orders.map((o) => (
                  <>
                    <tr
                      key={o.id}
                      onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors text-white/80 cursor-pointer select-none"
                    >
                      <td className="p-6 font-mono text-xs font-black">{o.id}</td>
                      <td className="p-6 text-xs font-bold">{o.date}</td>
                      <td className="p-6 text-sm font-black">₺{o.total.toLocaleString()}</td>
                      <td className="p-6 flex items-center gap-3">
                        <span className={`px-3 py-1 ${theme.accentBgLight} ${theme.accent} text-[9px] font-black uppercase rounded-full`}>{o.status}</span>
                        <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${expandedOrder === o.id ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>
                    {expandedOrder === o.id && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={4} className="p-0">
                          <div className="bg-black/30 border-t border-white/5 px-8 py-6">
                            {o.items && o.items.length > 0 ? (
                              <div className="space-y-3">
                                <p className={`text-[9px] font-black ${theme.accent} uppercase tracking-widest mb-4`}>Sipariş Detayları</p>
                                {o.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3 border border-white/5">
                                    <div className="flex items-center gap-4">
                                      <span className="text-2xl">{item.image}</span>
                                      <div>
                                        <p className="text-xs font-black text-white">{item.name}</p>
                                        <p className={`text-[9px] ${theme.accent} opacity-70 font-bold uppercase`}>{item.category}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-right">
                                        <p className="text-[9px] text-white/30 font-bold uppercase">Miktar</p>
                                        <p className="text-sm font-black text-white">{item.quantity}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[9px] text-white/30 font-bold uppercase">Birim Fiyat (KDV Dahil)</p>
                                        <p className="text-sm font-black text-white font-mono">₺{(item.price * 1.2).toLocaleString()}</p>
                                      </div>
                                      <div className="text-right min-w-[100px]">
                                        <p className="text-[9px] text-white/30 font-bold uppercase">Toplam (KDV Dahil)</p>
                                        <p className={`text-sm font-black ${theme.accent} font-mono`}>₺{(item.price * item.quantity * 1.2).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-white/20 italic text-center py-4">Bu sipariş için ürün detayı bulunamadı.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
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