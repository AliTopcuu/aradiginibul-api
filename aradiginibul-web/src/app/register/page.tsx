"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend'deki /auth/register ucuna tam uyumlu veri gönderimi
      await api.post('/auth/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      alert("Hesabınız başarıyla oluşturuldu!");
      router.push('/login');
    } catch (err: any) {
      alert("Hata: " + (err.response?.data?.detail || "Kayıt işlemi başarısız."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hesap Oluştur</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">B2B ekosistemimize hemen katılın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input 
                placeholder="Ad" required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className="relative">
              <input 
                placeholder="Soyad" required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
            <input 
              type="email" placeholder="E-posta" required 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
            <input 
              type="tel" placeholder="Telefon (05xx)" required 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
            <input 
              type="password" placeholder="Şifre" required 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Kaydı Tamamla <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Zaten hesabınız var mı? <Link href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}