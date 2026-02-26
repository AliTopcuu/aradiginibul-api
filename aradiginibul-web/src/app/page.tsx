"use client";

import { useEffect, useState } from 'react';
import { ShoppingCart, Package, TrendingDown, Search, Filter } from 'lucide-react';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Railway üzerindeki canlı API'den ürünleri çekiyoruz
    api.get('/products/')
      .then((res: any) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Hatası:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Üst Menü - Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              AradığınıBul <span className="text-blue-600 font-light">B2B</span>
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Ürün, kategori veya marka ara..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              0
            </span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Başlık Alanı */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Ürün Kataloğu</h2>
            <p className="text-slate-500 text-sm mt-1">İşletmeniz için en uygun toptan fiyatlar listeleniyor.</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filtrele
          </button>
        </div>

        {/* Ürün Izgarası (Grid) */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-500 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="relative w-full h-44 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 transition-colors">
                  <Package size={64} strokeWidth={1} />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase">Stokta</span>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 text-lg leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {product.description || "Bu ürün için açıklama bulunmuyor."}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-slate-900">{product.price} ₺</span>
                    <span className="text-[11px] text-slate-400 font-medium">/ birim</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-[11px] font-semibold border border-amber-100/50 mb-4">
                    <TrendingDown size={14} />
                    <span>Toptan alımda özel indirim</span>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 shadow-md hover:shadow-blue-200 transition-all active:scale-95">
                    Sepete Ekle
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Package className="mx-auto text-slate-300 mb-4 w-12 h-12" />
                <h3 className="text-lg font-medium text-slate-900">Henüz ürün bulunamadı</h3>
                <p className="text-slate-500 text-sm mt-1">Lütfen daha sonra tekrar kontrol edin veya admin panelinden ürün ekleyin.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}