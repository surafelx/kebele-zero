import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, Star, Filter, Search, Shirt, Coffee, Book, Music, Gem, Home, X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; alt: string }>;
  category: string;
  inventory: { quantity: number };
  isActive: boolean;
  isFeatured: boolean;
}

// Mock products data
const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Handwoven Ethiopian Scarf",
    description: "Beautiful handwoven scarf made with traditional Ethiopian techniques, perfect for cultural events and daily wear.",
    price: 45,
    images: [
      { url: "https://images.unsplash.com/photo-1601762603332-db5e4b90cc5d?w=400&h=400&fit=crop", alt: "Handwoven scarf" },
      { url: "https://images.unsplash.com/photo-1582582494368-986c84ba9a0d?w=400&h=400&fit=crop", alt: "Scarf detail" }
    ],
    category: "Textiles",
    inventory: { quantity: 25 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "2",
    name: "Ethiopian Coffee Beans",
    description: "Premium single-origin coffee beans from the highlands of Ethiopia, known for their unique flavor profile.",
    price: 28,
    images: [
      { url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop", alt: "Coffee beans" }
    ],
    category: "Food",
    inventory: { quantity: 50 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "3",
    name: "Traditional Mesob Basket",
    description: "Handcrafted mesob basket used for traditional Ethiopian dining, made from local materials.",
    price: 35,
    images: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop", alt: "Mesob basket" }
    ],
    category: "Home",
    inventory: { quantity: 15 },
    isActive: true,
    isFeatured: false
  },
  {
    _id: "4",
    name: "Ethiopian Music CD Collection",
    description: "Curated collection of traditional Ethiopian music featuring various regional styles and instruments.",
    price: 22,
    images: [
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", alt: "Music collection" }
    ],
    category: "Music",
    inventory: { quantity: 30 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "5",
    name: "Handmade Beaded Jewelry",
    description: "Beautiful beaded jewelry crafted by Ethiopian artisans, featuring traditional patterns and colors.",
    price: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop", alt: "Beaded jewelry" }
    ],
    category: "Jewelry",
    inventory: { quantity: 40 },
    isActive: true,
    isFeatured: false
  },
  {
    _id: "6",
    name: "Injera Baking Kit",
    description: "Complete kit for making traditional Ethiopian injera at home, includes special pan and starter culture.",
    price: 65,
    images: [
      { url: "https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=400&fit=crop", alt: "Injera kit" }
    ],
    category: "Food",
    inventory: { quantity: 12 },
    isActive: true,
    isFeatured: true
  }
];

const mockCategories = ["Textiles", "Food", "Home", "Music", "Jewelry", "Books", "Art"];

const KebeleSouq: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      let filteredProducts = mockProducts;

      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handlePurchase = async (product: Product) => {
    if (!user) {
      alert('Please login to make a purchase');
      return;
    }

    // Mock payment process
    alert(`Mock payment successful! You purchased "${product.name}" for $${product.price}`);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="retro-window retro-floating text-center p-8 max-w-sm w-full">
          <div className="retro-titlebar retro-titlebar-teal mb-4">
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 retro-icon" />
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <div className="retro-title text-lg font-bold uppercase tracking-wider">Loading Souq...</div>
          <p className="retro-text text-sm mt-4 opacity-80">Discovering amazing Ethiopian products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Smaller */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-teal">
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
                <div key={product._id} className="retro-window retro-floating overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-[3/2] overflow-hidden relative">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Semi-transparent background overlay for better tag visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

                    {product.isFeatured && (
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

                    <div className="flex space-x-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 retro-btn text-xs py-1 font-bold uppercase"
                      >
                        ADD TO CART
                      </button>
                      <button
                        onClick={() => handlePurchase(product)}
                        className="flex-1 bg-orange-500 text-white px-2 py-1 rounded-lg retro-title text-xs font-bold uppercase border-2 border-white hover:bg-orange-600 transition-colors"
                      >
                        BUY NOW
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
              <button className="bg-paper text-charcoal px-8 py-4 rounded-lg retro-title text-lg font-bold uppercase border-2 border-charcoal hover:bg-mustard hover:text-charcoal transition-colors">
                BECOME A SELLER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KebeleSouq;