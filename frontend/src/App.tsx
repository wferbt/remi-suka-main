import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Loader2, ChevronRight, Moon, Sun, Store } from 'lucide-react';
import api from './api';

type Product = {
  externalId: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

// Исправленные пути к твоим сгенерированным картинкам
const CATEGORIES = [
  { id: '', name: 'Все', img: 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png' },
  { id: 'Молоко', name: 'Молоко', img: '/products/milk.png' },
  { id: 'Кефир', name: 'Кефир', img: '/products/kefir.png' },
  { id: 'Сметана', name: 'Сметана', img: '/products/smetana.png' },
  { id: 'Творог', name: 'Творог', img: '/products/tvorog.png' },
];

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    api.get('/catalog')
      .then(res => {
        setProducts(res.data as Product[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product: CartItem) => {
    setCart(prev => {
      const index = prev.findIndex(item => item.name === product.name);
      if (index === -1) return prev;
      const newCart = [...prev];
      if (newCart[index].quantity > 1) {
        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 };
      } else {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const theme = {
    bg: isDark ? 'bg-[#121417]' : 'bg-[#E9ECEF]', 
    nav: isDark ? 'bg-[#1a1d21] border-gray-800' : 'bg-[#F8F9FA] border-gray-200',
    card: isDark ? 'bg-[#1a1d21] border-gray-800 shadow-xl' : 'bg-white border-transparent shadow-sm',
    text: isDark ? 'text-white' : 'text-[#212529]',
    muted: isDark ? 'text-gray-500' : 'text-gray-400',
    accent: 'text-[#E63946]',
    accentBg: 'bg-[#E63946]'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-all duration-300`}>
      <nav className={`${theme.nav} sticky top-0 z-50 border-b h-16 shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${theme.accentBg} p-1.5 rounded-xl shadow-lg shadow-red-900/20`}>
              <Store className="text-white" size={20} />
            </div>
            <span className={`text-xl font-black tracking-tighter ${theme.accent}`}>Aul Market</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 transition-all">
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <div className="relative p-2.5 bg-gray-500/10 rounded-xl">
              <ShoppingCart size={22} className={isDark ? 'text-gray-300' : 'text-gray-700'} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-[#121417]">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className={`text-lg font-black mb-4 px-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-[10px] scrollbar-hide px-1">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center group">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 transition-all duration-300 border-2 overflow-hidden shadow-sm ${
                  selectedCategory === cat.id 
                    ? 'border-[#E63946] bg-white scale-105 shadow-red-500/10' 
                    : `${isDark ? 'bg-[#1a1d21] border-transparent' : 'bg-white border-transparent'}`
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover scale-110" />
                </div>
                <span className={`text-[11px] font-black ${selectedCategory === cat.id ? theme.accent : 'text-gray-400'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-2xl font-black tracking-tighter">{selectedCategory || 'Каталог товаров'}</h2>
              <span className={`text-sm font-bold ${theme.muted}`}>
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).length} шт.
              </span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className={`animate-spin ${theme.accent}`} size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => (
                  <div key={product.externalId} className={`${theme.card} rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col group transition-transform hover:-translate-y-1`}>
                    <div className="h-40 bg-white dark:bg-[#121417] flex items-center justify-center p-4 overflow-hidden relative">
                      <img 
                        src={`/products/${product.externalId}.png`} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        alt={product.name} 
                        onError={(e) => { 
                          const cat = CATEGORIES.find(c => product.name.includes(c.id));
                          e.currentTarget.src = cat?.img || 'https://loremflickr.com/400/400/dairy';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-sm h-10 overflow-hidden line-clamp-2 mb-2 leading-snug">{product.name}</h3>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-bold text-xl">{product.price} ₸</p>
                        <button onClick={() => addToCart(product)} className={`${theme.accentBg} text-white p-2.5 rounded-xl hover:opacity-90 transition-all active:scale-90 shadow-md`}>
                          <Plus size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className={`${isDark ? 'bg-[#1a1d21]' : 'bg-white shadow-2xl'} p-5 rounded-[30px] border border-gray-100 dark:border-gray-800 sticky top-24`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold tracking-tighter ${theme.accent}`}>Ваш заказ</h2>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className={`${theme.accent} text-xs font-black uppercase tracking-widest`}>Очистить</button>
                )}
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-10 opacity-30 italic font-bold text-sm">Корзина пуста</div>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center p-1">
                           <img 
                             src={`/products/${item.externalId}.png`} 
                             className="w-full h-full object-contain rounded" 
                             onError={(e) => { 
                               const cat = CATEGORIES.find(c => item.name.includes(c.id));
                               e.currentTarget.src = cat?.img || 'https://loremflickr.com/100/100/food';
                             }} 
                           />
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-[11px] leading-tight line-clamp-1">{item.name}</p>
                          <p className={`text-[10px] ${theme.accent} font-bold`}>{item.quantity} шт × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="text-gray-300 hover:text-red-600 p-1"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed pt-4 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-5 font-bold">
                      <span className={theme.muted}>Итого:</span>
                      <span className="text-2xl">{total} ₸</span>
                    </div>
                    <button className={`${theme.accentBg} text-white w-full py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-red-500/20 active:scale-95`}>
                      Заказать <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;