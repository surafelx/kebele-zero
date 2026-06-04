import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, Search, Filter, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { productsAPI } from '../services/content';
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
      const data = await productsAPI.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await productsAPI.createProduct(productData);
      setShowProductForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateProduct = async (productData: any, productId: string) => {
    try {
      await productsAPI.updateProduct(productId, productData);
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
      await productsAPI.deleteProduct(id);
      setProducts(products.filter(product => (product._id || product.id) !== id));
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
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-gray-100 to-gray-200">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Search & Filter</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="retro-input w-full pl-12"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="retro-input"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <div className="retro-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="font-medium text-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-medium text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No products found</p>
            <p className="font-medium text-sm opacity-70 mt-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Add your first product to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:translate-y-[-2px] transition-transform">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 border-b-4 border-black flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-800 text-lg mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{product.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 bg-pink-100 border-2 border-black text-xs font-bold uppercase">
                      {product.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 bg-white border-2 border-black hover:bg-yellow-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-black" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="font-medium text-gray-600 text-sm line-clamp-2 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{product.description}</p>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-pink-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>${product.price}</p>
                    <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{product.stock_quantity || 0} in stock</p>
                  </div>
                  {product.stock_quantity < 10 && (
                    <span className="px-2 py-0.5 bg-orange-100 border-2 border-black text-xs font-bold uppercase">
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
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-4 border-black">
          <p className="font-medium text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="retro-btn px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="retro-btn px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
