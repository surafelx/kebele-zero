import React, { useState } from 'react';
import { CreditCard, X, CheckCircle, Banknote, Smartphone, Building2 } from 'lucide-react';
import { paymentRequestsAPI } from '../services/admin';
import { useAuth } from '../contexts/AuthContext';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    type: 'event' | 'product';
    name: string;
    price: number;
  };
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'Transfer to our bank account' },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, desc: 'TeleBirr, M-Pesa, etc.' },
  { value: 'cash', label: 'Cash', icon: Banknote, desc: 'Pay in person' },
] as const;

const PaymentRequestModal: React.FC<PaymentRequestModalProps> = ({ isOpen, onClose, item }) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'mobile_money' | 'cash'>('bank_transfer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = item.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('You must be signed in to submit a request.'); return; }
    setSubmitting(true);
    setError('');

    try {
      await paymentRequestsAPI.createRequest({
        user_id: user.id,
        user_email: user.email,
        user_name: user.username || user.email,
        item_type: item.type,
        item_id: item.id,
        item_name: item.name,
        item_price: item.price,
        quantity,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes,
        status: 'pending',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setQuantity(1);
    setPaymentMethod('bank_transfer');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="max-w-lg w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500 flex-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Payment Request
              </h3>
              <p className="text-xs text-emerald-100 font-bold uppercase">Pending admin approval</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 bg-white border-2 border-black hover:bg-red-100 transition-colors">
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {submitted ? (
            /* ── Success state ─────────────────────────────── */
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 border-4 border-black mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-black uppercase mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Request Submitted!
              </h4>
              <p className="font-medium text-gray-600 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Your payment request for <span className="font-black">{item.name}</span> has been sent.
              </p>
              <p className="text-sm font-medium text-gray-500 mb-6" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                An admin will review and approve it shortly. You'll be notified once approved.
              </p>
              <div className="bg-emerald-50 border-4 border-black p-4 mb-6 text-left space-y-1">
                <p className="text-sm font-bold uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Request Summary</p>
                <p className="text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Item: <span className="font-bold">{item.name}</span></p>
                <p className="text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Qty: <span className="font-bold">{quantity}</span></p>
                <p className="text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total: <span className="font-black text-emerald-700">${totalAmount.toFixed(2)}</span></p>
                <p className="text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Payment: <span className="font-bold capitalize">{paymentMethod.replace('_', ' ')}</span></p>
              </div>
              <button onClick={handleClose} className="retro-btn px-8 py-3 bg-emerald-500 border-emerald-700">
                Done
              </button>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Item summary */}
              <div className="bg-gray-50 border-4 border-black p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {item.type === 'event' ? 'Event Ticket' : 'Product'}
                </p>
                <p className="font-black text-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{item.name}</p>
                <p className="font-bold text-emerald-700 text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 bg-white border-4 border-black font-black text-lg hover:bg-gray-100 active:translate-y-0.5 transition-transform"
                  >−</button>
                  <span className="text-2xl font-black w-12 text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(20, q + 1))}
                    className="w-10 h-10 bg-white border-4 border-black font-black text-lg hover:bg-gray-100 active:translate-y-0.5 transition-transform"
                  >+</button>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold uppercase text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total</p>
                    <p className="text-2xl font-black text-emerald-700" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Payment Method
                </label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <label
                        key={m.value}
                        className={`flex items-center space-x-3 p-3 border-4 cursor-pointer transition-colors ${
                          paymentMethod === m.value
                            ? 'border-black bg-emerald-50'
                            : 'border-gray-300 hover:border-black bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.value}
                          checked={paymentMethod === m.value}
                          onChange={() => setPaymentMethod(m.value)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 border-2 border-black flex items-center justify-center flex-none ${paymentMethod === m.value ? 'bg-emerald-500' : 'bg-white'}`}>
                          <Icon className={`w-4 h-4 ${paymentMethod === m.value ? 'text-white' : 'text-black'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{m.label}</p>
                          <p className="text-xs text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{m.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Notes <span className="font-normal normal-case text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="retro-input resize-none w-full"
                  placeholder="Any special requests or additional information..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-4 border-red-400">
                  <p className="text-sm font-bold text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 retro-btn py-3 bg-emerald-500 border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="retro-btn py-3 px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestModal;
