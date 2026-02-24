import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiX,
  FiEye,
  FiSave,
  FiUpload,
  FiPenTool,
  FiCalendar,
  FiDollarSign,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatPrice, getStatusColor, getPaginationRange } from '../../utils/helpers';

const CUSTOM_ORDER_STATUSES = [
  'inquiry',
  'quoted',
  'accepted',
  'in-progress',
  'review',
  'revision',
  'completed',
  'delivered',
  'cancelled',
];

const statusPipelineColors = {
  inquiry: 'bg-gray-400',
  quoted: 'bg-blue-500',
  accepted: 'bg-indigo-500',
  'in-progress': 'bg-yellow-500',
  review: 'bg-amber-500',
  revision: 'bg-orange-500',
  completed: 'bg-emerald-500',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-500',
};

function StatusPipeline({ orders }) {
  const counts = {};
  CUSTOM_ORDER_STATUSES.forEach((s) => {
    counts[s] = 0;
  });
  orders.forEach((o) => {
    const status = o.status || 'inquiry';
    if (counts[status] !== undefined) counts[status]++;
  });

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3 font-['DM_Sans']">Pipeline Overview</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {CUSTOM_ORDER_STATUSES.map((status) => (
          <div key={status} className="text-center">
            <div
              className={`${statusPipelineColors[status]} text-white text-lg font-bold rounded-lg py-2 mb-1 font-['DM_Sans']`}
            >
              {counts[status]}
            </div>
            <p className="text-[10px] text-[#6B6B6B] capitalize font-['DM_Sans'] leading-tight">
              {status.replace(/-/g, ' ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomOrderDetailPanel({ isOpen, onClose, order, onSave }) {
  const [status, setStatus] = useState('inquiry');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressImages, setProgressImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'inquiry');
      setEstimatedPrice(order.estimatedPrice || '');
      setFinalPrice(order.finalPrice || '');
      setAdminNotes(order.adminNotes || '');
      setDeadline(order.deadline ? new Date(order.deadline).toISOString().split('T')[0] : '');
      setProgressImages(order.progressImages || []);
    }
  }, [order]);

  const handleProgressImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('images', file);
        const { data } = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data?.[0] || data.images?.[0] || { url: data.url, public_id: data.public_id };
      });

      const uploaded = await Promise.all(uploadPromises);
      setProgressImages((prev) => [...prev, ...uploaded]);
      toast.success(`${files.length} progress image(s) uploaded`);
    } catch {
      toast.error('Failed to upload progress images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!order?._id) return;
    setSaving(true);
    try {
      const payload = {
        status,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        finalPrice: finalPrice ? Number(finalPrice) : undefined,
        adminNotes,
        deadline: deadline || undefined,
        progressImages,
      };

      await api.put(`/custom-orders/${order._id}`, payload);
      toast.success('Custom order updated');
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to update custom order');
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
                  Custom Order #{order._id?.slice(-8)?.toUpperCase()}
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5 font-['DM_Sans']">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
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
                {order.user?.phone && (
                  <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">Phone: {order.user.phone}</p>
                )}
              </div>

              {/* Order details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 font-['DM_Sans']">Order Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#6B6B6B] font-['DM_Sans']">Type:</span>
                    <span className="ml-2 text-[#1A1A1A] capitalize font-['DM_Sans']">{order.orderType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#6B6B6B] font-['DM_Sans']">Medium:</span>
                    <span className="ml-2 text-[#1A1A1A] capitalize font-['DM_Sans']">{order.medium || 'N/A'}</span>
                  </div>
                  {order.size && (
                    <div>
                      <span className="text-[#6B6B6B] font-['DM_Sans']">Size:</span>
                      <span className="ml-2 text-[#1A1A1A] font-['DM_Sans']">
                        {order.size.width} x {order.size.height} {order.size.unit}
                      </span>
                    </div>
                  )}
                </div>
                {order.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-[#6B6B6B] font-['DM_Sans']">Description:</span>
                    <p className="text-sm text-[#1A1A1A] mt-1 font-['DM_Sans']">{order.description}</p>
                  </div>
                )}
              </div>

              {/* Reference images */}
              {order.referenceImages?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 font-['DM_Sans']">Reference Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {order.referenceImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                      >
                        <img src={img.url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Price quote */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">Price Quote</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                      Estimated Price (INR)
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                      <input
                        type="number"
                        min="0"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                      Final Price (INR)
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                      <input
                        type="number"
                        min="0"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 font-['DM_Sans']">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CUSTOM_ORDER_STATUSES.map((s) => {
                    const colors = getStatusColor(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`px-3 py-2 border rounded-lg text-xs font-medium transition-all capitalize font-['DM_Sans'] ${
                          status === s
                            ? 'border-[#C75B39] bg-[#C75B39]/5 text-[#C75B39] ring-2 ring-[#C75B39]/20'
                            : `border-gray-200 ${colors.text} hover:border-gray-300`
                        }`}
                      >
                        {s.replace(/-/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                  Deadline
                </label>
                <div className="relative max-w-[250px]">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  />
                </div>
              </div>

              {/* Progress images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">Progress Images</h3>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C75B39] bg-[#C75B39]/5 hover:bg-[#C75B39]/10 rounded-lg transition-colors font-['DM_Sans']"
                  >
                    <FiUpload className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProgressImageUpload}
                    className="hidden"
                  />
                </div>
                {progressImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {progressImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProgressImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                        {img.uploadedAt && (
                          <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/50 px-1 rounded font-['DM_Sans']">
                            {new Date(img.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">No progress images yet</p>
                )}
              </div>

              {/* Admin notes */}
              <div>
                <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-['DM_Sans']">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 resize-none font-['DM_Sans']"
                  placeholder="Internal notes about this custom order"
                />
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

export default function CustomOrderManager() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allOrders, statusFilter, search, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/custom-orders', { params: { limit: 200 } });
      const list = data.data || [];
      setAllOrders(list);
    } catch {
      toast.error('Failed to fetch custom orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o._id?.toLowerCase().includes(searchLower) ||
          o.user?.name?.toLowerCase().includes(searchLower) ||
          o.orderType?.toLowerCase().includes(searchLower) ||
          o.medium?.toLowerCase().includes(searchLower)
      );
    }

    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    const start = (page - 1) * limit;
    setOrders(filtered.slice(start, start + limit));
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
        <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Custom Orders</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{allOrders.length} custom orders total</p>
      </div>

      {/* Pipeline overview */}
      <StatusPipeline orders={allOrders} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by customer, type, medium..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white min-w-[160px]"
          >
            <option value="">All Statuses</option>
            {CUSTOM_ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
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
            <FiPenTool className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-[#6B6B6B] font-['DM_Sans']">No custom orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Customer</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Type</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Size</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Medium</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Status</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Est. Price</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Final Price</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Date</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order, idx) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      onClick={() => openDetail(order)}
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                          {order.user?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#1A1A1A] capitalize font-['DM_Sans']">
                        {order.orderType || '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {order.size?.width && order.size?.height
                          ? `${order.size.width}x${order.size.height} ${order.size.unit || 'in'}`
                          : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] capitalize font-['DM_Sans']">
                        {order.medium || '-'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors.bg} ${statusColors.text} font-['DM_Sans']`}>
                          {order.status?.replace(/-/g, ' ') || 'inquiry'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {order.estimatedPrice ? formatPrice(order.estimatedPrice) : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                        {order.finalPrice ? formatPrice(order.finalPrice) : '-'}
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

      {/* Detail panel */}
      <CustomOrderDetailPanel
        isOpen={panelOpen}
        onClose={() => { setPanelOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onSave={handleSave}
      />
    </div>
  );
}
