import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, CheckCircle, XCircle, Clock, Eye,
  ShoppingBag, Calendar, Building2, Smartphone, Banknote,
  ChevronDown, RefreshCw, StickyNote
} from 'lucide-react';
import { paymentRequestsAPI } from '../services/admin';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-100 border-yellow-500 text-yellow-800',
  approved: 'bg-emerald-100 border-emerald-500 text-emerald-800',
  rejected: 'bg-red-100 border-red-500 text-red-800',
  completed:'bg-blue-100 border-blue-500 text-blue-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:  <Clock className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  completed:<CheckCircle className="w-4 h-4" />,
};

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  bank_transfer: <Building2 className="w-4 h-4" />,
  mobile_money:  <Smartphone className="w-4 h-4" />,
  cash:          <Banknote className="w-4 h-4" />,
};

const AdminPaymentRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { fetchRequests(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, typeFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await paymentRequestsAPI.getRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching payment requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected' | 'completed') => {
    setActionLoading(true);
    try {
      await paymentRequestsAPI.updateStatus(id, newStatus, adminNotes);
      await fetchRequests();
      setShowDetailModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (req: any) => {
    setSelectedRequest(req);
    setAdminNotes(req.admin_notes || '');
    setShowDetailModal(true);
  };

  // Stats
  const total     = requests.length;
  const pending   = requests.filter(r => r.status === 'pending').length;
  const approved  = requests.filter(r => r.status === 'approved').length;
  const rejected  = requests.filter(r => r.status === 'rejected').length;
  const totalRevenue = requests
    .filter(r => r.status === 'approved' || r.status === 'completed')
    .reduce((s, r) => s + Number(r.total_amount), 0);

  // Filtering
  const filtered = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      r.user_email?.toLowerCase().includes(q) ||
      r.user_name?.toLowerCase().includes(q) ||
      r.item_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType   = typeFilter   === 'all' || r.item_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-violet-600 to-purple-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black">
              <CreditCard className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Payment Requests
              </h1>
              <p className="text-sm text-violet-100 font-bold uppercase">Review and approve pending requests</p>
            </div>
          </div>
          <button onClick={fetchRequests} className="retro-btn px-3 py-2 bg-white">
            <RefreshCw className="w-4 h-4 inline mr-1" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total',    value: total,    color: 'text-gray-800' },
          { label: 'Pending',  value: pending,  color: 'text-yellow-700' },
          { label: 'Approved', value: approved, color: 'text-emerald-700' },
          { label: 'Rejected', value: rejected, color: 'text-red-700' },
          { label: 'Revenue',  value: `$${totalRevenue.toFixed(2)}`, color: 'text-violet-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-4 text-center">
              <p className={`text-2xl font-black ${stat.color}`} style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{stat.value}</p>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-gray-100 to-gray-200">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Filter Requests</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, item…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="retro-input w-full pl-10"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="retro-input">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="retro-input">
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="product">Products</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border-4 border-black p-12 text-center">
          <div className="retro-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading requests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-black" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No requests found</p>
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-black bg-gray-100">
                  {['User', 'Item', 'Qty', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {paginated.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{req.user_name}</p>
                      <p className="text-xs text-gray-500">{req.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {req.item_type === 'event' ? <Calendar className="w-4 h-4 text-gray-500 flex-none" /> : <ShoppingBag className="w-4 h-4 text-gray-500 flex-none" />}
                        <span className="font-medium text-sm line-clamp-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{req.item_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-sm text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{req.quantity}</td>
                    <td className="px-4 py-3 font-black text-sm text-violet-700" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      ${Number(req.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        {PAYMENT_ICONS[req.payment_method]}
                        <span className="text-xs font-medium capitalize" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                          {req.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 border-2 text-xs font-bold uppercase ${STATUS_COLORS[req.status]}`}>
                        {STATUS_ICONS[req.status]}
                        <span style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{req.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(req)}
                        className="p-2 bg-white border-2 border-black hover:bg-violet-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t-4 border-black">
              <p className="text-sm font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="retro-btn px-3 py-1.5 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="retro-btn px-3 py-1.5 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedRequest(null); setAdminNotes(''); }}
        title="Payment Request Details"
        icon={<CreditCard className="w-5 h-5 text-violet-600" />}
        titleColor="from-violet-600 to-purple-600"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-5">
            {/* Request info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Submitted By</p>
                <p className="font-black" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.user_name}</p>
                <p className="text-sm text-gray-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.user_email}</p>
              </div>
              <div className="bg-gray-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Item</p>
                <div className="flex items-center space-x-2">
                  {selectedRequest.item_type === 'event' ? <Calendar className="w-4 h-4 flex-none" /> : <ShoppingBag className="w-4 h-4 flex-none" />}
                  <p className="font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.item_name}</p>
                </div>
                <p className="text-xs text-gray-500 capitalize mt-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.item_type}</p>
              </div>
              <div className="bg-gray-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Amount</p>
                <p className="text-2xl font-black text-violet-700" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  ${Number(selectedRequest.total_amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {selectedRequest.quantity} × ${Number(selectedRequest.item_price).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Payment Method</p>
                <div className="flex items-center space-x-2">
                  {PAYMENT_ICONS[selectedRequest.payment_method]}
                  <p className="font-bold capitalize" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {selectedRequest.payment_method.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {selectedRequest.notes && (
              <div className="bg-blue-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>User Notes</p>
                <p className="text-sm font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.notes}</p>
              </div>
            )}

            {/* Current status */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Current Status:</span>
              <span className={`inline-flex items-center space-x-1 px-3 py-1 border-2 text-sm font-bold uppercase ${STATUS_COLORS[selectedRequest.status]}`}>
                {STATUS_ICONS[selectedRequest.status]}
                <span style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{selectedRequest.status}</span>
              </span>
            </div>

            {/* Admin notes */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-bold uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                <StickyNote className="w-4 h-4" />
                <span>Admin Notes</span>
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="retro-input resize-none w-full"
                placeholder="Add notes for the user (optional)…"
              />
            </div>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => handleAction(selectedRequest.id, 'approved')}
                  disabled={actionLoading}
                  className="flex-1 retro-btn py-3 bg-emerald-500 border-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Approve</span>
                </button>
                <button
                  onClick={() => handleAction(selectedRequest.id, 'rejected')}
                  disabled={actionLoading}
                  className="flex-1 retro-btn py-3 bg-red-500 border-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Reject</span>
                </button>
              </div>
            )}
            {selectedRequest.status === 'approved' && (
              <button
                onClick={() => handleAction(selectedRequest.id, 'completed')}
                disabled={actionLoading}
                className="w-full retro-btn py-3 bg-blue-500 border-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Mark as Completed</span>
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPaymentRequests;
