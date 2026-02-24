import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiShoppingBag,
  FiTruck,
  FiSave,
  FiPackage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatPrice, getStatusColor, getPaginationRange } from '../../utils/helpers';

const ORDER_STATUSES = ['placed', 'confirmed', 'in-progress', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function OrderDetailPanel({ isOpen, onClose, order, onSave }) {
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus || 'placed');
      setPaymentStatus(order.paymentStatus || 'pending');
      setTrackingNumber(order.trackingNumber || '');
      setNotes(order.notes || '');
    }
  }, [order]);

  const handleSave = async () => {
    if (!order?._id) return;
    setSaving(true);
    try {
      await api.put(`/orders/${order._id}/status`, {
        orderStatus,
        paymentStatus,
        trackingNumber: trackingNumber || undefined,
      });
      toast.success('Order updated successfully');
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">
                  Order #{order._id?.slice(-8)?.toUpperCase()}
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5 font-['DM_Sans']">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 font-['DM_Sans']">Customer</h3>
                <p className="text-sm text-[#1A1A1A] font-['DM_Sans']">{order.user?.name || 'N/A'}</p>
                <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">{order.user?.email || 'N/A'}</p>
              </div>

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 font-['DM_Sans']">Shipping Address</h3>
                  <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                    {order.shippingAddress.country}
                    {order.shippingAddress.phone && (
                      <>
                        <br />Phone: {order.shippingAddress.phone}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3 font-['DM_Sans']">
                  Items ({order.items?.length || 0})
                </h3>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate font-['DM_Sans']">
                          {item.product?.title || 'Product'}
                        </p>
                        <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">
                          Qty: {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">
                        {formatPrice(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">Total</span>
                  <span className="text-lg font-bold text-[#C75B39] font-['DM_Sans']">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Status updates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">Update Order</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Order status */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                      Order Status
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment status */}
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tracking number */}
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                    Tracking Number
                  </label>
                  <div className="relative">
                    <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                      placeholder="Enter tracking number"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 resize-none font-['DM_Sans']"
                    placeholder="Internal notes about this order"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[#6B6B6B] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C75B39] hover:bg-[#a5492e] rounded-lg transition-colors disabled:opacity-50 font-['DM_Sans']"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.orderStatus = statusFilter;

      const { data } = await api.get('/orders/admin/all', { params });
      let orderList = data.data || [];

      // Client-side search filtering
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        orderList = orderList.filter(
          (o) =>
            o._id?.toLowerCase().includes(searchLower) ||
            o.user?.name?.toLowerCase().includes(searchLower) ||
            o.user?.email?.toLowerCase().includes(searchLower)
        );
      }

      // Client-side date filtering
      if (dateFrom) {
        const from = new Date(dateFrom);
        orderList = orderList.filter((o) => new Date(o.createdAt) >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        orderList = orderList.filter((o) => new Date(o.createdAt) <= to);
      }

      setOrders(orderList);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || orderList.length);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setPanelOpen(true);
  };

  const handleSave = () => {
    fetchOrders();
    setPanelOpen(false);
    setSelectedOrder(null);
  };

  const pagination = getPaginationRange(page, totalPages);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Orders</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{total} orders total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              placeholder="Search by order ID or customer..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white min-w-[160px]"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            placeholder="To"
          />

          <button
            onClick={() => { setPage(1); fetchOrders(); }}
            className="px-4 py-2.5 bg-[#C75B39] hover:bg-[#a5492e] text-white text-sm font-medium rounded-lg transition-colors font-['DM_Sans'] whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-[#6B6B6B] font-['DM_Sans']">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Order ID</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Customer</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Items</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Total</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Payment</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Status</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Date</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order, idx) => {
                  const orderStatusColors = getStatusColor(order.orderStatus);
                  const paymentColors = getStatusColor(order.paymentStatus);
                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      onClick={() => openDetail(order)}
                    >
                      <td className="px-5 py-3 text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                        #{order._id?.slice(-8)?.toUpperCase()}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-[#1A1A1A] font-['DM_Sans']">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors.bg} ${paymentColors.text} font-['DM_Sans']`}>
                          {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderStatusColors.bg} ${orderStatusColors.text} font-['DM_Sans']`}>
                          {order.orderStatus?.replace(/-/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans'] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetail(order); }}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center px-4 py-3 border-t border-gray-100 gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {pagination.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-sm text-[#6B6B6B] font-['DM_Sans']">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors font-['DM_Sans'] ${
                    page === p
                      ? 'bg-[#C75B39] text-white'
                      : 'text-[#6B6B6B] hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Order detail panel */}
      <OrderDetailPanel
        isOpen={panelOpen}
        onClose={() => { setPanelOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onSave={handleSave}
      />
    </div>
  );
}
