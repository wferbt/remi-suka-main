import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Plus, X, Loader2 } from 'lucide-react';
import api from './api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalog')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.externalId === product.externalId);
      if (existing) {
        return prev.map(item => 
          item.externalId === product.externalId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.externalId !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = async () => {
    try {
      const orderData = {
        items: cart.map(item => ({
          externalId: item.externalId,
          quantity: item.quantity
        }))
      };
      await api.post('/orders', orderData);
      alert('Заказ успешно оформлен!');
      setCart([]);
    } catch (err) {
      alert('Ошибка при оформлении заказа');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-green-700">GreenFood</span>
          </div>
          <div className="relative p-2 bg-gray-100 rounded-full">
            <ShoppingCart size={24} className="text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Каталог продуктов</h2>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={40} /></div>
            ) : products.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Товаров пока нет. Добавьте их через API.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.externalId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-green-600 font-black text-xl">{product.price} ₸</p>
                      </div>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">Склад: {product.stock}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-green-600 transition-colors"
                    >
                      <Plus size={20} /> В корзину
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Ваш заказ</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic">Корзина пока пуста</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <div>
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} шт. × {item.price} ₸</p>
                        </div>
                        <button onClick={() => removeFromCart(item.externalId)} className="text-red-400 hover:text-red-600 p-1">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-gray-500">Итого:</span>
                      <span className="text-3xl font-black text-gray-900">{total} ₸</span>
                    </div>
                    <button 
                      onClick={checkout}
                      className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all"
                    >
                      Оформить заказ
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