"use client";

import { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 🔑 PostgreSQL ve FastAPI şemasına tam uyumlu gönderim
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      });
      
      alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
      router.push('/login');
    } catch (error: any) {
      console.error("Detaylı Hata:", error);
      
      if (error.message === "Network Error") {
        alert("API Bağlantı Hatası: Backend sunucusuna ulaşılamıyor. Railway servisinin açık olduğundan emin olun.");
      } else {
        const detail = error.response?.data?.detail;
        alert(detail || "Kayıt sırasında bir hata oluştu. Bilgileri kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hesap Oluştur</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" placeholder="İsim" required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
            <input 
              type="text" placeholder="Soyisim" required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
            <input 
              type="email" placeholder="E-posta" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
            <input 
              type="tel" placeholder="Telefon (05xx...)" required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
            <input 
              type={showPassword ? "text" : "password"} placeholder="Şifre" required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Kayıt Ol <ArrowRight size={20} /></>}
          </button>
          <p className="text-center text-sm text-slate-500 mt-6 font-medium">
            Zaten hesabınız var mı? <Link href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
}