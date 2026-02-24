import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiPenTool,
  FiHeart,
  FiCamera,
  FiPackage,
  FiClock,
  FiArrowRight,
} from 'react-icons/fi';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { formatPrice, getStatusColor, getInitials, getImageUrl } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const UserProfile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    customOrders: 0,
    wishlistItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingStats(true);
      try {
        const [ordersRes, customRes] = await Promise.allSettled([
          api.get('/orders/my-orders?limit=3'),
          api.get('/custom-orders/my-orders?limit=3'),
        ]);

        const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : null;
        const custom = customRes.status === 'fulfilled' ? customRes.value.data : null;

        const ordersList = orders?.orders || orders?.data || [];
        const customList = custom?.orders || custom?.data || [];

        setStats({
          totalOrders: orders?.totalCount ?? orders?.total ?? ordersList.length ?? 0,
          customOrders: custom?.totalCount ?? custom?.total ?? customList.length ?? 0,
          wishlistItems: user?.wishlist?.length ?? 0,
        });

        setRecentOrders(ordersList.slice(0, 3));
      } catch {
        // Silently fail - stats will show 0
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: '#C75B39',
      bg: 'rgba(199,91,57,0.08)',
    },
    {
      label: 'Custom Orders',
      value: stats.customOrders,
      icon: FiPenTool,
      color: '#D4A857',
      bg: 'rgba(212,168,87,0.08)',
    },
    {
      label: 'Wishlist Items',
      value: stats.wishlistItems,
      icon: FiHeart,
      color: '#E56B8A',
      bg: 'rgba(229,107,138,0.08)',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative group">
          {user?.avatar ? (
            <img
              src={getImageUrl(user.avatar, 96, 96)}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2"
              style={{ borderColor: '#C75B39' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #C75B39, #D4A857)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {getInitials(user?.name)}
            </div>
          )}
          <button
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Change avatar"
          >
            <FiCamera className="text-white" size={20} />
          </button>
        </div>

        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
          >
            Welcome back, {user?.name?.split(' ')[0] || 'Artist'}!
          </h2>
          <p
            className="text-sm mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
          >
            {user?.email}
          </p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            className="bg-white rounded-xl p-5 border border-gray-100 transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <div>
                {loadingStats ? (
                  <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                  >
                    {card.value}
                  </p>
                )}
                <p
                  className="text-xs mt-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  {card.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent orders */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
          >
            Recent Orders
          </h3>
          <Link
            to="#orders"
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
          >
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loadingStats ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const statusColors = getStatusColor(order.status || order.orderStatus);
              const firstItem = order.items?.[0] || order.orderItems?.[0];
              const thumbnail = firstItem?.product?.images?.[0] || firstItem?.image;
              return (
                <motion.div
                  key={order._id}
                  whileHover={{ x: 4 }}
                  className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 cursor-pointer
                             transition-shadow hover:shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    {thumbnail ? (
                      <img
                        src={getImageUrl(thumbnail, 80, 80)}
                        alt="Order item"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="text-gray-300" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      Order #{(order.orderNumber || order._id || '').slice(-8).toUpperCase()}
                    </p>
                    <p
                      className="text-xs flex items-center gap-1 mt-0.5"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                    >
                      <FiClock size={11} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Status & Price */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {(order.status || order.orderStatus || 'placed').replace(/-/g, ' ')}
                    </span>
                    <p
                      className="text-sm font-semibold mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      {formatPrice(order.totalAmount || order.total)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <FiShoppingBag className="mx-auto mb-3 text-gray-300" size={32} />
            <p
              className="text-sm mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
            >
              No orders yet. Start exploring our gallery!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
            >
              Browse Art <FiArrowRight size={14} />
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
