"use client";

import { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      
      // Token'ı yerel depolamaya kaydet
      localStorage.setItem('token', response.data.access_token);
      
      // 🚀 Kritik Değişiklik: Yönlendirme döngüsünü kırmak için sayfayı tazeleyerek yönlendir
      window.location.href = "/";
    } catch (error: any) {
      alert("Giriş başarısız! E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tekrar Hoş Geldiniz</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">B2B Paneline erişmek için giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-POSTA</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-300 w-5 h-5" />
              <input 
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali@ornek.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ŞİFRE</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Giriş Yap <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Hesabınız yok mu? <Link href="/register" className="text-blue-600 font-bold hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}