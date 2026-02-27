"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Store, ShoppingCart, CreditCard, LogOut, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push("/login"); return; }
      const fallbackID = btoa(token).substring(0, 15);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        const data = JSON.parse(localStorage.getItem(`orders_${res.data.email}`) || '[]');
        setOrders(data);
      } catch (error) {
        setUser({ first_name: "Bayi", last_name: "Üyesi", email: fallbackID });
        const data = JSON.parse(localStorage.getItem(`orders_${fallbackID}`) || '[]');
        setOrders(data);
      } finally { setLoading(false); }
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a0005]"><Loader2 className="animate-spin text-amber-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005] bg-fixed text-slate-200">
      <aside className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2 text-white font-black uppercase italic text-xl">AradığınıBul</div>
        <nav className="space-y-2 flex-1">
          <Link href="/"><SidebarItem icon={<Store size={18} />} label="Ürün Marketi" /></Link>
          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18} />} label="Sepetim" /></Link>
          <Link href="/saved-cards"><SidebarItem icon={<CreditCard size={18} />} label="Kayıtlı Kartlarım" /></Link>
          <SidebarItem icon={<History size={18} />} label="Siparişlerim" active />
        </nav>
        <button onClick={() => { localStorage.removeItem('token'); router.push("/login"); }} className="flex items-center gap-3 text-white/40 hover:text-red-400 font-bold text-xs pt-6 border-t border-white/10 px-2 uppercase transition-all"><LogOut size={16} /> Çıkış Yap</button>
      </aside>

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white italic uppercase mb-10 tracking-tighter">Siparişlerim</h1>
        <div className="bg-black/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-amber-500 text-[10px] font-black uppercase">
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
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-white/80">
                    <td className="p-6 font-mono text-xs font-black">{o.id}</td>
                    <td className="p-6 text-xs font-bold">{o.date}</td>
                    <td className="p-6 text-sm font-black">₺{o.total.toLocaleString()}</td>
                    <td className="p-6"><span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase rounded-full">{o.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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