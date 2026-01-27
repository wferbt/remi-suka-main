import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Loader2, ChevronRight, Moon, Sun } from 'lucide-react';
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

const CATEGORIES = [
  { id: '', name: 'Все', img: 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png' },
  { id: 'Молоко', name: 'Молоко', img: 'https://cdn-icons-png.flaticon.com/512/869/869476.png' },
  { id: 'Кефир', name: 'Кефир', img: 'https://cdn-icons-png.flaticon.com/512/6129/6129819.png' },
  { id: 'Сметана', name: 'Сметана', img: 'https://cdn-icons-png.flaticon.com/512/2619/2619536.png' },
  { id: 'Творог', name: 'Творог', img: 'https://cdn-icons-png.flaticon.com/512/2909/2909783.png' },
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

  // Стили «по-красоте»
  const theme = {
    bg: isDark ? 'bg-[#121417]' : 'bg-[#FFFFFF]',
    nav: isDark ? 'bg-[#1a1d21]/80 border-gray-800' : 'bg-white/80 border-gray-100',
    card: isDark ? 'bg-[#1a1d21] border-gray-800' : 'bg-[#F8F9FA] border-transparent',
    text: isDark ? 'text-white' : 'text-[#1A1C1E]',
    muted: isDark ? 'text-gray-500' : 'text-gray-400',
    cartBg: isDark ? 'bg-[#1a1d21]' : 'bg-white shadow-2xl border border-gray-100'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-500 selection:bg-green-500/30`}>
      {/* Навигация */}
      <nav className={`${theme.nav} sticky top-0 z-50 border-b backdrop-blur-md h-16`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <span className="text-lg font-black tracking-tight uppercase">GreenFood</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full hover:bg-gray-500/10 transition-colors">
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <div className="relative p-2.5 rounded-full bg-gray-500/5">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-[#1a1d21]">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Категории — Новый стиль без «кривых» бордеров */}
        <section className="mb-12">
          <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide items-center">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="group flex flex-col items-center flex-shrink-0">
                <div className={`relative p-1 rounded-full transition-all duration-300 ${
                  selectedCategory === cat.id ? 'ring-2 ring-green-500 ring-offset-4 ring-offset-transparent' : 'ring-0'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all shadow-sm ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  } group-hover:scale-110`}>
                    <img src={cat.img} className="w-9 h-9 object-contain" alt={cat.name} />
                  </div>
                </div>
                <span className={`mt-4 text-[11px] font-black uppercase tracking-widest transition-colors ${
                  selectedCategory === cat.id ? 'text-green-500' : theme.muted
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-black mb-8 tracking-tighter">{selectedCategory || 'Весь каталог'}</h2>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={40} /></div> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => (
                  <div key={product.externalId} className={`${theme.card} rounded-[32px] border overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500`}>
                    <div className="h-48 p-8 flex items-center justify-center relative">
                      <img 
                        src={`/products/${product.externalId}.png`} 
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" 
                        onError={(e) => (e.currentTarget.src = 'https://loremflickr.com/400/400/dairy?lock=' + product.externalId)}
                      />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="font-bold text-sm mb-4 line-clamp-2 h-10 leading-snug">{product.name}</h3>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="font-black text-2xl tracking-tight">{product.price} ₸</span>
                        <button onClick={() => addToCart(product)} className="bg-green-500 text-white p-3.5 rounded-2xl hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-90 transition-all">
                          <Plus size={20} strokeWidth={4} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Корзина — Теперь выглядит как плавающая карточка */}
          <div className="lg:col-span-1">
            <div className={`${theme.cartBg} p-8 rounded-[40px] sticky top-28`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight">Заказ</h2>
                {cart.length > 0 && <button onClick={() => setCart([])} className="text-red-500 text-[10px] font-black uppercase tracking-wider">Clear</button>}
              </div>
              {cart.length === 0 ? <p className={`${theme.muted} text-center py-10 font-bold`}>Ваша корзина пуста</p> : (
                <div className="space-y-6">
                  <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 p-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <img src={`https://loremflickr.com/100/100/food?lock=${item.externalId}`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-[12px] leading-none mb-1">{item.name}</p>
                          <p className="text-green-500 font-black text-[11px]">{item.quantity} × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-end mb-8">
                      <span className={`${theme.muted} text-xs font-black uppercase`}>Итого</span>
                      <span className="text-3xl font-black tracking-tighter">{total} ₸</span>
                    </div>
                    <button className="w-full bg-green-500 text-white py-5 rounded-[24px] font-black text-lg flex justify-center items-center gap-2 hover:bg-green-600 shadow-xl shadow-green-500/30 transition-all active:scale-95">
                      Оформить <ChevronRight size={22} />
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