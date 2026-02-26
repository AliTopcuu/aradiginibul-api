"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { LayoutDashboard, Package, LogOut, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = "/login"; return; }

    api.get('/auth/me')
      .then(res => {
        setUser(res.data); // Backend'den gelen first_name ve last_name burada
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = "/login";
      });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar ve Header kısımları buraya */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900">
            Hoş Geldin, <span className="text-blue-600">{user?.first_name} {user?.last_name}!</span> 👋
          </h1>
          <p className="text-slate-500 mt-2 font-medium">PostgreSQL üzerindeki profil bilgileriniz başarıyla senkronize edildi.</p>
        </div>
      </main>
    </div>
  );
}