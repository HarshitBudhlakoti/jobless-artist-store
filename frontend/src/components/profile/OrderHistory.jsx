import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiMapPin,
  FiTruck,
  FiShoppingBag,
  FiArrowRight,
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatPrice, getStatusColor, getImageUrl } from '../../utils/helpers';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders || data.data || data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
        <FiShoppingBag className="mx-auto mb-4 text-gray-300" size={48} />
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          No orders yet
        </h3>
        <p
          className="text-sm mb-6 max-w-sm mx-auto"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
        >
          Your order history will appear here once you make a purchase. Browse our gallery to find
          something you love.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold
                     transition-all duration-200 hover:shadow-lg"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: '#C75B39',
            boxShadow: '0 4px 14px rgba(199,91,57,0.25)',
          }}
        >
          Start Shopping <FiArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedId === order._id;
        const status = order.status || order.orderStatus || 'placed';
        const statusColors = getStatusColor(status);
        const items = order.items || order.orderItems || [];
        const address = order.shippingAddress || order.address;

        return (
          <motion.div
            key={order._id}
            layout
            className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
          >
            {/* Order header */}
            <button
              onClick={() => toggleExpand(order._id)}
              className="w-full p-5 flex items-center gap-4 text-left cursor-pointer"
            >
              {/* Thumbnails stack */}
              <div className="relative w-16 h-16 shrink-0">
                {items.slice(0, 3).map((item, idx) => {
                  const img =
                    item.product?.images?.[0] || item.image || item.product?.image;
                  return (
                    <div
                      key={idx}
                      className="absolute w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border-2 border-white"
                      style={{
                        top: idx * 4,
                        left: idx * 6,
                        zIndex: 3 - idx,
                      }}
                    >
                      {img ? (
                        <img
                          src={getImageUrl(img, 64, 64)}
                          alt="Item"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-gray-300" size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                >
                  Order #{(order.orderNumber || order._id || '').slice(-8).toUpperCase()}
                </p>
                <div
                  className="flex items-center gap-3 mt-1 text-xs"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  <span className="flex items-center gap-1">
                    <FiClock size={11} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Status & price */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors.bg} ${statusColors.text}`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {status.replace(/-/g, ' ')}
                </span>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                >
                  {formatPrice(order.totalAmount || order.total)}
                </p>
              </div>

              {/* Expand icon */}
              <div className="shrink-0 text-gray-400 ml-1">
                {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    {/* Items list */}
                    <div className="space-y-3 mb-5">
                      {items.map((item, idx) => {
                        const product = item.product || {};
                        const img = product.images?.[0] || item.image || product.image;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                              {img ? (
                                <img
                                  src={getImageUrl(img, 80, 80)}
                                  alt={product.title || product.name || 'Item'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiPackage className="text-gray-300" size={16} />
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
                              <p
                                className="text-xs"
                                style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                              >
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

                    {/* Shipping & tracking */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {address && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p
                            className="text-xs font-semibold flex items-center gap-1.5 mb-1.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            <FiMapPin size={12} /> Shipping Address
                          </p>
                          <p
                            className="text-xs leading-relaxed"
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
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p
                            className="text-xs font-semibold flex items-center gap-1.5 mb-1.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            <FiTruck size={12} /> Tracking Number
                          </p>
                          <p
                            className="text-xs font-mono"
                            style={{ color: '#C75B39' }}
                          >
                            {order.trackingNumber || order.tracking}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrderHistory;
