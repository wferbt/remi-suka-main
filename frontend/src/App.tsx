import { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Loader2, Moon, Sun, Store, User, CheckCircle2, ShoppingBag, Trash2, X, Search, ChevronLeft } from 'lucide-react';
import api from './api';

// Картинки
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

type ProductRaw = { externalId?: string; id?: string; name: string; price: number; stock: number; };
type Product = ProductRaw & { uid: string }; 
type CartItem = Product & { quantity: number; };
type Order = { id: string; date: string; items: CartItem[]; total: number };

const CATEGORIES = [
  { id: '', name: 'Все', img: 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png' },
  { id: 'Молоко', name: 'Молоко', img: milkImg },
  { id: 'Кефир', name: 'Кефир', img: kefirImg },
  { id: 'Сметана', name: 'Сметана', img: smetanaImg },
  { id: 'Творог', name: 'Творог', img: tvorogImg },
];

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [view, setView] = useState<'shop' | 'admin' | 'profile'>('shop');
  
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('orders') || '[]'));

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    api.get('/catalog').then(res => { 
      const safeProducts = res.data.map((p: ProductRaw, index: number) => ({
        ...p,
        uid: p.externalId || p.id || `prod-${index}-${Date.now()}`
      }));
      setProducts(safeProducts); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = p.name.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const updateQuantity = (product: Product, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.uid === product.uid);
      if (idx !== -1) {
        const newQty = prev[idx].quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.uid !== product.uid);
        const newCart = [...prev];
        newCart[idx] = { ...newCart[idx], quantity: newQty };
        return newCart;
      } 
      if (delta > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 7).toUpperCase(),
        date: new Date().toLocaleString(),
        items: [...cart],
        total
      };
      setOrders([newOrder, ...orders]);
      setIsPaying(false);
      setPaymentSuccess(true);
      setCart([]);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const login = formData.get('username') as string;
    const pass = formData.get('password') as string;

    if (login === 'admin' && pass === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setUser('Админ');
      localStorage.setItem('user', 'Админ');
      setView('admin');
    } else {
      setIsAdmin(false);
      localStorage.setItem('isAdmin', 'false');
      setUser(login);
      localStorage.setItem('user', login);
      setView('shop');
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null); setIsAdmin(false);
    localStorage.removeItem('user'); localStorage.removeItem('isAdmin');
    setView('shop');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (view === 'profile') {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('shop')} className="flex items-center gap-2 mb-8 font-bold text-[#E63946]"><ChevronLeft size={20}/> В магазин</button>
          <h1 className="text-3xl font-bold mb-6">История заказов</h1>
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-gray-500">Заказов пока нет</p>}
            {orders.map(order => (
              <div key={order.id} className={`p-5 rounded-[24px] border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-sm'}`}>
                <div className="flex justify-between font-bold mb-2"><span>Заказ {order.id}</span><span>{order.total} ₸</span></div>
                <div className="text-sm opacity-60 mb-2">{order.date}</div>
                <div className="text-xs space-y-1">{order.items.map(i => <div key={i.uid}>{i.name} — {i.quantity} шт.</div>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAdmin) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            <div className="flex gap-2">
              <button onClick={() => setView('shop')} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-xl font-bold">Магазин</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-[#E63946] text-white rounded-xl font-bold">Выход</button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1d21] rounded-[30px] shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-400 uppercase">
                <tr><th className="p-6">Наименование</th><th className="p-6">Цена</th><th className="p-6 text-right">Удалить</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.uid} className="border-t border-gray-100 dark:border-white/5">
                    <td className="p-6 font-bold">{p.name}</td>
                    <td className="p-6">{p.price} ₸</td>
                    <td className="p-6 text-right"><button onClick={() => setProducts(prev => prev.filter(x => x.uid !== p.uid))} className="text-red-500"><Trash2 size={20}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      <nav className={`sticky top-0 z-50 border-b h-16 flex items-center px-4 justify-between backdrop-blur-md ${isDark ? 'bg-[#1a1d21]/90 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-[#E63946] p-2 rounded-xl text-white"><Store size={20} /></div>
          <span className="text-xl font-bold uppercase hidden sm:block">Aul Market</span>
        </div>
        <div className="flex-1 max-w-xs mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск..." className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 outline-none text-sm focus:ring-1 ring-[#E63946]" />
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <button onClick={() => setView('admin')} className="p-2 bg-[#E63946] text-white rounded-lg font-bold text-[10px]">ADMIN</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-gray-500/10">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => user ? setView('profile') : setShowLogin(true)} className="p-2 rounded-lg bg-gray-500/10 flex items-center gap-2">
            <User size={20} /> {user && <span className="text-xs font-bold hidden md:block">{user}</span>}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-10 overflow-x-auto scrollbar-hide flex gap-6 pb-2">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 ${selectedCategory === cat.id ? 'border-[#E63946] bg-white scale-110 shadow-lg shadow-red-500/10' : 'bg-gray-100 dark:bg-[#2A2D31] border-transparent'}`}>
                <img src={cat.img} alt={cat.name} className={`w-full h-full object-cover ${cat.id === '' ? 'p-3' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedCategory === cat.id ? 'text-[#E63946]' : 'text-gray-400'}`}>{cat.name}</span>
            </button>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const inCart = cart.find(i => i.uid === p.uid);
                  return (
                    <div key={p.uid} className={`card-container p-2 border transition-all ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white border-transparent shadow-sm'}`}>
                      <div className="image-container aspect-square bg-white mb-2"><img src={p.name.toLowerCase().includes('молоко') ? milkImg : p.name.toLowerCase().includes('кефир') ? kefirImg : p.name.toLowerCase().includes('сметана') ? smetanaImg : p.name.toLowerCase().includes('творог') ? tvorogImg : 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png'} className="w-full h-full object-contain p-2" /></div>
                      <div className="px-2 pb-2">
                        <h3 className="font-bold text-xs mb-1 h-8 line-clamp-2">{p.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">{p.price} ₸</span>
                          {!inCart ? <button onClick={() => updateQuantity(p, 1)} className="bg-[#E63946] text-white w-8 h-8 rounded-full flex items-center justify-center"><Plus size={18} /></button> : (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1"><button onClick={() => updateQuantity(p, -1)} className="w-6 h-6 bg-white dark:bg-white/10 rounded-full text-[#E63946] flex items-center justify-center"><Minus size={14}/></button><span className="text-sm font-bold w-4 text-center">{inCart.quantity}</span><button onClick={() => updateQuantity(p, 1)} className="w-6 h-6 bg-[#E63946] text-white rounded-full flex items-center justify-center"><Plus size={14}/></button></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className={`p-6 rounded-[30px] sticky top-20 border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-xl border-transparent'}`}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#E63946]"><ShoppingBag size={20} /> Корзина</h2>
              {!paymentSuccess ? (
                <>
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.uid} className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl">
                        <p className="text-xs font-bold">{item.name}</p>
                        <div className="flex justify-between items-center"><p className="text-[#E63946] font-bold">{item.price * item.quantity} ₸</p><div className="flex items-center gap-2"><button onClick={() => updateQuantity(item, -1)} className="w-6 h-6 rounded bg-gray-200 dark:bg-white/10 flex items-center justify-center"><Minus size={12}/></button><span className="text-xs font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item, 1)} className="w-6 h-6 rounded bg-[#E63946] text-white flex items-center justify-center"><Plus size={12}/></button></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4"><div className="flex justify-between mb-4 font-bold text-lg"><span>Итого</span><span>{total} ₸</span></div><button onClick={handlePayment} disabled={cart.length === 0 || isPaying} className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-bold flex items-center justify-center gap-2">{isPaying ? <Loader2 className="animate-spin"/> : 'Оплатить'}</button></div>
                </>
              ) : (
                <div className="py-10 text-center animate-in zoom-in"><CheckCircle2 className="text-green-500 mx-auto mb-4" size={40} /><h3 className="font-bold mb-2">Оплачено!</h3><button onClick={() => setView('profile')} className="text-[#E63946] text-sm underline">В заказы</button></div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm p-8 rounded-[40px] bg-white dark:bg-[#1a1d21]">
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-gray-400"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 text-center uppercase">Вход</h2>
            <form onSubmit={handleLogin} className="space-y-4"><input required name="username" placeholder="Логин" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none" /><input required name="password" type="password" placeholder="Пароль" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none" /><button type="submit" className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-bold">Войти</button></form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;