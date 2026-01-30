import { useState, useEffect } from 'react';
import { Plus, Minus, Loader2, ChevronRight, Moon, Sun, Store, User, CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import api from './api';

// Картинки
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get('password') === 'admin') setIsAdmin(true);
    localStorage.setItem('user', 'Vilen');
    setUser('Vilen');
    setShowLogin(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (view === 'admin') {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#0a0b0d] text-white' : 'bg-gray-100 text-black'}`}>
        <button onClick={() => setView('shop')} className="mb-6 flex items-center gap-2 font-bold opacity-70 italic"><ChevronRight className="rotate-180"/> Назад в маркет</button>
        <div className="bg-[#E63946] p-10 rounded-[40px] shadow-2xl shadow-red-500/20 inline-block">
          <Package size={40} className="mb-4 text-white"/>
          <h1 className="text-5xl font-black">{products.length}</h1>
          <p className="font-bold opacity-80 uppercase tracking-widest text-xs">Товаров загружено</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0a0b0d] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl h-20 flex items-center px-6 justify-between ${isDark ? 'bg-[#121417]/90 border-white/5' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2.5 rounded-2xl shadow-lg shadow-red-500/20"><Store className="text-white" size={24} /></div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Aul Market</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && <button onClick={() => setView('admin')} className="text-[10px] font-black bg-[#E63946]/10 text-[#E63946] px-4 py-2 rounded-xl border border-[#E63946]/20">АДМИН</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-2xl bg-gray-500/10 hover:bg-[#E63946]/10 transition-colors">{isDark ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-blue-600" />}</button>
          <button onClick={() => user ? setUser(null) : setShowLogin(true)} className={`p-3 rounded-2xl transition-all ${user ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-gray-500/10'}`}><User size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* КАТЕГОРИИ */}
        <section className="mb-14">
          <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-4 transition-all active:scale-90">
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-300 border-4 overflow-hidden ${
                  selectedCategory === cat.id ? 'border-[#E63946] bg-white scale-110 shadow-2xl shadow-red-500/20' : 'bg-[#121417] border-transparent'
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[13px] font-black uppercase tracking-[0.2em] ${selectedCategory === cat.id ? 'text-[#E63946]' : 'opacity-30'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={64} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => {
                  const inCart = cart.find(item => item.externalId === product.externalId);
                  return (
                    <div key={product.externalId} className={`group rounded-[50px] overflow-hidden transition-all duration-500 border ${isDark ? 'bg-[#121417] border-white/5' : 'bg-white shadow-xl shadow-black/5'}`}>
                      <div className="aspect-square bg-white flex items-center justify-center p-8">
                        <img 
                          src={CATEGORY_IMAGES[Object.keys(CATEGORY_IMAGES).find(key => product.name.includes(key)) || ''] || 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png'} 
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                          alt={product.name} 
                        />
                      </div>
                      <div className="p-10">
                        <h3 className="font-bold text-xl mb-6 h-14 line-clamp-2 leading-tight opacity-90">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-black italic">{product.price} ₸</span>
                          {!inCart ? (
                            <button onClick={() => updateQuantity(product, 1)} className="bg-[#E63946] text-white w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95 transition-all">
                              <Plus size={30} strokeWidth={3} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-4 bg-gray-500/10 rounded-2xl p-2 border border-white/5">
                              <button onClick={() => updateQuantity(product, -1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/10 rounded-xl text-[#E63946] shadow-sm"><Minus size={20} strokeWidth={3}/></button>
                              <span className="font-black w-6 text-center text-xl">{inCart.quantity}</span>
                              <button onClick={() => updateQuantity(product, 1)} className="w-10 h-10 flex items-center justify-center bg-[#E63946] text-white rounded-xl shadow-sm"><Plus size={20} strokeWidth={3}/></button>
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

          {/* КОРЗИНА */}
          <div className="lg:col-span-4">
            <div className={`p-10 rounded-[60px] sticky top-28 border ${isDark ? 'bg-[#121417] border-white/5 shadow-2xl' : 'bg-white shadow-xl'}`}>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Твой Заказ</h2>
              
              {paymentStep === 'none' ? (
                <>
                  <div className="space-y-6 mb-10 max-h-[45vh] overflow-y-auto pr-2 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="bg-white/5 p-6 rounded-[35px] border border-white/5 flex flex-col gap-4 transition-all hover:bg-white/[0.07]">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-xs uppercase opacity-40 leading-tight w-2/3">{item.name}</p>
                          <p className="font-black text-xl text-[#E63946] whitespace-nowrap">{item.price * item.quantity} ₸</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">{item.price} ₸ / шт</span>
                          <div className="flex items-center gap-3 bg-black/30 p-1 rounded-xl">
                            <button onClick={() => updateQuantity(item, -1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-[#E63946]"><Minus size={14} strokeWidth={3}/></button>
                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item, 1)} className="w-8 h-8 flex items-center justify-center bg-[#E63946] text-white rounded-lg"><Plus size={14} strokeWidth={3}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="py-16 text-center opacity-10">
                            <ShoppingBag size={56} className="mx-auto mb-4" />
                            <p className="font-black uppercase text-xs tracking-widest">Пусто</p>
                        </div>
                    )}
                  </div>
                  <div className="border-t-2 border-dashed border-white/10 pt-8">
                    <div className="flex justify-between items-end mb-8">
                      <span className="font-bold opacity-30 uppercase text-xs">Итого:</span>
                      <span className="text-5xl font-black tracking-tighter italic">{total} ₸</span>
                    </div>
                    <button onClick={() => setPaymentStep('processing')} disabled={cart.length === 0} className="w-full py-7 bg-[#E63946] text-white rounded-[32px] font-black text-2xl shadow-2xl shadow-red-500/40 active:scale-95 transition-all disabled:opacity-20 uppercase">Оплатить</button>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center animate-pulse">
                  <CheckCircle2 className="text-green-500 mx-auto mb-6" size={80} />
                  <h3 className="text-4xl font-black mb-4 uppercase italic">Оплачено!</h3>
                  <button onClick={() => setPaymentStep('none')} className="font-bold opacity-40 hover:opacity-100 uppercase text-[10px] tracking-widest transition-opacity">Вернуться к покупкам</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/70">
          <div className={`w-full max-w-md p-14 rounded-[60px] ${isDark ? 'bg-[#121417]' : 'bg-white'}`}>
            <h2 className="text-5xl font-black mb-10 tracking-tighter italic uppercase text-center">Вход</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input required name="username" placeholder="Логин" className="w-full p-7 rounded-[30px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] font-bold text-lg" />
              <input required name="password" type="password" placeholder="Пароль" className="w-full p-7 rounded-[30px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] font-bold text-lg" />
              <button type="submit" className="w-full py-7 bg-[#E63946] text-white rounded-[30px] font-black text-xl shadow-2xl shadow-red-500/40 hover:scale-105 transition-transform uppercase">Войти</button>
            </form>
            <button onClick={() => setShowLogin(false)} className="mt-8 w-full text-center font-bold opacity-20 uppercase text-xs tracking-[0.3em]">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;