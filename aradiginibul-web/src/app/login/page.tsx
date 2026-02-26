"use client";
import { useState } from 'react';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      window.location.href = "/";
    } catch (err: any) {
      alert(err.response?.data?.detail || "Giriş başarısız!");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Tasarım kodlarınız... */}
      <button disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Giriş Yap"}</button>
    </form>
  );
}