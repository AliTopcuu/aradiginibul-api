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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (error: any) {
      alert(error.response?.data?.detail || "Giriş başarısız!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* 🎬 HAREKETLİ ARKA PLAN (VİDEO) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 scale-105"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-loops-blue-background-27661-large.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Arka planın üzerine koyu bir katman (Overlay) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/40 to-slate-900/80"></div>
      </div>

      {/* 📦 GİRİŞ KARTI (CENTERED) */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 border border-white/20">
          <div className="text-center mb-10">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tekrar Hoş Geldiniz</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">B2B Paneline güvenli erişim sağlayın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">E-POSTA ADRESİ</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@ornek.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">ŞİFRE</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-300 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Giriş Yap <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Hesabınız yok mu? <Link href="/register" className="text-blue-600 font-bold hover:underline">Ücretsiz Kayıt Ol</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}