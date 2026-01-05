import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { supabase } from '../services/supabase';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-3xl">Transaction Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Monitor payments and revenue</p>
        </div>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="retro-window retro-hover">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600 retro-title">{transactions.filter(t => t.status === 'completed').length}</p>
                <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Completed</p>
              </div>
            </div>
            <div className="retro-progress">
              <div className="retro-progress-fill bg-green-500" style={{width: '85%'}}></div>
            </div>
          </div>
        </div>
        <div className="retro-window retro-hover">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md retro-icon">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-600 retro-title">{transactions.filter(t => t.status === 'pending').length}</p>
                <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Pending</p>
              </div>
            </div>
            <div className="retro-progress">
              <div className="retro-progress-fill bg-yellow-500" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>
        <div className="retro-window retro-hover">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600 retro-title">
                  ${transactions.reduce((sum, t) => sum + (t.status === 'completed' ? parseFloat(t.amount || '0') : 0), 0).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Revenue</p>
              </div>
            </div>
            <div className="retro-progress">
              <div className="retro-progress-fill bg-blue-500" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="retro-window">
        <div className="retro-titlebar retro-titlebar-blue p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center retro-icon">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="retro-title text-xl">Recent Transactions</h3>
              <p className="retro-text text-base opacity-80">Payment activity overview</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
              <p className="retro-text text-lg">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
              <p className="retro-text text-xl">No transactions found</p>
              <p className="retro-text text-base opacity-70 mt-3">Transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="retro-window retro-hover p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md retro-icon ${
                        transaction.status === 'completed' ? 'bg-green-100' :
                        transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <CreditCard className={`w-7 h-7 ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xl retro-title">
                          ${transaction.amount} {transaction.currency}
                        </h4>
                        <p className="text-base text-gray-600 retro-text">
                          {transaction.payment_method || 'Unknown method'} • {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`retro-badge px-4 py-2 ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : transaction.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
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

export default AdminTransactions;