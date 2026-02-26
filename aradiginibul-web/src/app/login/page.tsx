"use client";

import { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (error: any) {
      // image_89b005'deki [object Object] hatasını önlemek için güvenli mesaj
      const errorMsg = error.response?.data?.detail || "Giriş başarısız! Bilgilerinizi kontrol edin.";
      alert(typeof errorMsg === 'string' ? errorMsg : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-slate-950"
    >
      {/* 🌊 MOUSE IŞIĞI - PARLAKLIĞI %50'YE ÇIKARILDI */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.5), transparent 75%)`
        }}
      />

      {/* 🎬 ARKA PLAN VİDEO */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-loops-blue-background-27661-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
      </div>

      <div className="relative z-20 max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 border border-white/20">
          <div className="text-center mb-10">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(37,99,235,0.7)]">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Tekrar Hoş Geldiniz</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">B2B Paneline güvenli giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-focus-within:text-blue-400" />
              <input 
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white font-medium" 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-focus-within:text-blue-400" />
              <input 
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white font-medium" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-500 hover:text-blue-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:bg-slate-800"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Giriş Yap <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            {/* Hatalı Link kapanış etiketi burada düzeltildi */}
            <p className="text-sm text-slate-400 font-medium">
              Hesabınız yok mu? <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300">Kayıt Ol</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}