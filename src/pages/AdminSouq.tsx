import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, Search, Filter, DollarSign, Package, AlertTriangle } from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const lowStock = products.filter(p => (p.stock_quantity || 0) < 10).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-pink-600 to-rose-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <ShoppingBag className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Marketplace Management</h1>
              <p className="text-sm text-pink-100 font-bold uppercase">Manage your marketplace products</p>
            </div>
          </div>
          <button
            onClick={() => setShowProductForm(true)}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{totalProducts}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Products</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">${totalValue.toFixed(0)}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Value</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Package className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{categories.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{lowStock}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Low Stock</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-800">No products found</p>
          <p className="text-gray-500 mt-1">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                )}
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                      {product.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-pink-600">${product.price}</p>
                    <p className="text-sm text-gray-500">{product.stock_quantity || 0} in stock</p>
                  </div>
                  {product.stock_quantity < 10 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
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
