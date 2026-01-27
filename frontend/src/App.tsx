import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Loader2, ChevronRight, Moon, Sun, Store } from 'lucide-react';
import api from './api';

// Импорт картинок-заглушек (замени на свои пути в assets)
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

type Product = {
  externalId: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      {/* HEADER */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md h-16 ${isDark ? 'bg-[#1a1d21]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#E63946] p-2 rounded-xl shadow-lg shadow-red-500/20">
              <Store className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">Aul Market</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <div className="relative group cursor-pointer">
               <div className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                 <ShoppingCart size={22} />
               </div>
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#121417]">
                   {cart.reduce((a, b) => a + b.quantity, 0)}
                 </span>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* КАТЕГОРИИ */}
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4 px-1">Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className="flex-shrink-0 group flex flex-col items-center"
              >
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-2 transition-all duration-300 border-2 overflow-hidden ${
                  selectedCategory === cat.id 
                    ? 'border-[#E63946] bg-white scale-110 shadow-xl shadow-red-500/10' 
                    : `${isDark ? 'bg-[#1a1d21] border-transparent' : 'bg-white border-transparent'}`
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'text-[#E63946]' : 'opacity-60'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* СЕТКА ТОВАРОВ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8 px-1">
              <h2 className="text-3xl font-black tracking-tighter">{selectedCategory || 'Весь каталог'}</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map(product => (
                  <div 
                    key={product.externalId} 
                    className={`group rounded-[32px] overflow-hidden transition-all duration-500 ${
                      isDark ? 'bg-[#1a1d21] hover:bg-[#1f2328]' : 'bg-white shadow-xl shadow-black/5 hover:shadow-2xl'
                    }`}
                  >
                    {/* КАРТИНКА ТОВАРА */}
                    <div className="aspect-[4/5] overflow-hidden bg-white relative">
                      <img 
                        src={`products/${product.externalId}.png`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={product.name} 
                        onError={(e) => { 
                          const foundCat = Object.keys(CATEGORY_IMAGES).find(key => product.name.includes(key));
                          e.currentTarget.src = foundCat ? CATEGORY_IMAGES[foundCat] : 'https://images.unsplash.com/photo-1550583760-706c42199ad4?q=80&w=1000&auto=format&fit=crop';
                        }}
                      />
                      {/* Градиент поверх картинки снизу */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* КОНТЕНТ КАРТОЧКИ */}
                    <div className="p-5 flex flex-col gap-3">
                      <h3 className="font-bold text-base leading-tight h-10 line-clamp-2 opacity-90 group-hover:opacity-100">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase opacity-40">Цена</span>
                          <span className="text-2xl font-black tracking-tight">{product.price} ₸</span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)} 
                          className="bg-[#E63946] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-500/30"
                        >
                          <Plus size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* КОРЗИНА (БОКОВАЯ ПАНЕЛЬ) */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-[35px] sticky top-24 border ${
              isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white shadow-2xl border-transparent'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">Заказ</h2>
                <span className="text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] px-2 py-1 rounded-full">
                  {cart.length} ПОЗИЦИИ
                </span>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-500/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="opacity-20" size={30} />
                  </div>
                  <p className="opacity-30 font-bold text-sm">Ваша корзина пуста</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                           <img 
                             src={`products/${item.externalId}.png`} 
                             className="w-full h-full object-cover"
                             onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' }}
                           />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-xs truncate">{item.name}</p>
                          <p className="text-[#E63946] font-black text-sm">{item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="opacity-30 hover:opacity-100 transition-opacity">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-dashed border-gray-500/20 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold opacity-50">К оплате:</span>
                      <span className="text-3xl font-black">{total} ₸</span>
                    </div>
                    <button className="bg-[#E63946] text-white w-full py-5 rounded-[22px] font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2">
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