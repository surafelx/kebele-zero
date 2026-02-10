import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Trash2, Edit2, X, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [createFormData, setCreateFormData] = useState({
    amount: '',
    description: '',
    payment_method: 'card',
    currency: 'USD',
    status: 'pending'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating transaction:', error);
      } else {
        fetchTransactions();
        setEditingTransaction(null);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', deletingTransaction.id);

      if (error) {
        console.error('Error deleting transaction:', error);
      } else {
        fetchTransactions();
        setShowDeleteModal(false);
        setDeletingTransaction(null);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...createFormData,
          amount: parseFloat(createFormData.amount),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setTransactions([data[0], ...transactions]);
      setShowCreateModal(false);
      setCreateFormData({
        amount: '',
        description: '',
        payment_method: 'card',
        currency: 'USD',
        status: 'pending'
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-2 border-black';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-2 border-black';
      case 'failed':
        return 'bg-red-100 text-red-700 border-2 border-black';
      default:
        return 'bg-gray-100 text-gray-700 border-2 border-black';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Transaction Management</h2>
          <p className="text-gray-600 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Monitor payments and revenue</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide border-2 border-black transition-colors shadow-lg"
          style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Completed</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border-2 border-black">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Pending</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center border-2 border-black">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Failed</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{failedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center border-2 border-black">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Revenue</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-black">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all font-medium"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border-2 border-gray-300 focus:border-blue-500 focus:outline-none appearance-none font-medium"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
        <div className="p-5 border-b-4 border-black">
          <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Transactions</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-800 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No transactions found</p>
            <p className="text-gray-500 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100">
            {paginatedTransactions.map((transaction) => (
              <div key={transaction.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-black">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                          ${parseFloat(transaction.amount || '0').toFixed(2)}
                        </h4>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize border-2 border-black ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                        {transaction.payment_method || 'Unknown'} • {new Date(transaction.created_at).toLocaleString()}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-400 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{transaction.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-bold uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{transaction.currency || 'USD'}</p>
                      <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{transaction.id?.slice(0, 8)}...</p>
                    </div>
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="p-2 hover:bg-gray-100 rounded-lg border-2 border-black transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingTransaction(transaction);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg border-2 border-black transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t-4 border-black flex items-center justify-between">
            <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-white border-2 border-black text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-white border-2 border-black text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 border-b-4 border-black flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Update Transaction Status</h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg border-2 border-black transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Amount</p>
                <p className="text-lg font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>${parseFloat(editingTransaction.amount || '0').toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>New Status</p>
                <div className="flex gap-2">
                  {['pending', 'completed', 'failed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(editingTransaction.id, status)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-colors border-2 border-black ${
                        editingTransaction.status === status
                          ? status === 'completed'
                            ? 'bg-green-500 text-white'
                            : status === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 border-b-4 border-black">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Delete Transaction</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Are you sure you want to delete this transaction for ${parseFloat(deletingTransaction?.amount || '0').toFixed(2)}? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t-4 border-black flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTransaction(null);
                }}
                className="px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 border-2 border-black uppercase tracking-wide"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 border-2 border-black uppercase tracking-wide"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 border-b-4 border-black flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Create Transaction</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg border-2 border-black transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Description</label>
                <textarea
                  rows={2}
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all resize-none font-medium"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                  placeholder="Enter transaction description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Payment Method</label>
                  <select
                    value={createFormData.payment_method}
                    onChange={(e) => setCreateFormData({ ...createFormData, payment_method: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                  >
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Currency</label>
                  <select
                    value={createFormData.currency}
                    onChange={(e) => setCreateFormData({ ...createFormData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                    style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Status</label>
                <select
                  value={createFormData.status}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateTransaction}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-xl font-bold uppercase tracking-wide border-2 border-black transition-colors shadow-lg"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  Create Transaction
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wide border-2 border-black transition-colors"
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
