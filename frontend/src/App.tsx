import { useState, useEffect } from 'react';
import { Plus, Minus, X, Loader2, ChevronRight, Moon, Sun, Store, User, CheckCircle2, Package, ShoppingBag, Trash2 } from 'lucide-react';
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

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const removeFromCart = (externalId: string) => {
    setCart(prev => prev.filter(item => item.externalId !== externalId));
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

  const QtyToggle = ({ item, isSmall = false }: { item: CartItem | Product, isSmall?: boolean }) => {
    const cartItem = cart.find(c => c.externalId === item.externalId);
    if (!cartItem) return (
      <button 
        onClick={() => updateQuantity(item, 1)}
        className={`${isSmall ? 'w-10 h-10' : 'w-14 h-14'} rounded-2xl flex items-center justify-center bg-[#E63946] text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-all`}
      >
        <Plus size={isSmall ? 20 : 28} strokeWidth={3} />
      </button>
    );

    return (
      <div className={`flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'} p-1.5 rounded-2xl border ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <button onClick={() => updateQuantity(item, -1)} className={`${isSmall ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center bg-white dark:bg-[#2A2D31] rounded-xl shadow-sm text-[#E63946]`}>
          <Minus size={isSmall ? 16 : 20} strokeWidth={3}/>
        </button>
        <span className={`font-black ${isSmall ? 'text-sm' : 'text-lg'} w-6 text-center`}>{cartItem.quantity}</span>
        <button onClick={() => updateQuantity(item, 1)} className={`${isSmall ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center bg-[#E63946] text-white rounded-xl shadow-sm`}>
          <Plus size={isSmall ? 16 : 20} strokeWidth={3}/>
        </button>
      </div>
    );
  };

  if (view === 'admin') {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#0F1113] text-white' : 'bg-gray-100 text-black'}`}>
        <button onClick={() => setView('shop')} className="mb-6 flex items-center gap-2 font-bold opacity-70"><ChevronRight className="rotate-180"/> В магазин</button>
        <h1 className="text-4xl font-black mb-8 text-[#E63946]">Админка</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#E63946] p-8 rounded-[32px] text-white">
            <Package size={32} className="mb-4"/><p className="text-4xl font-black">{products.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-[#0F1113] text-white' : 'bg-[#F0F2F5] text-[#1A1C1E]'}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-lg h-20 flex items-center px-6 justify-between ${isDark ? 'bg-[#16181A]/90 border-white/5' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('shop')}>
          <div className="bg-[#E63946] p-2.5 rounded-[14px] shadow-lg shadow-red-500/30"><Store className="text-white" size={22} /></div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Aul Market</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && <button onClick={() => setView('admin')} className="text-[10px] font-black bg-[#E63946]/10 text-[#E63946] px-4 py-2 rounded-xl border border-[#E63946]/20">Панель</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-2xl bg-gray-500/10">{isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}</button>
          <button onClick={() => user ? setUser(null) : setShowLogin(true)} className={`p-3 rounded-2xl transition-all ${user ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-gray-500/10'}`}><User size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <h2 className="text-4xl font-black mb-8 tracking-tighter uppercase italic">Витрина</h2>
            {loading ? (
              <div className="flex justify-center py-20 opacity-20"><Loader2 className="animate-spin" size={48} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.externalId} className={`group rounded-[40px] overflow-hidden transition-all duration-500 border ${isDark ? 'bg-[#16181A] border-white/5' : 'bg-white border-transparent shadow-xl shadow-black/5 hover:shadow-2xl'}`}>
                    <div className="aspect-[4/3] bg-white relative flex items-center justify-center p-6">
                      <img 
                        src={CATEGORY_IMAGES[Object.keys(CATEGORY_IMAGES).find(k => product.name.includes(k)) || ''] || milkImg} 
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                        alt={product.name} 
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="font-bold text-lg mb-2 leading-tight">{product.name}</h3>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-6">{product.externalId}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black tracking-tighter">{product.price} ₸</span>
                        <QtyToggle item={product} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className={`p-8 rounded-[45px] sticky top-28 border ${isDark ? 'bg-[#16181A] border-white/5 shadow-2xl shadow-black' : 'bg-white shadow-xl border-transparent'}`}>
              <div className="flex items-center justify-between mb-10"><h2 className="text-3xl font-black uppercase tracking-tighter italic">Корзина</h2></div>
              {paymentStep === 'none' ? (
                <>
                  <div className="space-y-6 mb-10 max-h-[50vh] overflow-y-auto scrollbar-hide">
                    {cart.length === 0 ? (
                      <div className="py-10 text-center opacity-20"><ShoppingBag size={48} className="mx-auto mb-4" /></div>
                    ) : (
                      cart.map(item => (
                        <div key={item.externalId} className="flex flex-col gap-4 bg-gray-500/5 p-5 rounded-[30px]">
                          <div className="flex justify-between items-start">
                            <div className="pr-4">
                              <p className="font-bold text-xs uppercase opacity-50 mb-1">{item.name}</p>
                              <p className="font-black text-lg text-[#E63946]">{item.price * item.quantity} ₸</p>
                            </div>
                            <button onClick={() => removeFromCart(item.externalId)} className="p-2 opacity-20 hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                          </div>
                          <div className="flex justify-end"><QtyToggle item={item} isSmall /></div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t-2 border-dashed border-gray-500/10 pt-8">
                    <div className="flex justify-between items-end mb-8"><span className="font-bold opacity-30 text-xs">ИТОГО</span><span className="text-4xl font-black tracking-tighter">{total} ₸</span></div>
                    <button onClick={() => setPaymentStep('processing')} disabled={cart.length === 0} className="w-full py-6 bg-[#E63946] text-white rounded-[26px] font-black text-xl shadow-2xl shadow-red-500/30 active:scale-95 transition-all">ОПЛАТИТЬ</button>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center">
                  <CheckCircle2 className="text-green-500 mx-auto mb-6" size={64} />
                  <h3 className="text-3xl font-black text-green-500 mb-2 uppercase">Оплачено!</h3>
                  <button onClick={() => {setCart([]); setPaymentStep('none');}} className="mt-8 font-bold text-[#E63946] text-sm uppercase">Назад</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60">
          <div className={`w-full max-w-md p-12 rounded-[50px] shadow-2xl ${isDark ? 'bg-[#16181A]' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-10"><h2 className="text-4xl font-black tracking-tighter italic uppercase">Вход</h2><button onClick={() => setShowLogin(false)} className="p-3 bg-gray-500/10 rounded-full"><X size={20}/></button></div>
            <form onSubmit={handleLogin} className="space-y-5">
              <input required name="username" placeholder="Логин" className="w-full p-6 rounded-[24px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] font-bold" />
              <input required name="password" type="password" placeholder="Пароль" className="w-full p-6 rounded-[24px] bg-gray-500/5 outline-none border-2 border-transparent focus:border-[#E63946] font-bold" />
              <button type="submit" className="w-full py-6 bg-[#E63946] text-white rounded-[24px] font-black text-lg shadow-2xl shadow-red-500/40">ВОЙТИ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;