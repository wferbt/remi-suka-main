import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Plus, X, Loader2, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    api.get('/catalog')
      .then(res => {
        setProducts(res.data as Product[]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => 
        (product.externalId && item.externalId === product.externalId) || (item.name === product.name)
      );
      if (existing) {
        return prev.map(item => 
          ((product.externalId && item.externalId === product.externalId) || (item.name === product.name))
            ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product: CartItem) => {
    setCart(prev => {
      const index = prev.findIndex(item => 
        (product.externalId && item.externalId === product.externalId) || (item.name === product.name)
      );
      if (index !== -1) {
        const newCart = [...prev];
        if (newCart[index].quantity > 1) {
          newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 };
        } else {
          newCart.splice(index, 1);
        }
        return newCart;
      }
      return prev;
    });
  };

  // 1. Добавь эту функцию после removeFromCart
const clearCart = () => {
  if (window.confirm('Очистить корзину?')) {
    setCart([]);
  }
};

// 2. Внутри JSX найди заголовок корзины и замени на этот:
<h2 className="text-xl font-bold mb-6 flex items-center justify-between">
  Ваш заказ
  {cart.length > 0 && (
    <button 
      onClick={clearCart}
      className="text-[#28A745] text-xs font-bold hover:bg-green-50 px-2 py-1 rounded-lg transition-colors"
    >
      Clear
    </button>
  )}
</h2>

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        items: cart.map(item => ({ externalId: item.externalId, quantity: item.quantity }))
      };
      await api.post('/orders', orderData);
      alert('Заказ успешно оформлен!');
      setCart([]);
    } catch (err) {
      alert('Ошибка при оформлении заказа');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans text-gray-900">
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#28A745] p-1.5 rounded-xl">
              <Package className="text-white" size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-[#28A745]">GreenFood</span>
          </div>
          <div className="relative p-2.5 bg-gray-50 rounded-full">
            <ShoppingCart size={22} className="text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Секция Категорий */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 px-1 text-gray-800">Категории</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex-shrink-0 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mb-2 transition-all duration-300 shadow-sm border-2 overflow-hidden ${
                  selectedCategory === cat.id ? 'border-[#28A745] bg-white scale-105' : 'border-transparent bg-white group-hover:bg-gray-50'
                }`}>
                  <img src={cat.img} alt={cat.name} className="w-10 h-10 object-contain" />
                </div>
                <span className={`text-[11px] font-bold ${selectedCategory === cat.id ? 'text-[#28A745]' : 'text-gray-400'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-2xl font-black tracking-tight">{selectedCategory || 'Все продукты'}</h2>
              <span className="text-sm text-gray-400 font-medium">{filteredProducts.length} товаров</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#28A745]" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.externalId} className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group">
                    <div className="h-40 bg-[#F8F9FA] flex items-center justify-center p-4 overflow-hidden relative">
                      <img 
                        src={`https://loremflickr.com/400/400/dairy,bottle?lock=${product.externalId}`} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        alt={product.name} 
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-sm h-10 overflow-hidden line-clamp-2 mb-2 text-gray-800 leading-snug">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-black text-lg text-gray-900">{product.price} ₸</p>
                        <button 
                          onClick={() => addToCart(product)}
                          className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-[#28A745] transition-colors active:scale-90"
                        >
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
            <div className="bg-white p-5 rounded-[30px] shadow-xl border border-gray-50 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Ваш заказ</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium">Пусто</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                           <img src={`https://loremflickr.com/100/100/food?lock=${item.externalId}`} className="w-7 h-7 object-contain rounded" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-[11px] leading-tight text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-[#28A745] font-bold">{item.quantity} шт × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="text-gray-300 hover:text-red-500 p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-dashed pt-4">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-gray-400 font-bold">Итого:</span>
                      <span className="text-2xl font-black text-gray-900">{total} ₸</span>
                    </div>
                    <button 
                      onClick={checkout}
                      className="w-full bg-[#28A745] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#218838] transition-all flex items-center justify-center gap-2 group"
                    >
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