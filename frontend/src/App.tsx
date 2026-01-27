import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Loader2, ChevronRight, Moon, Sun, Store } from 'lucide-react';
import api from './api';

// 1. ИМПОРТ КАРТИНОК (Убедись, что они лежат в src/assets/products/)
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

// 2. ОПРЕДЕЛЕНИЕ ТИПОВ (Исправляет ошибки Cannot find name 'Product')
type Product = {
  externalId: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

// 3. КОНСТАНТЫ КАТЕГОРИЙ
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
            <div className={`${theme.accentBg} p-1.5 rounded-xl`}>
              <Store className="text-white" size={20} />
            </div>
            <span className={`text-xl font-black ${theme.accent}`}>Aul Market</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-gray-500/10">
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <div className="relative p-2.5 bg-gray-500/10 rounded-xl">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-lg font-black mb-4">Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 border-2 overflow-hidden ${selectedCategory === cat.id ? 'border-[#E63946] bg-white' : 'bg-white border-transparent'}`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[11px] font-black ${selectedCategory === cat.id ? theme.accent : 'text-gray-400'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => (
                  <div key={product.externalId} className={`${theme.card} rounded-[24px] overflow-hidden flex flex-col group`}>
                    <div className="h-40 bg-white flex items-center justify-center p-4 relative">
                      <img 
                        src={`products/${product.externalId}.png`} 
                        className="w-full h-full object-contain" 
                        alt={product.name} 
                        onError={(e) => { 
                          const foundCat = Object.keys(CATEGORY_IMAGES).find(key => product.name.includes(key));
                          e.currentTarget.src = foundCat ? CATEGORY_IMAGES[foundCat] : 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-sm h-10 line-clamp-2 mb-2">{product.name}</h3>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-bold text-xl">{product.price} ₸</p>
                        <button onClick={() => addToCart(product)} className={`${theme.accentBg} text-white p-2.5 rounded-xl`}>
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* КОРЗИНА */}
          <div className="lg:col-span-1">
            <div className={`${theme.card} p-5 rounded-[30px] sticky top-24`}>
              <h2 className={`text-xl font-bold mb-6 ${theme.accent}`}>Заказ</h2>
              {cart.length === 0 ? (
                <div className="text-center py-10 opacity-30 italic">Пусто</div>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-3 items-center">
                        <div className="flex-grow">
                          <p className="font-bold text-[11px] leading-tight">{item.name}</p>
                          <p className={`text-[10px] ${theme.accent} font-bold`}>{item.quantity} шт × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-5 font-bold">
                      <span>Итого:</span>
                      <span className="text-2xl">{total} ₸</span>
                    </div>
                    <button className={`${theme.accentBg} text-white w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2`}>
                      Заказать <ChevronRight size={20} />
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