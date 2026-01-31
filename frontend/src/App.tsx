import { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Loader2, Moon, Sun, Store, User, CheckCircle2, ShoppingBag, Trash2, X, Search, ChevronLeft, Mail, Lock, CreditCard, Calendar, ShieldCheck } from 'lucide-react';
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
type UserData = { name: string; email: string; isAdmin: boolean; avatar?: string };

// КАТЕГОРИИ
const CATEGORIES = [
  { id: '', name: 'Все', img: 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png' },
  { id: 'молоко', name: 'Кисломолочка', img: milkImg },
  { id: 'мясо', name: 'Мясо', img: 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png' },
  { id: 'крекер', name: 'Крекеры', img: 'https://cdn-icons-png.flaticon.com/512/3014/3014534.png' },
];

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [view, setView] = useState<'shop' | 'admin' | 'profile'>('shop');
  
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('orders') || '[]'));

  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    api.get('/catalog').then(res => { 
      const safeProducts = res.data.map((p: ProductRaw, index: number) => ({
        ...p,
        stock: p.stock !== undefined ? p.stock : 10,
        uid: p.externalId || p.id || `prod-${index}-${Date.now()}`
      }));
      setProducts(safeProducts); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
    if (currentUser) {
      localStorage.setItem('user_data', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user_data');
    }
  }, [orders, currentUser]);

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
      const currentInCart = idx !== -1 ? prev[idx].quantity : 0;

      if (delta > 0 && currentInCart + delta > product.stock) {
        alert(`Извините, в наличии осталось только ${product.stock} шт.`);
        return prev;
      }

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
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    setShowCardModal(true);
  };

  const confirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCardModal(false);
    setIsPaying(true);
    
    setTimeout(() => {
      setProducts(prev => prev.map(p => {
        const itemInCart = cart.find(c => c.uid === p.uid);
        return itemInCart ? { ...p, stock: p.stock - itemInCart.quantity } : p;
      }));

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

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;

    if (authMode === 'register') {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        alert('Такой email уже зарегистрирован!');
        return;
      }
      users.push({ email, pass, name: email.split('@')[0] });
      localStorage.setItem('registered_users', JSON.stringify(users));
      alert('Аккаунт успешно создан! Теперь войдите.');
      setAuthMode('login');
      return;
    }

    if (email === 'admin@gmail.com' && pass === 'admin') {
      setCurrentUser({ name: 'Администратор', email, isAdmin: true });
      setView('admin');
    } else {
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const found = users.find((u: any) => u.email === email && u.pass === pass);
      if (found) {
        setCurrentUser({ name: found.name, email, isAdmin: false });
        setView('shop');
      } else {
        alert('Неверные данные для входа');
        return;
      }
    }
    setShowAuth(false);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser: UserData = {
        name: 'Name Google',
        email: 'example@google.com',
        isAdmin: false,
        avatar: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' 
      };
      setCurrentUser(googleUser);
      setLoading(false);
      setShowAuth(false);
      setView('shop');
    }, 1500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('shop');
    localStorage.removeItem('user_data');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getImg = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('молоко')) return milkImg;
    if (n.includes('кефир')) return kefirImg;
    if (n.includes('сметана')) return smetanaImg;
    if (n.includes('творог')) return tvorogImg;
    if (n.includes('мясо') || n.includes('колбаса') || n.includes('фарш')) return 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png';
    if (n.includes('крекер') || n.includes('печенье')) return 'https://cdn-icons-png.flaticon.com/512/3014/3014534.png';
    return 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
  };

  if (view === 'profile' && currentUser) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('shop')} className="flex items-center gap-2 mb-8 font-bold text-[#E63946] hover:opacity-80"><ChevronLeft size={20}/> В магазин</button>
          
          <div className={`p-8 rounded-[30px] border mb-8 flex flex-col items-center text-center ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-xl border-transparent'}`}>
             <div className="w-24 h-24 bg-gray-100 dark:bg-white/10 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-[#E63946]/20">
               {currentUser.avatar ? <img src={currentUser.avatar} /> : <User size={40} className="text-[#E63946]" />}
             </div>
             <h1 className="text-2xl font-bold">{currentUser.name}</h1>
             <p className="text-gray-500 mb-6">{currentUser.email}</p>
             <button onClick={handleLogout} className="px-6 py-2 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all">Выйти из аккаунта</button>
          </div>

          <h2 className="text-xl font-bold mb-6 text-center sm:text-left">История чеков</h2>
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-gray-500 italic">Заказов пока не было</p>}
            {orders.map(order => (
              <div key={order.id} className={`p-6 rounded-[30px] border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-sm'}`}>
                <div className="flex justify-between font-bold mb-2 text-[#E63946]"><span>#{order.id}</span><span>{order.total} ₸</span></div>
                <div className="text-sm opacity-50 mb-4">{order.date}</div>
                <div className="text-xs space-y-1">{order.items.map(i => <div key={i.uid} className="flex justify-between"><span>{i.name} x{i.quantity}</span><span>{i.price * i.quantity} ₸</span></div>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin' && currentUser?.isAdmin) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Управление складом</h1>
            <div className="flex gap-3">
              <button onClick={() => setView('shop')} className="px-5 py-2.5 bg-gray-200 dark:bg-white/10 rounded-2xl font-bold">Магазин</button>
              <button onClick={handleLogout} className="px-5 py-2.5 bg-[#E63946] text-white rounded-2xl font-bold shadow-lg shadow-red-500/20">Выход</button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1d21] rounded-[30px] shadow-2xl overflow-hidden border dark:border-white/5">
             <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-white/5 text-[10px] text-gray-400 uppercase tracking-widest">
                <tr><th className="p-6">Наименование</th><th className="p-6">Цена</th><th className="p-6">В наличии</th><th className="p-6 text-right">Удалить</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {products.map(p => (
                  <tr key={p.uid} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 font-bold">{p.name}</td>
                    <td className="p-6">{p.price} ₸</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {p.stock} шт.
                      </span>
                    </td>
                    <td className="p-6 text-right"><button onClick={() => setProducts(prev => prev.filter(x => x.uid !== p.uid))} className="text-red-500 hover:scale-125 transition-transform inline-block"><Trash2 size={20}/></button></td>
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
          <div className="bg-[#E63946] p-2 rounded-xl text-white shadow-lg shadow-red-500/20"><Store size={20} /></div>
          <span className="text-xl font-bold uppercase tracking-tighter hidden sm:block">Aul Market</span>
        </div>
        <div className="flex-1 max-w-sm mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по продуктам..." className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 outline-none text-sm focus:ring-1 ring-[#E63946] transition-all" />
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.isAdmin && <button onClick={() => setView('admin')} className="px-3 py-1.5 bg-[#E63946] text-white rounded-lg font-bold text-[10px]">ADMIN</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-gray-500/10 transition-colors">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => currentUser ? setView('profile') : (setAuthMode('login'), setShowAuth(true))} className="p-2 rounded-lg bg-gray-500/10 flex items-center gap-2 hover:bg-[#E63946]/10 transition-colors">
            {currentUser?.avatar ? <img src={currentUser.avatar} className="w-5 h-5 rounded-full" /> : <User size={20} />} 
            {currentUser && <span className="text-xs font-bold hidden md:block">{currentUser.name}</span>}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-10 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-2 group">
              <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center transition-all border-2 overflow-hidden ${selectedCategory === cat.id ? 'border-[#E63946] bg-white scale-110 shadow-lg' : 'bg-gray-100 dark:bg-[#2A2D31] border-transparent group-hover:border-gray-300'}`}>
                <img src={cat.img} alt={cat.name} className={`w-full h-full object-cover p-2 ${cat.id === '' ? 'opacity-50' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedCategory === cat.id ? 'text-[#E63946]' : 'text-gray-400'}`}>{cat.name}</span>
            </button>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {filteredProducts.map((p) => {
                  const inCart = cart.find(i => i.uid === p.uid);
                  return (
                    <div key={p.uid} className={`card-container p-2 border transition-all duration-300 rounded-[30px] ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white border-transparent shadow-sm hover:shadow-lg hover:-translate-y-1'}`}>
                      <div className="image-container aspect-square bg-white mb-3 flex items-center justify-center border border-gray-50 relative rounded-[20px] overflow-hidden">
                        <img src={getImg(p.name)} className="w-full h-full object-contain p-2 transition-transform hover:scale-105" />
                        {p.stock <= 0 && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">ЗАКОНЧИЛСЯ</span>
                          </div>
                        )}
                      </div>
                      <div className="px-3 pb-3">
                        <h3 className="font-bold text-sm mb-2 h-10 line-clamp-2 leading-tight">{p.name}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold block">{p.price} ₸</span>
                            <span className={`text-[10px] font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-green-500 opacity-80'}`}>
                              {p.stock <= 0 ? 'Нет в наличии' : p.stock <= 5 ? `Мало: ${p.stock} шт.` : `В наличии: ${p.stock} шт.`}
                            </span>
                          </div>
                          {!inCart ? (
                            <button onClick={() => updateQuantity(p, 1)} disabled={p.stock <= 0} className="bg-[#E63946] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#d62839] active:scale-90 transition-all shadow-md disabled:bg-gray-300 disabled:shadow-none"><Plus size={22} /></button>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1 pr-2 animate-in zoom-in duration-200">
                              <button onClick={() => updateQuantity(p, -1)} className="w-8 h-8 bg-white dark:bg-white/10 rounded-full text-[#E63946] flex items-center justify-center hover:shadow-sm"><Minus size={16}/></button>
                              <span className="font-bold text-base w-4 text-center">{inCart.quantity}</span>
                              <button onClick={() => updateQuantity(p, 1)} className="w-8 h-8 bg-[#E63946] text-white rounded-full flex items-center justify-center hover:bg-[#d62839]"><Plus size={16}/></button>
                            </div>
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
            <div className={`p-6 rounded-[30px] sticky top-20 border transition-all ${isDark ? 'bg-[#1a1d21] border-white/5 shadow-2xl' : 'bg-white shadow-xl border-transparent'}`}>
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-[#E63946]"><ShoppingBag size={22} /> Корзина</h2>
              {!paymentSuccess ? (
                <>
                  <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.uid} className="flex flex-col gap-3 p-4 bg-gray-50/50 dark:bg-white/5 rounded-[24px] relative border dark:border-white/5">
                        <div className="flex justify-between items-start"><p className="text-xs font-bold leading-tight pr-6">{item.name}</p><button onClick={() => updateQuantity(item, -item.quantity)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></div>
                        <div className="flex justify-between items-center"><p className="text-[#E63946] font-bold">{item.price * item.quantity} ₸</p><div className="flex items-center gap-2 bg-white dark:bg-black/20 p-1 rounded-lg"><button onClick={() => updateQuantity(item, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-white/10"><Minus size={14}/></button><span className="text-xs font-bold w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#E63946] text-white"><Plus size={14}/></button></div></div>
                      </div>
                    ))}
                    {cart.length === 0 && <p className="text-center py-10 text-gray-400 italic text-sm">Здесь пока пусто...</p>}
                  </div>
                  <div className="border-t-2 border-dashed border-gray-100 dark:border-white/10 pt-6">
                    <div className="flex justify-between mb-6 font-bold uppercase text-xs tracking-wider"><span>К оплате</span><span className="text-2xl text-[#E63946] tracking-tighter">{total} ₸</span></div>
                    <button onClick={handlePayment} disabled={cart.length === 0 || isPaying} className="w-full py-5 bg-[#E63946] text-white rounded-2xl font-bold flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50">{isPaying ? <Loader2 className="animate-spin"/> : 'Оформить заказ'}</button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center animate-in zoom-in slide-in-from-bottom-4"><CheckCircle2 className="text-green-500 mx-auto mb-4" size={60} /><h3 className="text-xl font-bold mb-2">Успешно!</h3><button onClick={() => setView('profile')} className="text-[#E63946] text-sm font-bold hover:underline">Где мой чек?</button></div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* МОДАЛКИ (Оплата и Авторизация) */}
      {showCardModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-md p-8 rounded-[30px] shadow-2xl border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white'} animate-in zoom-in duration-300`}>
            
            <button onClick={() => setShowCardModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><CreditCard size={24}/></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Оплата заказа</h2>
                <p className="text-xs text-gray-500">Введите данные вашей карты</p>
              </div>
            </div>
            
            <form onSubmit={confirmPayment} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Номер карты</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input required type="text" placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-blue-500 transition-all font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Срок</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input required type="text" placeholder="ММ/ГГ" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-blue-500 transition-all font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">CVC</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input required type="password" placeholder="***" maxLength={3} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-blue-500 transition-all font-mono" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all">
                Оплатить {total} ₸
              </button>
            </form>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm p-8 rounded-[30px] shadow-2xl border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white'} animate-in zoom-in duration-300`}>
         
            <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-bold mb-2 text-center uppercase tracking-tighter">{authMode === 'login' ? 'С возвращением!' : 'Новый аккаунт'}</h2>
            <p className="text-gray-500 text-center text-xs mb-8">{authMode === 'login' ? 'Рады видеть вас снова' : 'Заполните данные для регистрации'}</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input required name="email" type="email" placeholder="Ваш Email" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input required name="password" type="password" placeholder="Пароль" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-95 transition-all">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative flex items-center py-2"><div className="flex-grow border-t border-gray-100 dark:border-white/10"></div><span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest">ИЛИ</span><div className="flex-grow border-t border-gray-100 dark:border-white/10"></div></div>
              
              <button onClick={handleGoogleLogin} className="w-full py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-sm">
                <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-5 h-5" />
                Продолжить с Google
              </button>

              <p className="text-center text-xs font-bold text-gray-500">
                {authMode === 'login' ? 'Еще нет аккаунта?' : 'Уже зарегистрированы?'} 
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[#E63946] ml-1 uppercase hover:underline">
                   {authMode === 'login' ? 'Регистрация' : 'Вход'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;