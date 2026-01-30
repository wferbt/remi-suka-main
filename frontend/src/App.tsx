import { useState, useEffect } from 'react';
import { Plus, Minus, Loader2, ChevronRight, Moon, Sun, Store, User, CheckCircle2, Package, ShoppingBag, Trash2 } from 'lucide-react';
import api from './api';

// Картинки
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

type Product = { externalId: string; name: string; price: number; stock: number; };
type CartItem = Product & { quantity: number; };

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

  const getProductImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('молоко')) return milkImg;
    if (lowerName.includes('кефир')) return kefirImg;
    if (lowerName.includes('сметана')) return smetanaImg;
    if (lowerName.includes('творог')) return tvorogImg;
    return 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
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
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-100 text-black'}`}>
        <button onClick={() => setView('shop')} className="mb-6 flex items-center gap-2 font-bold opacity-70"><ChevronRight className="rotate-180"/> Назад в магазин</button>
        <h1 className="text-3xl font-bold mb-8">Панель управления</h1>
        <div className="bg-[#E63946] p-6 rounded-2xl text-white inline-block">
          <Package size={32} className="mb-2"/>
          <p className="font-bold text-sm opacity-80 uppercase">Товаров</p>
          <p className="text-4xl font-bold">{products.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md h-16 flex items-center px-4 justify-between ${isDark ? 'bg-[#1a1d21]/90 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2 rounded-lg text-white"><Store size={20} /></div>
          <span className="text-xl font-bold uppercase tracking-tight">Aul Market</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <button onClick={() => setView('admin')} className="text-xs font-bold bg-[#E63946] text-white px-3 py-1.5 rounded-lg">АДМИН</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-gray-500/10">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => user ? setUser(null) : setShowLogin(true)} className="p-2 rounded-lg bg-gray-500/10"><User size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* КАТЕГОРИИ */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 px-1">Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 overflow-hidden ${
                  selectedCategory === cat.id ? 'border-[#E63946] bg-white' : 'bg-gray-100 dark:bg-[#2A2D31] border-transparent'
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-10 h-10 object-contain" />
                </div>
                <span className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-[#E63946]' : 'text-gray-500'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => {
                  const inCart = cart.find(item => item.externalId === product.externalId);
                  return (
                    <div key={product.externalId} className={`rounded-2xl p-4 transition-all ${isDark ? 'bg-[#1a1d21]' : 'bg-white shadow-sm hover:shadow-md'}`}>
                      <div className="aspect-square bg-white rounded-xl mb-4 flex items-center justify-center p-4">
                        <img 
                          src={getProductImage(product.name)} 
                          className="w-full h-full object-contain" 
                          alt={product.name} 
                        />
                      </div>
                      <h3 className="font-bold text-sm mb-2 h-10 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold">{product.price} ₸</span>
                        {!inCart ? (
                          <button onClick={() => updateQuantity(product, 1)} className="bg-[#E63946] text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#d62839] transition-colors">
                            <Plus size={20} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                            <button onClick={() => updateQuantity(product, -1)} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-white/10 rounded-md text-[#E63946] shadow-sm"><Minus size={16}/></button>
                            <span className="font-bold text-sm min-w-[16px] text-center">{inCart.quantity}</span>
                            <button onClick={() => updateQuantity(product, 1)} className="w-7 h-7 flex items-center justify-center bg-[#E63946] text-white rounded-md shadow-sm"><Plus size={16}/></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* КОРЗИНА */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-3xl sticky top-20 border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-lg border-transparent'}`}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag size={20} /> Ваш заказ
              </h2>
              
              {paymentStep === 'none' ? (
                <>
                  <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex flex-col gap-2 p-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold w-3/4">{item.name}</p>
                          <button onClick={() => updateQuantity(item, -item.quantity)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[#E63946] font-bold text-sm">{item.price * item.quantity} ₸</p>
                            <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-1 rounded-lg shadow-sm">
                                <button onClick={() => updateQuantity(item, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200"><Minus size={12}/></button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-[#E63946] text-white hover:bg-[#d62839]"><Plus size={12}/></button>
                            </div>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="py-10 text-center text-gray-400">
                            <p className="text-sm">Корзина пуста</p>
                        </div>
                    )}
                  </div>
                  <div className="border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Итого:</span>
                      <span className="text-2xl font-bold">{total} ₸</span>
                    </div>
                    <button onClick={() => setPaymentStep('processing')} disabled={cart.length === 0} className="w-full py-4 bg-[#E63946] text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      Оплатить заказ
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <CheckCircle2 className="text-green-500 mx-auto mb-4" size={50} />
                  <h3 className="text-xl font-bold mb-2">Оплата прошла!</h3>
                  <p className="text-xs text-gray-500 mb-6">Чек отправлен на почту</p>
                  <button onClick={() => setPaymentStep('none')} className="text-[#E63946] text-sm font-bold hover:underline">Вернуться в магазин</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-[#1a1d21]' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input required name="username" placeholder="Логин" className="w-full p-4 rounded-xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] font-medium" />
              <input required name="password" type="password" placeholder="Пароль" className="w-full p-4 rounded-xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] font-medium" />
              <button type="submit" className="w-full py-4 bg-[#E63946] text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-[#d62839] transition-colors">Войти</button>
            </form>
            <button onClick={() => setShowLogin(false)} className="mt-4 w-full text-center text-gray-400 text-sm hover:text-gray-600">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;