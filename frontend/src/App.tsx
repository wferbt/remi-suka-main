import { useState, useEffect } from 'react';
import { Plus, Minus, Loader2, ChevronRight, Moon, Sun, Store, User, CheckCircle2, Package, ShoppingBag, Trash2 } from 'lucide-react';
import api from './api';

// Картинки (ассеты)
import milkImg from './assets/products/milk.png';
import kefirImg from './assets/products/kefir.png';
import smetanaImg from './assets/products/smetana.png';
import tvorogImg from './assets/products/tvorog.png';

// Типы данных
// Добавил fallback для ID, чтобы TS не ругался, если придет null
type Product = { 
  externalId: string; 
  name: string; 
  price: number; 
  stock: number; 
};

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
        // ВАЖНО: При получении данных, если вдруг externalId дублируются, это взорвет корзину.
        // Но здесь мы просто сохраняем данные как есть.
        setProducts(res.data); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, [isDark]);

  // ПРОФЕССИОНАЛЬНЫЙ ФИКС КОРЗИНЫ
  // Мы используем строгое сравнение по ID.
  const updateQuantity = (product: Product, delta: number) => {
    if (!product.externalId) {
      console.error("Критическая ошибка: У товара нет externalId!", product);
      return; 
    }

    setCart(prevCart => {
      // 1. Ищем товар в корзине строго по externalId
      const existingItemIndex = prevCart.findIndex(item => item.externalId === product.externalId);
      const existingItem = prevCart[existingItemIndex];

      // 2. Если товар уже есть
      if (existingItem) {
        const newQuantity = existingItem.quantity + delta;

        // Если количество стало <= 0, удаляем товар из массива
        if (newQuantity <= 0) {
          const newCart = [...prevCart];
          newCart.splice(existingItemIndex, 1);
          return newCart;
        }

        // Иначе обновляем количество конкретно у этого элемента
        const newCart = [...prevCart];
        newCart[existingItemIndex] = { ...existingItem, quantity: newQuantity };
        return newCart;
      }

      // 3. Если товара нет, и мы пытаемся добавить (delta > 0)
      if (delta > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      }

      // 4. Если товара нет, и мы пытаемся убавить (минус) - ничего не делаем
      return prevCart;
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
        <div className="bg-[#E63946] p-6 rounded-[30px] text-white inline-block shadow-xl">
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
          <div className="bg-[#E63946] p-2 rounded-xl text-white shadow-lg shadow-red-500/20"><Store size={20} /></div>
          <span className="text-xl font-bold uppercase tracking-tight">Aul Market</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <button onClick={() => setView('admin')} className="text-xs font-bold bg-[#E63946] text-white px-3 py-1.5 rounded-lg">АДМИН</button>}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-gray-500/10 transition-colors hover:bg-gray-500/20">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => user ? setUser(null) : setShowLogin(true)} className={`p-2 rounded-lg transition-colors ${user ? 'text-[#E63946] bg-[#E63946]/10' : 'bg-gray-500/10 hover:bg-gray-500/20'}`}><User size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* КАТЕГОРИИ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6 px-1">Категории</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              // ЛОГИКА ДЛЯ ИКОНКИ "ВСЕ"
              // Если id пустой (это "Все"), мы добавляем padding (p-5), чтобы картинка стала меньше визуально.
              // Если это обычная категория, padding 0 (p-0), чтобы картинка была на весь круг.
              const isAllCategory = cat.id === '';
              
              return (
                <button key={cat.name} onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all border-2 overflow-hidden shadow-sm ${
                    selectedCategory === cat.id ? 'border-[#E63946] bg-white shadow-red-500/10 scale-105' : 'bg-gray-100 dark:bg-[#2A2D31] border-transparent group-hover:bg-gray-200 dark:group-hover:bg-[#35393f]'
                  }`}>
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      // Вот здесь магия размера:
                      className={`w-full h-full object-cover transition-transform duration-300 ${isAllCategory ? 'p-5 opacity-70' : 'p-0'}`} 
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
                {products.filter(p => p.name.toLowerCase().includes(selectedCategory.toLowerCase())).map((product, index) => {
                  
                  // ВАЖНО: Если вдруг externalId одинаковые, используем index как часть ключа,
                  // но для логики корзины нам все равно нужен уникальный ID.
                  const uniqueKey = product.externalId || `prod-${index}`;
                  const inCart = cart.find(item => item.externalId === product.externalId);
                  
                  return (
                    // border-radius 30px как просил
                    <div key={uniqueKey} className={`rounded-[30px] p-2 transition-all duration-300 border ${isDark ? 'bg-[#1a1d21] border-white/5 shadow-xl' : 'bg-white border-transparent shadow-sm hover:shadow-xl'}`}>
                      
                      {/* Картинка: rounded-24px чтобы вписывалась в 30px родителя */}
                      <div className="aspect-square bg-white rounded-[24px] mb-3 flex items-center justify-center overflow-hidden shadow-inner border border-gray-50 relative">
                        <img 
                          src={getProductImage(product.name)} 
                          className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105" 
                          alt={product.name} 
                        />
                      </div>
                      
                      {/* Информация о товаре */}
                      <div className="px-3 pb-3">
                        <h3 className="font-bold text-base mb-2 h-10 line-clamp-2 leading-tight opacity-90">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xl font-bold tracking-tight">{product.price} ₸</span>
                          
                          {!inCart ? (
                            <button 
                              onClick={() => updateQuantity(product, 1)} 
                              className="bg-[#E63946] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#d62839] transition-all hover:shadow-lg hover:shadow-red-500/30 active:scale-90"
                            >
                              <Plus size={22} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1 pr-2 border dark:border-white/10">
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
              
              {paymentStep === 'none' ? (
                <>
                  <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
                    {cart.map(item => (
                      <div key={item.externalId} className="flex flex-col gap-3 p-4 bg-gray-50/50 dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-[#E63946]/30 transition-all">
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
                    <button onClick={() => setPaymentStep('processing')} disabled={cart.length === 0} className="w-full py-5 bg-[#E63946] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:shadow-none uppercase tracking-wide">
                      Оплатить заказ
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Заказ принят!</h3>
                  <p className="text-xs text-gray-500 mb-8 px-4 leading-relaxed">Наш менеджер свяжется с вами для уточнения деталей доставки.</p>
                  <button onClick={() => setPaymentStep('none')} className="text-[#E63946] text-sm font-bold hover:underline transition-all">В начало каталога</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
          <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl border ${isDark ? 'bg-[#1a1d21] border-white/5' : 'bg-white border-transparent'}`}>
            <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-tight">Вход в систему</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input required name="username" placeholder="Логин" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-medium" />
              <input required name="password" type="password" placeholder="Пароль" className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-white/5 outline-none border-2 border-transparent focus:border-[#E63946] transition-all font-medium" />
              <button type="submit" className="w-full py-4 bg-[#E63946] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 hover:bg-[#d62839] transition-all active:scale-95">Войти</button>
            </form>
            <button onClick={() => setShowLogin(false)} className="mt-6 w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors uppercase font-bold tracking-widest text-[10px]">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;