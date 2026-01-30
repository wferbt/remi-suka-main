import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Loader2, ChevronRight, Moon, Sun, Store, User, Lock, CheckCircle2, Package } from 'lucide-react';
import api from './api';

// Картинки (убедись, что пути верны)
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

// Типы
type Product = { externalId: string; name: string; price: number; stock: number; };
type CartItem = Product & { quantity: number; };

const CATEGORY_IMAGES: Record<string, string> = { 'Молоко': milkImg, 'Кефир': kefirImg, 'Сметана': smetanaImg, 'Творог': tvorogImg };

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  
  // Состояния для новых функций
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [paymentStep, setPaymentStep] = useState<'none' | 'processing' | 'success'>('none');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    api.get('/catalog').then(res => { setProducts(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [isDark]);

  // Управление корзиной
  const updateQuantity = (product: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.externalId === product.externalId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.externalId !== product.externalId);
        return prev.map(item => item.externalId === product.externalId ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
  };

  const handlePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => { setCart([]); setPaymentStep('none'); }, 3000);
    }, 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user', 'Vilen');
    setUser('Vilen');
    setShowLogin(false);
    if ((e.currentTarget as any).password.value === 'admin') setIsAdmin(true);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (view === 'admin') {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-100'}`}>
        <button onClick={() => setView('shop')} className="mb-4 flex items-center gap-2 opacity-50"><ChevronRight className="rotate-180"/> Назад в магазин</button>
        <h1 className="text-4xl font-black mb-8">Панель управления</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500 p-6 rounded-3xl text-white">
            <Package size={32} className="mb-2"/>
            <p className="opacity-80">Товаров в базе</p>
            <p className="text-3xl font-black">{products.length}</p>
          </div>
          <div className="bg-green-500 p-6 rounded-3xl text-white">
            <Store size={32} className="mb-2"/>
            <p className="opacity-80">Выручка (фейк)</p>
            <p className="text-3xl font-black">1,240,000 ₸</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'} font-sans`}>
      {/* Навигация */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md h-16 flex items-center px-4 justify-between ${isDark ? 'bg-[#1a1d21]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2 rounded-xl"><Store className="text-white" size={20} /></div>
          <span className="text-xl font-black tracking-tight uppercase">Aul Market</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && <button onClick={() => setView('admin')} className="text-xs font-bold opacity-50 uppercase">Админ</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-500/10">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
          </button>
          <button onClick={() => setUser(user ? null : (setShowLogin(true), null))} className="p-2 rounded-full bg-gray-500/10">
            <User size={22} className={user ? 'text-green-500' : ''} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => {
              const inCart = cart.find(item => item.externalId === product.externalId);
              return (
                <div key={product.externalId} className={`rounded-[32px] overflow-hidden ${isDark ? 'bg-[#1a1d21]' : 'bg-white shadow-xl shadow-black/5'}`}>
                  <div className="aspect-square bg-white p-4">
                    <img src={`products/${product.externalId}.png`} className="w-full h-full object-contain" 
                      onError={(e) => {
                        const foundCat = Object.keys(CATEGORY_IMAGES).find(key => product.name.includes(key));
                        e.currentTarget.src = foundCat ? CATEGORY_IMAGES[foundCat] : '';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-sm mb-4 h-10 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black">{product.price} ₸</span>
                      
                      {/* МЕНЯЮЩИЙСЯ ПЛЮСИК НА ЦИФРЫ */}
                      {!inCart ? (
                        <button onClick={() => updateQuantity(product, 1)} className="bg-[#E63946] text-white w-10 h-10 rounded-xl flex items-center justify-center">
                          <Plus size={20} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-gray-500/10 rounded-xl p-1">
                          <button onClick={() => updateQuantity(product, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 rounded-lg shadow-sm"><Minus size={16}/></button>
                          <span className="font-bold w-4 text-center">{inCart.quantity}</span>
                          <button onClick={() => updateQuantity(product, 1)} className="w-8 h-8 flex items-center justify-center bg-[#E63946] text-white rounded-lg shadow-sm"><Plus size={16}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* КОРЗИНА И ОПЛАТА */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-[35px] sticky top-24 ${isDark ? 'bg-[#1a1d21]' : 'bg-white shadow-2xl'}`}>
            <h2 className="text-2xl font-black mb-6">Корзина</h2>
            {paymentStep === 'none' ? (
              <>
                <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
                  {cart.map(item => (
                    <div key={item.externalId} className="flex justify-between items-center bg-gray-500/5 p-3 rounded-2xl">
                      <div className="text-xs font-bold w-2/3 truncate">{item.name}</div>
                      <div className="font-black text-sm">{item.price * item.quantity} ₸</div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4 font-black text-2xl"><span>Итого:</span><span>{total} ₸</span></div>
                  <button onClick={handlePayment} disabled={cart.length === 0} className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-black shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-30">
                    ОПЛАТИТЬ
                  </button>
                </div>
              </>
            ) : paymentStep === 'processing' ? (
              <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-[#E63946]" size={48} />
                <p className="font-bold animate-pulse">Связь с банком...</p>
              </div>
            ) : (
              <div className="py-20 text-center">
                <CheckCircle2 className="mx-auto mb-4 text-green-500" size={64} />
                <h3 className="text-2xl font-black mb-2">Оплачено!</h3>
                <p className="text-sm opacity-50">Ваш заказ принят в обработку</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* МОДАЛКА АВТОРИЗАЦИИ */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
          <div className={`w-full max-w-md p-8 rounded-[40px] shadow-2xl ${isDark ? 'bg-[#1a1d21]' : 'bg-white'}`}>
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl font-black">Вход</h2>
              <button onClick={() => setShowLogin(false)}><X/></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-4 opacity-30" size={20}/>
                <input required name="username" placeholder="Логин" className="w-full p-4 pl-12 rounded-2xl bg-gray-500/10 outline-none border-2 border-transparent focus:border-[#E63946] transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 opacity-30" size={20}/>
                <input required name="password" type="password" placeholder="Пароль" className="w-full p-4 pl-12 rounded-2xl bg-gray-500/10 outline-none border-2 border-transparent focus:border-[#E63946] transition-all" />
              </div>
              <p className="text-[10px] opacity-40 text-center">Введите пароль 'admin' для доступа к панели</p>
              <button className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-black shadow-xl shadow-red-500/20">ВОЙТИ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;