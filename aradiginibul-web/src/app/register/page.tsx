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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
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
        alert("API Bağlantı Hatası: Backend sunucusuna ulaşılamıyor.");
      } else {
        const detail = error.response?.data?.detail;
        alert(detail || "Kayıt sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-slate-950"
    >
      {/* 🌊 SARI MOUSE IŞIĞI */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(1100px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 179, 8, 0.45), transparent 80%)`
        }}
      />

      {/* ARKA PLAN VİDEO KATMANI */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 scale-105">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-loops-blue-background-27661-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
      </div>

      {/* 📦 KAYIT KARTI */}
      <div className="relative z-20 max-w-md w-full mx-4 my-12">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10">
          <div className="text-center mb-8">
            <div className="bg-yellow-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(234,179,8,0.5)]">
              <User className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Hesap Oluştur</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Yeni bir bayi hesabı oluşturun</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* İsim Alanı - Renkler Beyaza Çekildi */}
              <input 
                type="text" placeholder="İsim" required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white placeholder:text-white/70 text-sm" 
              />
              {/* Soyisim Alanı - Renkler Beyaza Çekildi */}
              <input 
                type="text" placeholder="Soyisim" required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white placeholder:text-white/70 text-sm" 
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-500 w-4 h-4" />
              <input 
                type="email" placeholder="E-posta" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white placeholder:text-white/70 text-sm" 
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-4 text-slate-500 w-4 h-4" />
              <input 
                type="tel" placeholder="Telefon (05xx...)" required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white placeholder:text-white/70 text-sm" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-500 w-4 h-4" />
              <input 
                type={showPassword ? "text" : "password"} placeholder="Şifre" required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white placeholder:text-white/70 text-sm" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-yellow-500 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-600 active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/20 disabled:bg-slate-800"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Kayıt Ol <ArrowRight size={20} /></>}
            </button>
            
            <p className="text-center text-sm text-slate-400 mt-6 font-medium">
              Zaten hesabınız var mı? <Link href="/login" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors">Giriş Yap</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}