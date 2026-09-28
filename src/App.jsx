import React, { useState, useEffect, useMemo, memo, forwardRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  X, Heart, Check, Plus, Share2, Home, 
  User, ShoppingBag, Loader2, 
  Trash2, PlusCircle, Package, Minus,
  LayoutGrid, Search, Flame, Star, Sparkles, ArrowRight
} from 'lucide-react';

// --- SUPABASE CONFIG ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
}

const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '');

const BRAND_BLUE = "#3B82F6"; 

const SYSTEM_PRODUCTS = [
  { id: "p1", name: "Sugar Pods Pro", price: 129.99, color: "bg-blue-600", emoji: "🍭", storeHandle: "berrybliss", desc: "Pure sweetness for your ears.", sellerId: "system1", likes: 1240 },
  { id: "p2", name: "Arctic Knit", price: 85.00, color: "bg-cyan-500", emoji: "🧶", storeHandle: "mintyfresh", desc: "Recycled technical fibers.", sellerId: "system2", likes: 850 },
  { id: "p3", name: "Cyber Lens", price: 210.00, color: "bg-indigo-600", emoji: "🥽", storeHandle: "techwear_labs", desc: "Next-gen urban optics.", sellerId: "system3", likes: 3100 },
  { id: "p4", name: "Zen Desk", price: 45.99, color: "bg-sky-400", emoji: "🪴", storeHandle: "minimalist_home", desc: "A miniature paradise.", sellerId: "system4", likes: 520 }
];

const mapListing = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  color: row.color || 'bg-blue-700',
  emoji: row.emoji || '📦',
  storeHandle: row.store_handle,
  desc: row.description || '',
  sellerId: row.seller_id,
  likes: row.likes || 0,
});

// --- COMPONENTS ---

const FeedCard = memo(forwardRef(({ 
  product, 
  isTop, 
  isLiked, 
  isFollowing, 
  onSwipe, 
  onToggleSocial, 
  onOpenStore, 
  onExpand, 
  onShare 
}, ref) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const skipOpacity = useTransform(x, [-150, -50], [1, 0]);
  const addOpacity = useTransform(x, [50, 150], [0, 1]);

  const handleDragEnd = async (event, info) => {
    if (!isTop) return;
    if (info.offset.x > 100) {
      await animate(x, 500, { duration: 0.2 });
      onSwipe('right', product);
    } else if (info.offset.x < -100) {
      await animate(x, -500, { duration: 0.2 });
      onSwipe('left', product);
    } else {
      animate(x, 0, { type: 'spring' });
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.2 } }}
      style={{ x, rotate, opacity, zIndex: isTop ? 40 : 10 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 ${product.color} flex items-center justify-center overflow-hidden touch-none`}
    >
      <motion.div style={{ opacity: addOpacity }} className="absolute right-10 top-1/2 -translate-y-1/2 z-[100] pointer-events-none bg-blue-500 text-white px-8 py-4 rounded-full font-black border-4 border-white uppercase">ADD</motion.div>
      <motion.div style={{ opacity: skipOpacity }} className="absolute left-10 top-1/2 -translate-y-1/2 z-[100] pointer-events-none bg-black/60 text-white px-8 py-4 rounded-full font-black border-4 border-white/20 uppercase">SKIP</motion.div>

      <div className="text-[12rem] drop-shadow-2xl pointer-events-none">{product.emoji}</div>
      
      <div className="absolute inset-0 z-[60] flex flex-col justify-end p-4 pb-24 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        <div className="absolute right-3 bottom-28 flex flex-col gap-5 items-center w-16">
            <div className="relative mb-1">
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={(e) => { e.stopPropagation(); onOpenStore({ sellerId: product.sellerId, storeHandle: product.storeHandle, emoji: product.emoji }); }} 
                  className="w-12 h-12 rounded-full border-2 border-white bg-zinc-800 flex items-center justify-center overflow-hidden active:scale-90 transition-transform shadow-xl"
                >
                   {product.emoji}
                </button>
                {!isFollowing && (
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onToggleSocial('following', product.sellerId); }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 rounded-full p-1 border-2 border-black"
                  >
                    <Plus size={8} strokeWidth={5} />
                  </button>
                )}
            </div>

            <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onToggleSocial('liked', product.id); }} className="flex flex-col items-center active:scale-75 transition-transform">
                <Heart size={32} fill={isLiked ? BRAND_BLUE : "none"} color={isLiked ? BRAND_BLUE : "white"} strokeWidth={2.5}/>
                <span className="text-[10px] font-black mt-1">{(product.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>

            <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onShare(product); }} className="flex flex-col items-center active:scale-75 transition-transform">
                 <Share2 size={28} strokeWidth={2.5} />
                 <span className="text-[10px] font-black mt-1">Share</span>
            </button>
        </div>

        <div className="max-w-[calc(100%-80px)]">
            <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onExpand(product); }} className="bg-black/40 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black mb-0.5 flex items-center gap-1">@{product.storeHandle} {isFollowing && <Check size={12} className="text-blue-400" />}</p>
                      <h4 className="text-[17px] font-black italic truncate">{product.name}</h4>
                  </div>
                  <div className="flex items-center bg-white/10 rounded-2xl py-1.5 px-2.5 gap-2">
                      <span className="text-[15px] font-black">${product.price.toFixed(0)}</span>
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center"><ShoppingBag size={14} /></div>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}));

const BrowseView = ({ products, onExpand, onOpenStore }) => {
  const uniqueStores = useMemo(() => {
    const storeMap = new Map();
    products.forEach(p => {
      if (!storeMap.has(p.sellerId)) {
        storeMap.set(p.sellerId, { sellerId: p.sellerId, handle: p.storeHandle, emoji: p.emoji });
      }
    });
    return Array.from(storeMap.values());
  }, [products]);

  return (
    <div className="h-full w-full bg-black overflow-y-auto no-scrollbar pb-32">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center gap-4">
        <div className="flex-1 bg-zinc-900/80 rounded-2xl flex items-center px-4 py-3 gap-3 border border-white/5">
          <Search size={18} className="text-zinc-500" />
          <input type="text" placeholder="Search brands and drops..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="w-full aspect-[16/9] bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl rotate-12" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-blue-300" fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Exclusive Event</span>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter leading-tight mb-4">BLUE WEEK<br/>ACCESS</h2>
          <button className="bg-white text-blue-600 self-start px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">Shop All</button>
        </div>
      </div>

      <div className="mb-10">
        <div className="px-6 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" fill="currentColor" />
            <h3 className="text-lg font-black italic">Hot Stores</h3>
          </div>
          <ArrowRight size={18} className="opacity-30" />
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar">
          {uniqueStores.map(s => (
            <motion.div 
              key={s.sellerId} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => onOpenStore({ sellerId: s.sellerId, storeHandle: s.handle, emoji: s.emoji })} 
              className="flex-shrink-0 w-32 h-44 bg-zinc-900 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center border border-white/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl mb-3 border border-white/10">{s.emoji}</div>
              <p className="font-black italic text-xs mb-1 truncate w-full">@{s.handle}</p>
              <p className="text-[8px] font-black opacity-30 uppercase tracking-tighter">View Shop</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={20} className="text-yellow-400" fill="currentColor" />
          <h3 className="text-lg font-black italic">For You</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <motion.div 
              key={p.id} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => onExpand(p)} 
              className="bg-zinc-900 rounded-[2.5rem] p-5 flex flex-col border border-white/5"
            >
              <div className={`w-full aspect-square rounded-2xl ${p.color} flex items-center justify-center text-5xl mb-4`}>{p.emoji}</div>
              <div className="flex flex-col">
                <p className="font-black text-xs italic truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black italic text-blue-500">${p.price.toFixed(0)}</span>
                  <span className="text-[8px] font-black opacity-30 uppercase">@{p.storeHandle}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);
  const [userSocial, setUserSocial] = useState({ liked: [], following: [] });
  const [sellerProducts, setSellerProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null); 
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [fatalError, setFatalError] = useState(null);

  const allFeedProducts = useMemo(() => [...SYSTEM_PRODUCTS, ...sellerProducts], [sellerProducts]);
  const storeCatalog = useMemo(() => {
    if (!selectedStore) return [];
    return allFeedProducts.filter(p => p.sellerId === selectedStore.sellerId);
  }, [selectedStore, allFeedProducts]);

  const totalUnits = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2), [cart]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (sessionData.session?.user) {
          if (mounted) setUser(sessionData.session.user);
          return;
        }

        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        if (mounted) setUser(data.user);
      } catch (err) {
        console.error('Auth error:', err);
        if (mounted) setFatalError(err.message || 'Authentication failed');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user || null);
    });

    initAuth();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;

    const loadState = async () => {
      const { data, error } = await supabase
        .from('clivo_shop_state')
        .select('cart, liked, following')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('State fetch failed', error);
        return;
      }

      if (!active) return;
      setCart(Array.isArray(data?.cart) ? data.cart : []);
      setUserSocial({
        liked: Array.isArray(data?.liked) ? data.liked : [],
        following: Array.isArray(data?.following) ? data.following : [],
      });
    };

    const loadListings = async () => {
      const { data, error } = await supabase
        .from('clivo_shop_listings')
        .select('id, seller_id, store_handle, name, price, color, emoji, description, likes, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Listings fetch failed', error);
        return;
      }

      if (active) setSellerProducts((data || []).map(mapListing));
    };

    loadState();
    loadListings();

    const channel = supabase
      .channel(`clivo-shop-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clivo_shop_state', filter: `user_id=eq.${user.id}` },
        loadState,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clivo_shop_listings' },
        loadListings,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateCart = async (newItems) => {
    if (!user) return;
    setCart(newItems);

    const { error } = await supabase
      .from('clivo_shop_state')
      .upsert(
        { user_id: user.id, cart: newItems, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.error('Cart update failed', error);
      showToast('Could not update bag');
    }
  };

  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    const newItems = exists
      ? cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { ...product, qty: 1 }];
    updateCart(newItems);
    showToast('Added to Bag');
  };

  const adjustQty = (id, delta) => {
    const newItems = cart
      .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
      .filter((item) => item.qty > 0);
    updateCart(newItems);
  };

  const handleSwipe = (direction, product) => {
    if (direction === 'right') addToCart(product);
    setCurrentIndex((prev) => (prev < allFeedProducts.length - 1 ? prev + 1 : 0));
  };

  const toggleSocial = async (type, id) => {
    if (!user || !['liked', 'following'].includes(type)) return;
    const currentList = userSocial?.[type] || [];
    const newList = currentList.includes(id)
      ? currentList.filter((item) => item !== id)
      : [...currentList, id];
    const newSocial = { ...userSocial, [type]: newList };
    setUserSocial(newSocial);

    const { error } = await supabase
      .from('clivo_shop_state')
      .upsert(
        { user_id: user.id, [type]: newList, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.error('Social update failed', error);
      setUserSocial(userSocial);
      showToast('Could not save that action');
    }
  };

  const handleShare = (p) => {
    const url = `${window.location.origin}/?product=${p.id}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
          .then(() => showToast('Link Copied!'))
          .catch(() => {
            document.execCommand('copy');
            showToast('Link Copied!');
          });
    } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('Link Copied!');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.target);
    const payload = {
      seller_id: user.id,
      store_handle: user.id.slice(0, 5),
      name: String(fd.get('name') || '').trim(),
      price: Number.parseFloat(fd.get('price')),
      color: 'bg-blue-700',
      emoji: String(fd.get('emoji') || '📦').trim() || '📦',
      description: String(fd.get('desc') || '').trim(),
      likes: 0,
    };

    const { error } = await supabase.from('clivo_shop_listings').insert(payload);
    if (error) {
      console.error('Listing create failed', error);
      showToast('Could not publish listing');
      return;
    }

    e.target.reset();
    showToast('Listing Live!');
  };

  const deleteListing = async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from('clivo_shop_listings')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) {
      console.error('Listing delete failed', error);
      showToast('Could not delete listing');
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  if (fatalError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-950 border border-white/10 rounded-3xl p-6">
          <h1 className="text-xl font-black italic mb-3">SUPABASE SETUP REQUIRED</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {fatalError}
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Verify the Vercel environment variables and enable Anonymous Sign-Ins in Supabase Authentication settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden font-sans select-none relative">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap'); :root { font-family: 'Outfit', sans-serif; }`}</style>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-blue-500 text-white px-5 py-2.5 rounded-full font-black text-[10px] shadow-2xl flex items-center gap-2">
            <Check size={12} className="text-white" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="h-full relative z-0">
        {activeTab === 'home' ? (
              <div className="relative h-full w-full">
                <AnimatePresence mode="popLayout">
                 {allFeedProducts.length > 0 ? (
                   <FeedCard 
                     key={allFeedProducts[currentIndex].id} 
                     product={allFeedProducts[currentIndex]} 
                     isTop={true}
                     isLiked={userSocial.liked?.includes(allFeedProducts[currentIndex].id)}
                     isFollowing={userSocial.following?.includes(allFeedProducts[currentIndex].sellerId)}
                     onSwipe={handleSwipe}
                     onToggleSocial={toggleSocial}
                     onOpenStore={setSelectedStore}
                     onExpand={setExpandedProduct}
                     onShare={handleShare}
                   />
                 ) : (
                   <div key="empty" className="h-full flex flex-col items-center justify-center opacity-40">
                     <Package size={48} className="mb-4" />
                     <p className="font-black italic">No products found</p>
                   </div>
                 )}
                </AnimatePresence>
              </div>
        ) : activeTab === 'browse' ? (
          <BrowseView products={allFeedProducts} onExpand={setExpandedProduct} onOpenStore={setSelectedStore} />
        ) : activeTab === 'bag' ? (
            <div className="h-full bg-zinc-950 p-6 overflow-y-auto pb-32">
                <h2 className="text-3xl font-black italic mb-6">YOUR BAG</h2>
                {cart.length === 0 ? <p className="text-center opacity-30 mt-20 font-bold uppercase tracking-widest">Empty</p> : (
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-2xl`}>{item.emoji}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm leading-none mb-1">{item.name}</p>
                                    <p className="text-xs font-black opacity-50">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center bg-zinc-900 rounded-xl p-1 gap-3">
                                  <button onClick={() => adjustQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90"><Minus size={14}/></button>
                                  <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                                  <button onClick={() => adjustQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90"><Plus size={14}/></button>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 p-6 bg-blue-600 text-white rounded-[2.5rem] flex justify-between items-center">
                            <div><p className="text-[10px] font-black uppercase opacity-60">Subtotal</p><p className="text-3xl font-black italic leading-none">${totalPrice}</p></div>
                            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Checkout</button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="h-full bg-zinc-950 overflow-y-auto pb-32">
                <div className="p-8 border-b border-white/10 bg-zinc-900/50">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-3xl font-black shadow-lg">U</div>
                        <div>
                            <h2 className="text-2xl font-black italic leading-none">@{user?.id.slice(0, 8)}</h2>
                            <p className="text-xs font-medium opacity-50 mt-1 uppercase tracking-widest text-blue-400">Shop Partner</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-lg font-black italic">{sellerProducts.filter(p => p.sellerId === user?.id).length}</p><p className="text-[8px] font-black opacity-40 uppercase">Listings</p></div>
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-lg font-black italic">{userSocial.liked?.length || 0}</p><p className="text-[8px] font-black opacity-40 uppercase">Likes</p></div>
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-lg font-black italic">{userSocial.following?.length || 0}</p><p className="text-[8px] font-black opacity-40 uppercase">Following</p></div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-black italic mb-6 flex items-center gap-2"><Package size={20} className="text-blue-500"/> MY SHOP TOOLS</h3>
                    
                    <form onSubmit={handleCreateListing} className="space-y-4 mb-10 bg-white/5 p-6 rounded-[2rem] border border-white/10">
                        <input name="name" placeholder="Product Name" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold" />
                        <div className="grid grid-cols-2 gap-4">
                            <input name="price" type="number" step="0.01" placeholder="Price" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold" />
                            <input name="emoji" placeholder="Emoji (e.g. 🎒)" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold" />
                        </div>
                        <textarea name="desc" placeholder="Product Description..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium h-24" />
                        <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                           <PlusCircle size={16} /> Publish Listing
                        </button>
                    </form>

                    <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">Active Listings</h3>
                    <div className="space-y-3">
                        {sellerProducts.filter(p => p.sellerId === user?.id).map(p => (
                            <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <div className="text-2xl">{p.emoji}</div>
                                <div className="flex-1"><p className="font-bold text-sm">{p.name}</p><p className="text-[10px] opacity-40">${p.price}</p></div>
                                <button onClick={() => deleteListing(p.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-[80px] bg-black/95 backdrop-blur-2xl border-t border-white/10 flex z-[500] pb-2">
        {[
          { id: 'home', icon: Home, label: 'Feed' },
          { id: 'browse', icon: LayoutGrid, label: 'Browse' },
          { id: 'bag', icon: ShoppingBag, label: 'Bag', count: totalUnits },
          { id: 'profile', icon: User, label: 'Me' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center justify-center flex-1 h-full ${activeTab === t.id ? 'text-blue-500' : 'text-zinc-500'}`}>
            <div className="relative">
                <t.icon size={22} strokeWidth={activeTab === t.id ? 3 : 2} />
                {t.count > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center text-white ring-2 ring-black">{t.count}</span>}
            </div>
            <span className="text-[9px] font-black uppercase mt-1 tracking-wider">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {selectedStore && (
          <React.Fragment key="store-overlay">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedStore(null)} 
              className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 28, stiffness: 200 }} 
              className="fixed inset-y-0 right-0 w-[85%] z-[601] bg-zinc-950 border-l border-white/10 flex flex-col overflow-hidden shadow-2xl"
            >
                <div className="p-8 pb-4 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-blue-500 flex items-center justify-center text-3xl shadow-lg">{selectedStore.emoji}</div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black italic">@{selectedStore.storeHandle}</h3>
                        <p className="text-xs opacity-50 font-medium text-blue-400">Verified Partner</p>
                    </div>
                    <button onClick={() => setSelectedStore(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center active:scale-90 transition-transform"><X /></button>
                </div>
                <div className="flex px-8 py-4 gap-8 border-b border-white/5">
                    <div><p className="text-lg font-black italic">{storeCatalog.length}</p><p className="text-[9px] uppercase font-black opacity-40">Products</p></div>
                    <button onClick={() => toggleSocial('following', selectedStore.sellerId)} 
                      className={`ml-auto px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all ${userSocial.following?.includes(selectedStore.sellerId) ? 'bg-zinc-800 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}>
                        {userSocial.following?.includes(selectedStore.sellerId) ? 'Following' : 'Follow'}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
                    <div className="grid grid-cols-1 gap-4">
                        {storeCatalog.map(p => (
                            <div key={p.id} onClick={() => setExpandedProduct(p)} className="bg-white/5 rounded-3xl p-4 flex items-center gap-4 group active:scale-95 transition-all border border-white/0 hover:border-white/5">
                                <div className={`${p.color} w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl`}>{p.emoji}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-black italic truncate leading-none mb-1">{p.name}</p>
                                    <p className="text-xs font-black text-blue-500">${p.price.toFixed(0)}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><Plus size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
          </React.Fragment>
        )}

        {expandedProduct && (
            <React.Fragment key="product-overlay">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExpandedProduct(null)} className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 inset-x-0 h-[75vh] z-[901] bg-zinc-950 rounded-t-[3rem] border-t border-white/10 flex flex-col overflow-hidden">
                    <div className={`h-[40%] ${expandedProduct.color} flex items-center justify-center relative`}>
                        <button onClick={() => setExpandedProduct(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center"><X /></button>
                        <span className="text-9xl drop-shadow-2xl">{expandedProduct.emoji}</span>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-3xl font-black italic mb-1">{expandedProduct.name}</h3><p className="text-blue-500 font-black text-sm">@{expandedProduct.storeHandle}</p></div>
                            <p className="text-3xl font-black italic">${expandedProduct.price.toFixed(2)}</p>
                        </div>
                        <p className="text-zinc-400 text-sm mb-auto leading-relaxed">{expandedProduct.desc}</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => toggleSocial('liked', expandedProduct.id)} className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
                                <Heart fill={userSocial.liked?.includes(expandedProduct.id) ? BRAND_BLUE : "none"} color={userSocial.liked?.includes(expandedProduct.id) ? BRAND_BLUE : "white"} />
                            </button>
                            <button onClick={() => { addToCart(expandedProduct); setExpandedProduct(null); }} 
                                className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-lg italic flex items-center justify-center gap-3 shadow-xl shadow-blue-900/30">
                                <ShoppingBag size={22} /> BUY NOW
                            </button>
                        </div>
                    </div>
                </motion.div>
            </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;