"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ShoppingCart, Package, BarChart3, Trash2, LogOut, Loader2, Moon, Sun, RefreshCw, Plus, Save, ChevronDown, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useDarkMode } from '@/lib/useDarkMode';

type Tab = 'dashboard' | 'users' | 'orders' | 'products';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, stock_quantity: 0, sku: '' });
    const [showAddProduct, setShowAddProduct] = useState(false);
    const router = useRouter();
    const theme = useDarkMode();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') { router.push('/'); return; }
        } catch { router.push('/login'); return; }
        loadDashboard();
    }, [router]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/dashboard');
            setDashboard(res.data);
        } catch (err: any) {
            if (err.response?.status === 403) router.push('/');
        } finally { setLoading(false); }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch { }
    };

    const loadOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data);
        } catch { }
    };

    const loadProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch { }
    };

    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        if (tab === 'dashboard') loadDashboard();
        if (tab === 'users') loadUsers();
        if (tab === 'orders') loadOrders();
        if (tab === 'products') loadProducts();
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    const updateUserRole = async (id: number, role: string) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            setUsers(users.map(u => u.id === id ? { ...u, role } : u));
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    const startEditProduct = (p: any) => {
        setEditingProduct(p.id);
        setEditForm({ name: p.name, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity, sku: p.sku || '' });
    };

    const saveProduct = async (id: number) => {
        try {
            await api.put(`/admin/products/${id}`, editForm);
            setEditingProduct(null);
            loadProducts();
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    const addProduct = async () => {
        try {
            await api.post('/products', newProduct);
            setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, sku: '' });
            setShowAddProduct(false);
            loadProducts();
        } catch (err: any) { alert(err.response?.data?.detail || 'Hata oluştu.'); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><Loader2 className="animate-spin text-red-500 w-12 h-12" /></div>;

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
        { id: 'users', label: 'Kullanıcılar', icon: <Users size={18} /> },
        { id: 'orders', label: 'Siparişler', icon: <ShoppingCart size={18} /> },
        { id: 'products', label: 'Ürünler', icon: <Package size={18} /> },
    ];

    const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const statusColors: any = {
        pending: 'bg-yellow-500/10 text-yellow-400',
        processing: 'bg-blue-500/10 text-blue-400',
        shipped: 'bg-purple-500/10 text-purple-400',
        delivered: 'bg-green-500/10 text-green-400',
        cancelled: 'bg-red-500/10 text-red-400',
    };

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0d0d14] text-slate-200 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0c0c12]/80 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <Shield size={24} className="text-red-500" />
                    <span className="text-white font-black uppercase italic text-lg">Admin Panel</span>
                </div>
                <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-widest mb-8 px-2">AradığınıBul Yönetim</p>

                <nav className="space-y-2 flex-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => switchTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="space-y-3 pt-6 border-t border-white/10">
                    <button onClick={theme.toggle} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-white/30 hover:text-white text-[10px] font-black uppercase hover:bg-white/5 transition-all">
                        {theme.isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
                        {theme.isDark ? 'Açık Mod' : 'Koyu Mod'}
                    </button>
                    <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="w-full flex items-center gap-3 text-white/30 hover:text-red-400 font-bold text-xs px-5 py-3 uppercase transition-all rounded-xl hover:bg-white/5">
                        <LogOut size={16} /> Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-10 max-w-7xl mx-auto">

                {/* ─── DASHBOARD ─── */}
                {activeTab === 'dashboard' && dashboard && (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Dashboard</h1>
                            <button onClick={loadDashboard} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><RefreshCw size={16} className="text-white/40" /></button>
                        </div>

                        {/* İSTATİSTİK KARTLARI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                                { label: 'Toplam Kullanıcı', value: dashboard.total_users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                                { label: 'Toplam Sipariş', value: dashboard.total_orders, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                { label: 'Toplam Ürün', value: dashboard.total_products, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                                { label: 'Toplam Gelir', value: `₺${dashboard.total_revenue.toLocaleString()}`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                            ].map((s, i) => (
                                <div key={i} className={`${s.bg} border backdrop-blur-3xl p-8 rounded-[2rem] shadow-xl`}>
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">{s.label}</p>
                                    <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* SON SİPARİŞLER VE KULLANICILAR */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 p-8">
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-6">Son Siparişler</h3>
                                <div className="space-y-3">
                                    {dashboard.recent_orders.map((o: any) => (
                                        <div key={o.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div>
                                                <p className="text-xs font-black text-white">#{o.id}</p>
                                                <p className="text-[9px] text-white/30">{o.user_email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-white font-mono">₺{o.total_price.toLocaleString()}</p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-white/10 text-white/40'}`}>{o.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 p-8">
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-6">Son Kayıtlar</h3>
                                <div className="space-y-3">
                                    {dashboard.recent_users.map((u: any) => (
                                        <div key={u.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div>
                                                <p className="text-xs font-black text-white">{u.first_name || ''} {u.last_name || ''}</p>
                                                <p className="text-[9px] text-white/30">{u.email}</p>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{u.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── KULLANICILAR ─── */}
                {activeTab === 'users' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Kullanıcılar</h1>
                            <button onClick={loadUsers} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><RefreshCw size={16} className="text-white/40" /></button>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-red-400 text-[10px] font-black uppercase">
                                        <th className="p-5">ID</th><th className="p-5">E-Posta</th><th className="p-5">Ad Soyad</th><th className="p-5">Telefon</th><th className="p-5">Rol</th><th className="p-5">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-mono text-xs font-black">{u.id}</td>
                                            <td className="p-5 text-xs">{u.email}</td>
                                            <td className="p-5 text-xs font-bold">{u.first_name || '-'} {u.last_name || ''}</td>
                                            <td className="p-5 text-xs text-white/40">{u.phone || '-'}</td>
                                            <td className="p-5">
                                                <select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-white outline-none">
                                                    <option value="customer">Customer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-5">
                                                <button onClick={() => deleteUser(u.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── SİPARİŞLER ─── */}
                {activeTab === 'orders' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Siparişler</h1>
                            <button onClick={loadOrders} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><RefreshCw size={16} className="text-white/40" /></button>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-red-400 text-[10px] font-black uppercase">
                                        <th className="p-5">ID</th><th className="p-5">Müşteri</th><th className="p-5">Tutar</th><th className="p-5">Durum</th><th className="p-5">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <>
                                            <tr key={o.id} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                                <td className="p-5 font-mono text-xs font-black">#{o.id}</td>
                                                <td className="p-5">
                                                    <p className="text-xs font-bold">{o.user_name}</p>
                                                    <p className="text-[9px] text-white/30">{o.user_email}</p>
                                                </td>
                                                <td className="p-5 text-sm font-black font-mono">₺{o.total_price.toLocaleString()}</td>
                                                <td className="p-5">
                                                    <select value={o.status} onClick={(e) => e.stopPropagation()} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                                        className={`border-0 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none cursor-pointer ${statusColors[o.status] || 'bg-white/10 text-white/40'}`}>
                                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-5 text-xs text-white/40 flex items-center gap-2">
                                                    {new Date(o.created_at).toLocaleDateString('tr-TR')}
                                                    <ChevronDown size={12} className={`transition-transform ${expandedOrder === o.id ? 'rotate-180' : ''}`} />
                                                </td>
                                            </tr>
                                            {expandedOrder === o.id && o.items.length > 0 && (
                                                <tr key={`${o.id}-items`}>
                                                    <td colSpan={5} className="p-0">
                                                        <div className="bg-black/30 px-8 py-5 border-t border-white/5">
                                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Sipariş Kalemleri</p>
                                                            {o.items.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-3 mb-2 border border-white/5">
                                                                    <span className="text-xs font-bold text-white">{item.product_name}</span>
                                                                    <div className="flex gap-6 text-xs">
                                                                        <span className="text-white/40">Miktar: <strong className="text-white">{item.quantity}</strong></span>
                                                                        <span className="text-white/40">Birim: <strong className="text-white font-mono">₺{item.unit_price.toLocaleString()}</strong></span>
                                                                        <span className="text-red-400 font-black font-mono">₺{(item.quantity * item.unit_price).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── ÜRÜNLER ─── */}
                {activeTab === 'products' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Ürünler</h1>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddProduct(!showAddProduct)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-400 transition-all"><Plus size={14} /> Yeni Ürün</button>
                                <button onClick={loadProducts} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"><RefreshCw size={16} className="text-white/40" /></button>
                            </div>
                        </div>

                        {/* YENİ ÜRÜN FORMU */}
                        {showAddProduct && (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 space-y-4">
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest">Yeni Ürün Ekle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input placeholder="Ürün Adı" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" />
                                    <input placeholder="Açıklama" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" />
                                    <input placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" />
                                    <input type="number" placeholder="Fiyat" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" />
                                    <input type="number" placeholder="Stok" value={newProduct.stock_quantity || ''} onChange={e => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" />
                                    <button onClick={addProduct} className="bg-red-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-400 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Ekle</button>
                                </div>
                            </div>
                        )}

                        {/* ÜRÜN TABLOSU */}
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-red-400 text-[10px] font-black uppercase">
                                        <th className="p-5">ID</th><th className="p-5">Ürün Adı</th><th className="p-5">Fiyat</th><th className="p-5">Stok</th><th className="p-5">SKU</th><th className="p-5">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-mono text-xs font-black">{p.id}</td>
                                            <td className="p-5">
                                                {editingProduct === p.id ? (
                                                    <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full" />
                                                ) : (
                                                    <span className="text-xs font-bold">{p.name}</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {editingProduct === p.id ? (
                                                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-24 font-mono" />
                                                ) : (
                                                    <span className="text-sm font-black font-mono">₺{p.price.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {editingProduct === p.id ? (
                                                    <input type="number" value={editForm.stock_quantity} onChange={e => setEditForm({ ...editForm, stock_quantity: parseInt(e.target.value) })} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-20" />
                                                ) : (
                                                    <span className={`text-xs font-black ${p.stock_quantity < 10 ? 'text-red-400' : 'text-green-400'}`}>{p.stock_quantity}</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-xs text-white/30 font-mono">{p.sku || '-'}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    {editingProduct === p.id ? (
                                                        <button onClick={() => saveProduct(p.id)} className="text-green-400 hover:text-green-300 transition-colors"><Save size={16} /></button>
                                                    ) : (
                                                        <button onClick={() => startEditProduct(p)} className="text-white/20 hover:text-blue-400 transition-colors text-[9px] font-black uppercase bg-white/5 px-3 py-1.5 rounded-lg">Düzenle</button>
                                                    )}
                                                    <button onClick={() => deleteProduct(p.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
