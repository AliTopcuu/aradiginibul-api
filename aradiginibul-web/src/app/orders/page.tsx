"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Store, ShoppingCart, CreditCard, LogOut, Loader2, ChevronDown, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import api, { getUserEmailFromToken } from '@/lib/api';
import { useDarkMode } from '@/lib/useDarkMode';

const statusColors: any = {
  'Hazırlanıyor': 'bg-yellow-500/20 text-yellow-400',
  'Kargoda': 'bg-blue-500/20 text-blue-400',
  'Teslim Edildi': 'bg-green-500/20 text-green-400',
  'İptal Edildi': 'bg-red-500/20 text-red-400',
};
const statusEmoji: any = { 'Hazırlanıyor': '📦', 'Kargoda': '🚚', 'Teslim Edildi': '✅', 'İptal Edildi': '❌' };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const router = useRouter();
  const theme = useDarkMode();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        const tokenEmail = getUserEmailFromToken();
        const userId = tokenEmail || "guest";
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: userId });
      }
      // Siparişleri API'den çek
      try {
        const ordersRes = await api.get('/orders/');
        console.log('Siparişler:', ordersRes.data);
        setOrders(ordersRes.data);
      } catch (err: any) {
        console.error('Sipariş çekme hatası:', err.response?.status, err.response?.data);
        setOrders([]);
      }
      setLoading(false);
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

        {orders.length === 0 ? (
          <div className={`${theme.card} backdrop-blur-3xl rounded-[2.5rem] border p-20 text-center`}>
            <p className="text-white/20 italic text-sm">Henüz siparişiniz yok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className={`${theme.card} backdrop-blur-3xl rounded-2xl border overflow-hidden shadow-xl transition-colors duration-500`}>
                {/* Sipariş Başlığı */}
                <div onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs font-black text-white/50">#{o.id}</span>
                    <div>
                      <p className="text-xs text-white/40">{new Date(o.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-black font-mono text-white">₺{o.total_price.toLocaleString()}</span>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${statusColors[o.status] || 'bg-white/10 text-white/40'}`}>
                      {statusEmoji[o.status] || '📋'} {o.status}
                    </span>
                    <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${expandedOrder === o.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Sipariş Detayları (Açılır) */}
                {expandedOrder === o.id && (
                  <div className="bg-black/30 border-t border-white/5 px-8 py-6 space-y-6">
                    {/* Ürün Listesi */}
                    {o.items && o.items.length > 0 && (
                      <div>
                        <p className={`text-[9px] font-black ${theme.accent} uppercase tracking-widest mb-3`}>Sipariş Kalemleri</p>
                        {o.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3 border border-white/5 mb-2">
                            <span className="text-xs font-black text-white">{item.product_name}</span>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[9px] text-white/30 font-bold uppercase">Miktar</p>
                                <p className="text-sm font-black text-white">{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-white/30 font-bold uppercase">Birim Fiyat</p>
                                <p className="text-sm font-black text-white font-mono">₺{item.unit_price.toLocaleString()}</p>
                              </div>
                              <div className="text-right min-w-[100px]">
                                <p className="text-[9px] text-white/30 font-bold uppercase">Toplam</p>
                                <p className={`text-sm font-black ${theme.accent} font-mono`}>₺{(item.quantity * item.unit_price).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Durum Tarihçesi Timeline */}
                    {o.history && o.history.length > 0 && (
                      <div>
                        <p className={`text-[9px] font-black ${theme.accent} uppercase tracking-widest mb-4`}>Sipariş Durumu</p>
                        <div className="relative pl-6">
                          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-white/10"></div>
                          {o.history.map((h: any, idx: number) => (
                            <div key={idx} className="relative flex items-start gap-4 mb-5 last:mb-0">
                              <div className={`absolute -left-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${idx === o.history.length - 1 ? 'bg-green-500/30 ring-2 ring-green-500/50' : 'bg-white/10'}`}>
                                {statusEmoji[h.status] || '📋'}
                              </div>
                              <div className="ml-5">
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs font-black ${idx === o.history.length - 1 ? 'text-white' : 'text-white/50'}`}>{h.status}</span>
                                  <span className="text-[9px] text-white/30 font-mono">
                                    {new Date(h.created_at).toLocaleDateString('tr-TR')} {new Date(h.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {h.notes && <p className="text-[10px] text-white/25 mt-0.5">{h.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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