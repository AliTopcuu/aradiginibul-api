"use client";

import { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'; // İkonlar eklendi
// ... diğer importlar aynı

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false); // Şifre görünürlük state'i
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ... handleLogin fonksiyonu aynı kalacak

  return (
    // ... dış kapsayıcılar aynı
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre</label>
      <div className="relative">
        <Lock className="absolute left-4 top-3.5 text-slate-300 w-5 h-5" />
        
        <input 
          type={showPassword ? "text" : "password"} // Dinamik tip değişimi
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900" 
        />

        {/* Göz Simgesi Butonu */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
    // ... geri kalan buton ve form yapısı aynı
  );
}