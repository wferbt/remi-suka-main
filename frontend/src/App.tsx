import { useState, useEffect } from 'react';
import { Plus, Minus, X, Loader2, ChevronRight, Moon, Sun, Store, User, Lock, CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import api from './api';

// Картинки
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

// Типы
type Product = { externalId: string; name: string; price: number; stock: number; };
type CartItem = Product & { quantity: number; };

const CATEGORY_IMAGES: Record<string, string> = { 
  'Молоко': milkImg, 
  'Кефир': kefirImg, 
  'Сметана': smetanaImg, 
  'Творог': tvorogImg 
};

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
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [paymentStep, setPaymentStep] = useState<'none' | 'processing' | 'success'>('none');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    api.get('/catalog')
      .then(res => { 
        setProducts(res.data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [isDark]);

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
      setTimeout(() => { 
        setCart([]); 
        setPaymentStep('none'); 
      }, 3000);
    }, 2000);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password');
    localStorage.setItem('user', 'Vilen');
    setUser('Vilen');
    setShowLogin(false);
    if (password === 'admin') setIsAdmin(true);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (view === 'admin') {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-100 text-black'}`}>
        <button onClick={() => setView('shop')} className="mb-6 flex items-center gap-2 font-bold opacity-70 hover:opacity-100 transition-opacity">
          <ChevronRight className="rotate-180"/> Назад в магазин
        </button>
        <h1 className="text-4xl font-black mb-8">Панель управления</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#E63946] p-8 rounded-[32px] text-white shadow-xl shadow-red-500/20">
            <Package size={32} className="mb-4"/>
            <p className="opacity-80 font-bold uppercase text-xs tracking-widest">Товаров в базе</p>
            <p className="text-4xl font-black">{products.length}</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20">
            <Store size={32} className="mb-4"/>
            <p className="opacity-80 font-bold uppercase text-xs tracking-widest">Активных заказов</p>
            <p className="text-4xl font-black">12</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md h-16 flex items-center px-4 justify-between ${isDark ? 'bg-[#1a1d21]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2 rounded-xl shadow-lg shadow-red-500/20">
            <Store className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">Aul Market</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button onClick={() => setView('admin')} className="text-[10px] font-black bg-[#E63946] text-white px-3 py-1.5 rounded-lg uppercase tracking-wider">Админ</button>
          )}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-500/10">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
          </button>
          <button onClick={() => user ? setUser(null) : setShowLogin(true)} className="p-2 rounded-full bg-gray-500/10 transition-colors">
            <User size={22} className={user ? 'text-[#E63946]' : ''} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center group">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-2 transition-all duration-300 border-2 overflow-hidden ${
                  selectedCategory === cat.id ? 'border-[#E63946] bg-white scale-110 shadow-xl shadow-red-500/10' : `${isDark ? 'bg-[#1a1d21] border-transparent' : 'bg-white border-transparent'}`
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-tighter ${selectedCategory === cat.id ? 'text-[#E63946]' : 'opacity-40'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={48} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => {
                  const inCart = cart.find(item => item.externalId === product.externalId);
                  return (
                    <div key={product.externalId} className={`group rounded-[35px] overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#1a1d21] hover:bg-[#1f2328]' : 'bg-white shadow-xl shadow-black/5 hover:shadow-2xl'}`}>
                      <div className="aspect-[4/5] overflow-hidden bg-white relative">
                        <img 
                          src={`products/${product.externalId}.png`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={product.name} 
                          onError={(e) => {
                            const foundCat = Object.keys(CATEGORY_IMAGES).find(key => product.name.includes(key));
                            e.currentTarget.src = foundCat ? CATEGORY_IMAGES[foundCat] : 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-sm h-10 line-clamp-2 mb-4 opacity-90">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black">{product.price} ₸</span>
                          {!inCart ? (
                            <button onClick={() => updateQuantity(product, 1)} className="bg-[#E63946] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-500/20">
                              <Plus size={24} strokeWidth={3} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-500/10 rounded-2xl p-1.5 backdrop-blur-sm">
                              <button onClick={() => updateQuantity(product, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-110 active:scale-90 transition-all text-[#E63946]"><Minus size={18} strokeWidth={3}/></button>
                              <span className="font-black w-6 text-center text-sm">{inCart.quantity}</span>
                              <button onClick={() => updateQuantity(product, 1)} className="w-8 h-8 flex items-center justify-center bg-[#E63946] text-white rounded-xl shadow-sm hover:scale-110 active:scale-90 transition-all"><Plus size={18} strokeWidth={3}/></button>
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
            <div className={`p-6 rounded-[40px] sticky top-24 border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-2xl border-transparent'}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Заказ</h2>
                <ShoppingBag size={24} className="opacity-20" />
              </div>
              
              {paymentStep === 'none' ? (
                <>
                  <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex flex-col gap-3 bg-gray-500/5 p-4 rounded-[24px]">
                        <div className="min-w-0 flex-grow">
                          <p className="font-bold text-[11px] truncate uppercase opacity-60">{item.name}</p>
                          <p className="font-black text-sm text-[#E63946]">{item.price * item.quantity} ₸</p>
                        </div>
                        {/* ПЛЮС И МИНУС В КОРЗИНЕ */}
                        <div className="flex items-center gap-3 self-end">
                            <button onClick={() => updateQuantity(item, -1)} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-white/10 rounded-lg shadow-sm text-[#E63946]"><Minus size={14} strokeWidth={3}/></button>
                            <span className="font-black text-xs min-w-[12px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item, 1)} className="w-7 h-7 flex items-center justify-center bg-[#E63946] text-white rounded-lg shadow-sm"><Plus size={14} strokeWidth={3}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-gray-500/20 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold opacity-40 uppercase text-xs tracking-widest">Итого</span>
                      <span className="text-3xl font-black tracking-tighter">{total} ₸</span>
                    </div>
                    <button onClick={handlePayment} disabled={cart.length === 0} className="w-full py-5 bg-[#E63946] text-white rounded-[24px] font-black text-lg shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-20">
                      ОПЛАТИТЬ
                    </button>
                  </div>
                </>
              ) : paymentStep === 'processing' ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto mb-4 text-[#E63946]" size={48} />
                  <p className="font-black uppercase text-xs tracking-widest opacity-40">Связь с банком...</p>
                </div>
              ) : (
                <div className="py-20 text-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Готово!</h3>
                  <p className="text-xs font-bold opacity-40">ЗАКАЗ ПРИНЯТ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[45px] shadow-2xl scale-in-center ${isDark ? 'bg-[#1a1d21]' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black tracking-tighter">Вход</h2>
              <button onClick={() => setShowLogin(false)} className="p-2 bg-gray-500/10 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <User className="absolute left-5 top-5 opacity-20" size={20}/>
                <input required name="username" placeholder="Логин" className="w-full p-5 pl-14 rounded-[22px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-bold" />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-5 opacity-20" size={20}/>
                <input required name="password" type="password" placeholder="Пароль" className="w-full p-5 pl-14 rounded-[22px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-bold" />
              </div>
              <p className="text-[10px] font-bold opacity-20 text-center uppercase tracking-widest">Для админки пароль: admin</p>
              <button type="submit" className="w-full py-5 bg-[#E63946] text-white rounded-[22px] font-black text-lg shadow-2xl shadow-red-500/30 hover:brightness-110 transition-all">ВОЙТИ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;