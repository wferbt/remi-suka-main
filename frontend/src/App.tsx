import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Plus, X, Loader2, ChevronRight, Moon, Sun } from 'lucide-react';
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

  // Стили зависящие от темы
  const theme = {
    bg: isDark ? 'bg-[#121417]' : 'bg-[#F2F4F7]',
    nav: isDark ? 'bg-[#1a1d21] border-gray-800' : 'bg-white border-gray-200',
    card: isDark ? 'bg-[#1a1d21] border-gray-800' : 'bg-white border-gray-100',
    text: isDark ? 'text-white' : 'text-gray-900',
    muted: isDark ? 'text-gray-500' : 'text-gray-400'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      <nav className={`${theme.nav} sticky top-0 z-50 border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="text-green-500" size={24} />
            <span className="text-xl font-black tracking-tight">GreenFood</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative p-2 bg-gray-500/10 rounded-xl">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Категории с ИСПРАВЛЕННЫМ РАДИУСОМ */}
        <section className="mb-10">
          <h2 className={`text-xs font-bold mb-5 uppercase tracking-widest ${theme.muted}`}>Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex flex-col items-center flex-shrink-0 group">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 border-2 transition-all ${
                  selectedCategory === cat.id ? 'border-green-500 bg-green-500/10 scale-105' : 'border-transparent bg-gray-500/5'
                }`}>
                  <img src={cat.img} className="w-10 h-10 object-contain" alt={cat.name} />
                </div>
                <span className={`text-[11px] font-bold ${selectedCategory === cat.id ? 'text-green-500' : theme.muted}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-black mb-6">{selectedCategory || 'Все продукты'}</h2>
            {loading ? <Loader2 className="animate-spin text-green-500 mx-auto" size={40} /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => (
                  <div key={product.externalId} className={`${theme.card} rounded-[24px] border overflow-hidden flex flex-col group`}>
                    <div className="h-40 p-4 flex items-center justify-center bg-gray-500/5">
                      <img src={`https://loremflickr.com/400/400/dairy?lock=${product.externalId}`} className="h-full object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-bold text-sm mb-3 line-clamp-2">{product.name}</h3>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="font-black text-lg">{product.price} ₸</span>
                        <button onClick={() => addToCart(product)} className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-500 transition-all active:scale-90">
                          <Plus size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Корзина */}
          <div className="lg:col-span-1">
            <div className={`${theme.card} border p-6 rounded-[28px] sticky top-24`}>
              <div className="flex justify-between items-center mb-6 text-xl font-bold">
                <span>Корзина</span>
                {cart.length > 0 && <button onClick={() => setCart([])} className="text-green-500 text-xs uppercase">Clear</button>}
              </div>
              {cart.length === 0 ? <p className={`${theme.muted} text-center py-10`}>Пусто</p> : (
                <div className="space-y-4">
                  <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex-shrink-0 p-1">
                          <img src={`https://loremflickr.com/100/100/food?lock=${item.externalId}`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-[11px] line-clamp-1">{item.name}</p>
                          <p className="text-green-500 font-black text-[10px]">{item.quantity} шт × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-dashed border-gray-500/20">
                    <div className="flex justify-between font-black text-xl mb-6">
                      <span className={theme.muted}>Итого:</span>
                      <span>{total} ₸</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 hover:bg-green-500 transition-all">
                      Оформить <ChevronRight size={20} />
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