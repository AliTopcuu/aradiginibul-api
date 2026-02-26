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
      // 🔑 PostgreSQL ve FastAPI şemasına tam uyumlu veri gönderimi
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName, // Backend 'first_name' bekliyor
        last_name: formData.lastName,   // Backend 'last_name' bekliyor
        phone: formData.phone           // Telefon bilgisi
      });
      
      alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
      router.push('/login');
    } catch (error: any) {
      console.error("Hata objesi:", error);
      const detail = error.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        // Pydantic doğrulama hataları (Örn: Geçersiz e-posta formatı)
        alert(`Hata: ${detail[0].msg}`);
      } else {
        // Backend'den gelen özel hata mesajı (Örn: "Email already registered")
        alert(detail || "Kayıt sırasında bir hata oluştu. Bilgileri kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <User className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hesap Oluştur</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">AradığınıBul B2B ailesine katılın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* İsim & Soyisim yan yana */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İSİM</label>
              <input 
                type="text" required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Ali"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">SOYİSİM</label>
              <input 
                type="text" required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Topçu"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900" 
              />
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-POSTA ADRESİ</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ali@ornek.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900" 
              />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">TELEFON</label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
              <input 
                type="tel" required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="0538 XXX XX XX"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900" 
              />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ŞİFRE</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-slate-900" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all disabled:bg-slate-300 group mt-4 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>Kayıt Ol <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-8 font-medium">
            Zaten hesabınız var mı? <Link href="/login" className="text-blue-600 font-bold hover:underline transition-all">Giriş Yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
}