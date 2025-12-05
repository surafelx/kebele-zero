import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, Star, Filter, Search, Shirt, Coffee, Book, Music, Gem, Home } from 'lucide-react';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-amber-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="w-3/4 h-full bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            </div>
            <div className="w-40 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="w-1/2 h-full bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
          <p className="mt-8 text-gray-600 font-medium">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Simple header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kebele <span className="text-green-600">Souq</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover authentic Ethiopian craftsmanship and cultural treasures. Support local artisans and bring home pieces of Ethiopian heritage.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <input
                  type="text"
                  placeholder="Search by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="bg-white rounded-xl p-4 border border-gray-200 w-full">
                  <div className="text-sm text-gray-600 mb-1">Cart Summary</div>
                  <div className="text-lg font-semibold text-gray-900">{cart.length} items</div>
                  <div className="text-amber-600 font-medium">${cartTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later for new arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                      <span className="text-sm text-gray-600">{product.inventory.quantity} in stock</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handlePurchase(product)}
                        className="flex-1 bg-orange-600 text-white py-2 px-3 rounded hover:bg-orange-700 transition-colors text-sm font-medium"
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
      </div>
    </div>
  );
};

export default KebeleSouq;