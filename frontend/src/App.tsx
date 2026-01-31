import { useState, useEffect } from 'react';
import { Plus, Minus, Loader2, ChevronRight, Moon, Sun, Store, User, CheckCircle2, Package, ShoppingBag, Trash2, LogOut, Settings, X } from 'lucide-react';
import api from './api';

// Картинки
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

// Типы
type ProductRaw = { externalId?: string; id?: string; name: string; price: number; stock: number; };
type Product = ProductRaw & { uid: string }; 
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
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  
  // Состояния для фейк-оплаты
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Имитация загрузки с бэка
    api.get('/catalog')
      .then(res => { 
        const safeProducts = res.data.map((p: ProductRaw, index: number) => ({
          ...p,
          uid: p.externalId || p.id || `prod-${index}-${Date.now()}`
        }));
        setProducts(safeProducts); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isDark]);

  // --- ЛОГИКА КОРЗИНЫ ---
  const updateQuantity = (product: Product, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.uid === product.uid);
      if (idx !== -1) {
        const newQty = prev[idx].quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.uid !== product.uid);
        const newCart = [...prev];
        newCart[idx] = { ...newCart[idx], quantity: newQty };
        return newCart;
      } 
      if (delta > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
  };

  // --- ЛОГИКА ОПЛАТЫ (ФЕЙК) ---
  const handlePayment = () => {
    setIsPaying(true);
    // Имитируем задержку банка 2 секунды
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setCart([]); // Очищаем корзину
      
      // Через 3 секунды убираем сообщение об успехе
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    }, 2000);
  };

  // --- ЛОГИКА АДМИНКИ ---
  const handleDeleteProduct = (uid: string) => {
    if(window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      setProducts(prev => prev.filter(p => p.uid !== uid));
    }
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
    const login = formData.get('username') as string;
    const pass = formData.get('password') as string;

    // Простая проверка для босса
    if (login === 'admin' && pass === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setUser('Администратор');
      localStorage.setItem('user', 'Администратор');
      setView('admin'); // Сразу кидаем в админку
    } else {
      setUser(login);
      localStorage.setItem('user', login);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setView('shop');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- ЭКРАН АДМИНКИ ---
  if (view === 'admin') {
    return (
      <div className={`min-h-screen p-8 transition-colors ${isDark ? 'bg-[#121417] text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="text-[#E63946]" /> Панель управления
            </h1>
            <div className="flex gap-4">
               <button onClick={() => setView('shop')} className="flex items-center gap-2 font-bold px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-xl hover:opacity-80 transition-all">
                <Store size={18}/> В магазин
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 font-bold px-4 py-2 bg-[#E63946] text-white rounded-xl hover:bg-red-600 transition-all">
                <LogOut size={18}/> Выйти
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-gradient-to-br from-[#E63946] to-[#ff6b6b] p-6 rounded-[30px] text-white shadow-xl">
              <Package size={32} className="mb-2 opacity-80"/>
              <p className="font-bold text-sm opacity-80 uppercase">Всего товаров</p>
              <p className="text-4xl font-bold">{products.length}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1d21] p-6 rounded-[30px] shadow-sm border border-transparent dark:border-white/5">
              <p className="text-gray-500 mb-1">Активные заказы</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d21] rounded-[30px] shadow-sm overflow-hidden border border-gray-100 dark:border-white/5">
            <div className="p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-bold">Список товаров</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Фото</th>
                    <th className="px-6 py-4">Название</th>
                    <th className="px-6 py-4">Цена</th>
                    <th className="px-6 py-4">Остаток</th>
                    <th className="px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {products.map(product => (
                    <tr key={product.uid} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                          <img src={getProductImage(product.name)} className="w-full h-full object-contain p-1" />
                        </div>
                      </td>
                      <td className="px-6 py-3 font-bold">{product.name}</td>
                      <td className="px-6 py-3">{product.price} ₸</td>
                      <td className="px-6 py-3">{product.stock} шт.</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleDeleteProduct(product.uid)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ЭКРАН МАГАЗИНА ---
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#121417] text-white' : 'bg-[#F4F7F9] text-[#2D3436]'}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md h-16 flex items-center px-4 justify-between ${isDark ? 'bg-[#1a1d21]/90 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2 rounded-xl text-white shadow-lg shadow-red-500/20"><Store size={20} /></div>
          <span className="text-xl font-bold uppercase tracking-tight">Aul Market</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setView('admin')} className="hidden sm:flex items-center gap-2 text-xs font-bold bg-[#E63946] text-white px-3 py-1.5 rounded-lg shadow-red-500/20 shadow-md">
              <Settings size={14}/> АДМИНКА
            </button>
          )}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-gray-500/10 transition-colors hover:bg-gray-500/20">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => user ? (window.confirm('Выйти?') ? handleLogout() : null) : setShowLogin(true)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${user ? 'text-[#E63946] bg-[#E63946]/10' : 'bg-gray-500/10 hover:bg-gray-500/20'}`}>
            <User size={20} />
            {user && <span className="text-xs font-bold hidden sm:block">{user}</span>}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* КАТЕГОРИИ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6 px-1">Категории</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isAll = cat.id === '';
              return (
                <button key={cat.name} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all border-2 overflow-hidden shadow-sm ${
                    selectedCategory === cat.id ? 'border-[#E63946] bg-white shadow-red-500/10 scale-105' : 'bg-gray-100 dark:bg-[#2A2D31] border-transparent group-hover:bg-gray-200 dark:group-hover:bg-[#35393f]'
                  }`}>
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className={`w-full h-full object-cover transition-transform duration-300 ${isAll ? 'p-3 opacity-70' : ''}`} 
                    />
                  </div>
                  <span className={`text-sm font-bold transition-colors ${selectedCategory === cat.id ? 'text-[#E63946]' : 'text-gray-500'}`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E63946]" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map((product) => {
                  const inCart = cart.find(item => item.uid === product.uid);
                  
                  return (
                    <div key={product.uid} className={`card-container p-2 transition-all duration-300 border ${isDark ? 'bg-[#1a1d21] border-white/5 shadow-xl' : 'bg-white border-transparent shadow-sm hover:shadow-xl'}`}>
                      <div className="image-container aspect-square bg-white mb-3 flex items-center justify-center shadow-inner border border-gray-50 relative">
                        <img 
                          src={getProductImage(product.name)} 
                          className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105" 
                          alt={product.name} 
                        />
                      </div>
                      
                      <div className="px-3 pb-3">
                        <h3 className="font-bold text-base mb-2 h-10 line-clamp-2 leading-tight opacity-90">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xl font-bold tracking-tight">{product.price} ₸</span>
                          
                          {/* ВОТ ЗДЕСЬ ЛОГИКА: Если нет в корзине - Кнопка. Если есть - Цифры */}
                          {!inCart ? (
                            <button onClick={() => updateQuantity(product, 1)} className="bg-[#E63946] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#d62839] transition-all hover:shadow-lg hover:shadow-red-500/30 active:scale-90">
                              <Plus size={22} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1 pr-2 border dark:border-white/10 animate-in fade-in zoom-in duration-200">
                              <button onClick={() => updateQuantity(product, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 rounded-full text-[#E63946] shadow-sm hover:bg-gray-50"><Minus size={16}/></button>
                              <span className="font-bold text-base w-4 text-center">{inCart.quantity}</span>
                              <button onClick={() => updateQuantity(product, 1)} className="w-8 h-8 flex items-center justify-center bg-[#E63946] text-white rounded-full shadow-sm hover:bg-[#d62839]"><Plus size={16}/></button>
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
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-[30px] sticky top-20 border transition-all ${isDark ? 'bg-[#1a1d21] border-white/5 shadow-2xl shadow-black/50' : 'bg-white shadow-xl border-transparent'}`}>
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <ShoppingBag size={22} className="text-[#E63946]" /> Ваш заказ
              </h2>
              
              {!paymentSuccess ? (
                <>
                  <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.uid} className="flex flex-col gap-3 p-4 bg-gray-50/50 dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-[#E63946]/30 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-bold leading-tight opacity-90">{item.name}</p>
                          <button onClick={() => updateQuantity(item, -item.quantity)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[#E63946] font-bold text-base">{item.price * item.quantity} ₸</p>
                            <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-1 rounded-lg shadow-sm border dark:border-white/5">
                                <button onClick={() => updateQuantity(item, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"><Minus size={14}/></button>
                                <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#E63946] text-white hover:bg-[#d62839]"><Plus size={14}/></button>
                            </div>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm italic">Корзина пуста</p>
                        </div>
                    )}
                  </div>
                  <div className="border-t-2 border-dashed border-gray-200 dark:border-white/10 pt-6">
                    <div className="flex justify-between items-center mb-6 px-1">
                      <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Итого:</span>
                      <span className="text-2xl font-bold text-[#E63946] tracking-tight">{total} ₸</span>
                    </div>
                    
                    {/* КНОПКА ОПЛАТЫ */}
                    <button 
                      onClick={handlePayment} 
                      disabled={cart.length === 0 || isPaying} 
                      className="w-full py-5 bg-[#E63946] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      {isPaying ? <Loader2 className="animate-spin"/> : 'Оплатить заказ'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Оплата прошла!</h3>
                  <p className="text-xs text-gray-500 mb-8 px-4 leading-relaxed">Заказ успешно оформлен.</p>
                  <button onClick={() => setPaymentSuccess(false)} className="text-[#E63946] text-sm font-bold hover:underline transition-all">Вернуться к покупкам</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
          <div className={`relative w-full max-w-sm p-8 rounded-[40px] shadow-2xl border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white border-transparent'}`}>
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white"><X size={24}/></button>
            <h2 className="text-2xl font-bold mb-2 text-center uppercase tracking-tight">Вход</h2>
            <p className="text-center text-gray-500 text-sm mb-8">admin / admin для входа в панель</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input required name="username" placeholder="Логин" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-medium" />
              <input required name="password" type="password" placeholder="Пароль" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-medium" />
              <button type="submit" className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 hover:bg-[#d62839] transition-all active:scale-95">Войти</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;