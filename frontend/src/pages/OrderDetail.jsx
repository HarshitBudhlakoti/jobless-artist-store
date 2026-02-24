import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiClock,
  FiMapPin,
  FiTruck,
  FiArrowLeft,
  FiCheckCircle,
} from 'react-icons/fi';
import api from '../api/axios';
import AnimatedPage from '../components/common/AnimatedPage';
import { formatPrice, getStatusColor, getImageUrl } from '../utils/helpers';

const STATUS_STEPS = ['placed', 'confirmed', 'in-progress', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data || data.order || data);
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FAF7F2' }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#C75B39" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="#C75B39"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <AnimatedPage>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2' }}>
          <div className="text-center">
            <FiPackage className="mx-auto mb-4 text-gray-300" size={48} />
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Order not found
            </h2>
            <p className="text-sm mb-6" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
              {error || 'We couldn\'t find this order.'}
            </p>
            <Link
              to="/profile#orders"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiArrowLeft size={16} /> Back to Orders
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const status = order.status || order.orderStatus || 'placed';
  const statusColors = getStatusColor(status);
  const items = order.items || order.orderItems || [];
  const address = order.shippingAddress || order.address;
  const currentStepIndex = STATUS_STEPS.indexOf(status.toLowerCase());

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back link */}
          <Link
            to="/profile#orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
          >
            <FiArrowLeft size={14} /> Back to Orders
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
              >
                Order Details
              </h1>
              <p className="text-sm mt-1" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
                #{(order.orderNumber || order._id || '').slice(-8).toUpperCase()}
                {' · '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium capitalize self-start ${statusColors.bg} ${statusColors.text}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {status.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Progress tracker */}
          {currentStepIndex >= 0 && status !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        {idx > 0 && (
                          <div
                            className="flex-1 h-0.5 transition-colors"
                            style={{ background: idx <= currentStepIndex ? '#C75B39' : '#E5E7EB' }}
                          />
                        )}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            background: isCompleted ? '#C75B39' : '#F3F4F6',
                            border: isCurrent ? '2px solid #C75B39' : 'none',
                          }}
                        >
                          {isCompleted ? (
                            <FiCheckCircle size={14} className="text-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div
                            className="flex-1 h-0.5 transition-colors"
                            style={{ background: idx < currentStepIndex ? '#C75B39' : '#E5E7EB' }}
                          />
                        )}
                      </div>
                      <span
                        className="text-[10px] mt-2 capitalize hidden sm:block"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: isCompleted ? '#C75B39' : '#9CA3AF',
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                      >
                        {step.replace(/-/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2
              className="text-lg font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Items
            </h2>
            <div className="space-y-4">
              {items.map((item, idx) => {
                const product = item.product || {};
                const img = product.images?.[0] || item.image || product.image;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      {img ? (
                        <img
                          src={getImageUrl(typeof img === 'object' ? img.url : img, 100, 100)}
                          alt={product.title || 'Item'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-gray-300" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                      >
                        {product.title || product.name || item.name || 'Art piece'}
                      </p>
                      <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                    <p
                      className="text-sm font-semibold shrink-0"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      {formatPrice(item.price || product.price)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
              >
                Total Amount
              </span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
              >
                {formatPrice(order.totalAmount || order.total)}
              </span>
            </div>
          </div>

          {/* Shipping & tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {address && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p
                  className="text-sm font-semibold flex items-center gap-2 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                >
                  <FiMapPin size={14} style={{ color: '#C75B39' }} /> Shipping Address
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  {address.street || address.address}
                  {address.city && `, ${address.city}`}
                  {address.state && `, ${address.state}`}
                  {(address.zip || address.zipCode || address.pincode) &&
                    ` - ${address.zip || address.zipCode || address.pincode}`}
                  {address.country && `, ${address.country}`}
                </p>
              </div>
            )}

            {(order.trackingNumber || order.tracking) && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p
                  className="text-sm font-semibold flex items-center gap-2 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                >
                  <FiTruck size={14} style={{ color: '#C75B39' }} /> Tracking
                </p>
                <p className="text-sm font-mono" style={{ color: '#C75B39' }}>
                  {order.trackingNumber || order.tracking}
                </p>
              </div>
            )}

            {order.createdAt && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p
                  className="text-sm font-semibold flex items-center gap-2 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                >
                  <FiClock size={14} style={{ color: '#C75B39' }} /> Order Placed
                </p>
                <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
