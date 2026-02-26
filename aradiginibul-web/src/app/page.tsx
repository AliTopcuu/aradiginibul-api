"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, TrendingDown, Search, Filter, LogOut, User } from 'lucide-react';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 🔑 Giriş Kontrolü: Tarayıcıda token yoksa login sayfasına at
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Token varsa Railway API'den ürünleri çek
    api.get('/products/')
      .then((res: any) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ürünler çekilemedi:", err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Yönlendirme sırasında boş ekran göstererek içeriğin "parlamasını" (flicker) önle
  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Üst Menü - Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              AradığınıBul <span className="text-blue-600 font-light">B2B</span>
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full">
              <Search className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Hızlı ürün arama..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                0
              </span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* karşılama Mesajı */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Hoş Geldiniz 👋</h2>
            <p className="text-slate-500 font-medium mt-1">İşletmeniz için seçilmiş en iyi toptan fırsatları keşfedin.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:shadow-md transition-all">
              <Filter className="w-4 h-4" /> Filtreler
            </button>
          </div>
        </div>

        {/* Ürün Listesi */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-400 font-medium animate-pulse">Ürünler Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.length > 0 ? products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-[2rem] border border-slate-100 p-5 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100/50 transition-all group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                   <span className="bg-emerald-50 text-emerald-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-100">
                    Stokta
                  </span>
                </div>

                <div className="w-full h-48 bg-slate-50 rounded-3xl mb-5 flex items-center justify-center text-slate-200 group-hover:bg-blue-50 transition-colors">
                  <Package size={80} strokeWidth={1} />
                </div>

                <div className="flex-grow px-1">
                  <h3 className="font-bold text-slate-900 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-6 font-medium">
                    {product.description || "Toptan alıma uygun yüksek kaliteli ürün."}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-slate-900">{product.price}</span>
                    <span className="text-lg font-bold text-slate-900">₺</span>
                    <span className="text-[11px] text-slate-400 font-bold ml-1">/ birim</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 px-3 py-2.5 rounded-2xl text-[11px] font-bold border border-amber-100/30 mb-5">
                    <TrendingDown size={16} />
                    <span>Çoklu alımlarda %15'e varan indirim</span>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all active:scale-95">
                    SEPETE EKLE
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Package className="mx-auto text-slate-200 mb-6 w-16 h-16" />
                <h3 className="text-xl font-bold text-slate-900">Katalog Henüz Boş</h3>
                <p className="text-slate-400 text-sm mt-2">Admin panelinden ilk ürünleri eklediğinizde burada görünecekler.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}