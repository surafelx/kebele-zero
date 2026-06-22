import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PaymentRequestModal from '../components/PaymentRequestModal';
import AuthModal from '../components/AuthModal';
import { ShoppingCart, Heart, Star, Filter, Search, Shirt, Coffee, Book, Music, Gem, Home, X } from 'lucide-react';
import { productsAPI } from '../services/content';
import ModalLoader from '../components/ModalLoader';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; alt: string }>;
  imageUrl?: string;
  image_url?: string;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
}

// Shown when a product has no image, instead of a broken-image icon.
const PRODUCT_PLACEHOLDER =
  'https://placehold.co/600x400/ecfdf5/10b981?text=Kebele+Souq';

const KebeleSouq: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{ id: string; type: 'product'; name: string; price: number } | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getProducts({ category: selectedCategory || undefined });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await productsAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handlePurchase = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setPaymentItem({ id: product.id, type: 'product', name: product.name, price: product.price });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  if (loading) return <ModalLoader label="Loading Souq..." fullHeight />;

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Smaller */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-emerald">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-4 h-4 retro-icon" />
              <span className="retro-title text-xs font-bold uppercase">KEBELE SOUQ</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-4 text-center">
            <h1 className="text-xl md:text-2xl retro-title mb-3 leading-tight uppercase tracking-tight">
              DISCOVER ETHIOPIAN CRAFTSMANSHIP
            </h1>
            <p className="text-xs md:text-sm retro-text max-w-2xl mx-auto leading-relaxed">
              Discover authentic Ethiopian craftsmanship and cultural treasures. Support local artisans and bring home pieces of Ethiopian heritage.
            </p>
          </div>
        </div>

        {/* Search and Filters - Minimal */}
        <div className="retro-window mb-8">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-4 h-4 retro-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 retro-input text-xs"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 retro-input bg-paper text-xs"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="bg-paper p-3 w-full rounded-lg border-2 border-charcoal retro-title text-xs">
                  <div className="text-charcoal mb-1 uppercase tracking-wide font-bold">Cart</div>
                  <div className="text-charcoal text-sm font-semibold">{cart.length} items</div>
                  <div className="text-charcoal font-bold">${cartTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          {products.length === 0 ? (
            <div className="retro-window retro-floating text-center p-12">
              <div className="retro-titlebar retro-titlebar-teal mb-6">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm font-bold uppercase">NO PRODUCTS FOUND</span>
                </div>
                <div className="retro-window-controls">
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-mustard rounded-lg flex items-center justify-center mx-auto mb-6 border-2 border-charcoal">
                <ShoppingCart className="w-8 h-8 text-charcoal retro-icon" />
              </div>
              <h3 className="retro-title text-xl font-bold mb-4 uppercase tracking-wide">No Products Found</h3>
              <p className="retro-text text-base">Try adjusting your search criteria or check back later for new arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="retro-window retro-floating overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-[3/2] overflow-hidden relative bg-gray-100">
                    <img
                      src={product.imageUrl || product.image_url || product.images?.[0]?.url || PRODUCT_PLACEHOLDER}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }}
                    />
                    {/* Semi-transparent background overlay for better tag visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

                    {product.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-green-600 text-white rounded-md retro-title text-xs font-bold uppercase border-2 border-white shadow-lg transform -rotate-3">
                          FEATURED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-purple-600 text-white rounded-md retro-title text-xs font-bold uppercase border-2 border-white shadow-sm">
                        {product.category}
                      </span>
                      <span className="retro-title text-sm font-bold text-charcoal">
                        ${product.price}
                      </span>
                    </div>

                    <h3 className="retro-title text-sm font-bold mb-1 leading-tight uppercase line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="retro-text text-xs mb-3 leading-relaxed">
                      {product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
                    </p>

                    <div className="flex items-stretch space-x-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 retro-btn text-xs py-1.5 font-bold uppercase whitespace-nowrap"
                      >
                        + Cart
                      </button>
                      <button
                        onClick={() => handlePurchase(product)}
                        className="flex-1 retro-btn text-xs py-1.5 font-bold uppercase whitespace-nowrap bg-orange-500 border-orange-700 text-white hover:bg-orange-600"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="retro-window retro-floating text-center">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">SUPPORT ETHIOPIAN ARTISANS</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-8">
            <h2 className="retro-title text-2xl font-bold mb-4 uppercase tracking-wide">READY TO SHOP ETHIOPIAN?</h2>
            <p className="retro-text text-base mb-6 max-w-2xl mx-auto leading-relaxed">
              Every purchase helps preserve Ethiopian cultural heritage and supports local communities. Shop with purpose.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="retro-btn text-lg py-4 px-8 font-bold uppercase">
                BROWSE ALL PRODUCTS
              </button>
              <button className="retro-btn-secondary text-lg py-4 px-8 font-bold uppercase">
                BECOME A SELLER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature="Souq"
      />

      {/* Payment Request Modal */}
      <PaymentRequestModal
        isOpen={!!paymentItem}
        onClose={() => setPaymentItem(null)}
        item={paymentItem ?? { id: '', type: 'product', name: '', price: 0 }}
      />
    </div>
  );
};

export default KebeleSouq;