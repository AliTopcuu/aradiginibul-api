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
      // Backend OAuth2 Password request form beklediği için FormData kullanıyoruz
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Token'ı yerel depolamaya kaydet
      localStorage.setItem('token', response.data.access_token);
      
      // Giriş başarılıysa ana sayfaya yönlendir
      router.push('/');
    } catch (error: any) {
      // Hata mesajını kullanıcıya göster
      const errorMsg = error.response?.data?.detail || "Giriş başarısız! Bilgilerinizi kontrol edin.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tekrar Hoş Geldiniz</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">B2B Paneline erişmek için bilgilerinizi girin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* E-Posta Alanı */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-POSTA</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ali@ornek.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 font-medium" 
              />
            </div>
          </div>

          {/* Şifre Alanı */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ŞİFRE</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 font-medium" 
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

          {/* Giriş Butonu */}
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>Giriş Yap <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Hesabınız yok mu? <Link href="/register" className="text-blue-600 font-bold hover:underline">Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}