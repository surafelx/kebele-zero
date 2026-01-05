import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, Search } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import MediaLibrarySelector from '../components/MediaLibrarySelector';

const AdminSouq = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;

      setProducts([...products, data[0]]);
      setShowProductForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateProduct = async (productData: any, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select();

      if (error) throw error;

      setProducts(products.map(p => p.id === productId ? data[0] : p));
      setShowProductForm(false);
      setEditingItem(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0), 0);
  const categories = [...new Set(products.map(p => p.category))].length;
  const lowStock = products.filter(p => (p.stock_quantity || 0) < 10).length;

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-3xl">Souq Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Manage your marketplace products</p>
        </div>
        <button
          onClick={() => setShowProductForm(true)}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Souq Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">{totalProducts}</p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Total Products</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">${totalValue.toFixed(0)}</p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Total Value</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">📂</span>
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{categories}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">⚠️</span>
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">{lowStock}</p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Low Stock</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 retro-input"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <label className="block text-sm font-semibold retro-text mb-2">Filter by Category</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
              >
                <option value="">All Categories</option>
                {[...new Set(products.map(p => p.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="retro-window text-center py-16">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-text text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="retro-window text-center py-16">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
          <p className="retro-text text-xl">No products found</p>
          <p className="retro-text text-base opacity-70 mt-3">Create your first product to get started</p>
        </div>
      ) : (() => {
        const filteredProducts = products.filter(product =>
          (searchTerm === '' ||
           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterStatus === '' || product.category === filterStatus)
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="retro-window retro-hover">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      {product.is_coming_soon && (
                        <span className="retro-badge px-3 py-1 text-xs bg-yellow-100 text-yellow-800">Coming Soon</span>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(product);
                          setShowProductForm(true);
                        }}
                        className="retro-btn-secondary p-2"
                      >
                        <Edit3 className="w-4 h-4 retro-icon" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="retro-btn-secondary p-2"
                      >
                        <Trash2 className="w-4 h-4 retro-icon" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl retro-title mb-3">{product.name}</h3>
                    <p className="text-gray-600 text-base retro-text mb-4 line-clamp-3">{product.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm retro-text opacity-80">
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex items-center text-sm retro-text opacity-80">
                        <span className="font-medium">Stock: {product.stock_quantity}</span>
                      </div>
                      <div className="flex items-center text-sm retro-text opacity-80">
                        <span className="font-medium">Category: {product.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <Modal
        isOpen={showProductForm}
        onClose={() => { setShowProductForm(false); setEditingItem(null); }}
        title={editingItem ? "Edit Product" : "Add New Product"}
        size="md"
      >
        <ProductForm
          onSubmit={(data) => {
            if (editingItem) {
              handleUpdateProduct(data, editingItem.id);
            } else {
              handleCreateProduct(data);
            }
          }}
          onCancel={() => { setShowProductForm(false); setEditingItem(null); }}
          editingItem={editingItem}
          onOpenMediaLibrary={() => setShowMediaLibrary(true)}
          onMediaSelected={(media) => {
            setEditingItem({ ...editingItem, image_url: media.media_url });
          }}
        />
      </Modal>

      <MediaLibrarySelector
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(media) => {
          if (editingItem) {
            setEditingItem({ ...editingItem, image_url: media.media_url });
          } else {
            // For new products, we'll handle this in the form
            const event = new CustomEvent('mediaSelected', { detail: media });
            window.dispatchEvent(event);
          }
          setShowMediaLibrary(false);
        }}
      />
    </div>
  );
};

export default AdminSouq;