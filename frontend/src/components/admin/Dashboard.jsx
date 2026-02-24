import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiArrowRight,
  FiEye,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import AdminStats from './AdminStats';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    usersChange: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.allSettled([
        api.get('/orders/admin/all', { params: { limit: 100 } }),
        api.get('/products', { params: { limit: 100 } }),
      ]);

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data?.data || [] : [];
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data?.data || [] : [];

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = ordersRes.status === 'fulfilled'
        ? ordersRes.value.data?.pagination?.total || orders.length
        : 0;
      const totalProducts = productsRes.status === 'fulfilled'
        ? productsRes.value.data?.pagination?.total || products.length
        : 0;

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers: 0,
        revenueChange: 0,
        ordersChange: 0,
        productsChange: 0,
        usersChange: 0,
      });

      // Build revenue chart from orders
      const monthlyRevenue = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[key] = { month: MONTHS[d.getMonth()], revenue: 0 };
      }

      orders.forEach((order) => {
        if (order.createdAt) {
          const d = new Date(order.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyRevenue[key]) {
            monthlyRevenue[key].revenue += order.totalAmount || 0;
          }
        }
      });

      const chartData = Object.values(monthlyRevenue);
      const hasData = chartData.some((d) => d.revenue > 0);
      setRevenueData(chartData);

      // Recent orders (last 10)
      const sorted = [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentOrders(sorted.slice(0, 10));

      // Top selling products
      const sortedProducts = [...products].sort(
        (a, b) => (b.soldCount || 0) - (a.soldCount || 0)
      );
      setTopProducts(sortedProducts.slice(0, 5));

      // Try to fetch users count
      try {
        const usersRes = await api.get('/auth/admin/users', { params: { limit: 1 } });
        const totalUsers = usersRes.data?.pagination?.total || usersRes.data?.data?.length || 0;
        setStats((prev) => ({ ...prev, totalUsers }));
      } catch {
        // Users endpoint may not exist yet
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FiDollarSign,
      label: 'Total Revenue',
      value: stats.totalRevenue,
      change: stats.revenueChange,
      color: 'accent',
      isCurrency: true,
    },
    {
      icon: FiShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders,
      change: stats.ordersChange,
      color: 'blue',
    },
    {
      icon: FiPackage,
      label: 'Total Products',
      value: stats.totalProducts,
      change: stats.productsChange,
      color: 'gold',
    },
    {
      icon: FiUsers,
      label: 'Total Users',
      value: stats.totalUsers,
      change: stats.usersChange,
      color: 'purple',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-100">
          <p className="text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">{label}</p>
          <p className="text-sm text-[#C75B39] font-semibold font-['DM_Sans']">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1 font-['DM_Sans']">
          Here is what is happening with your store today.
        </p>
      </div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {statCards.map((card) => (
          <AdminStats key={card.label} {...card} />
        ))}
      </motion.div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Revenue Overview</h2>
            <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">Last 12 months</p>
          </div>
        </div>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B6B', fontSize: 12, fontFamily: 'DM Sans' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B6B6B', fontSize: 12, fontFamily: 'DM Sans' }}
                tickFormatter={(val) => {
                  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                  return val;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#C75B39"
                strokeWidth={2.5}
                dot={{ fill: '#C75B39', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#C75B39', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Recent Orders</h2>
            <Link
              to="/control-panel/orders"
              className="flex items-center gap-1 text-sm text-[#C75B39] hover:text-[#a5492e] font-medium font-['DM_Sans'] transition-colors"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-5 py-3 font-['DM_Sans']">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#6B6B6B] font-['DM_Sans']">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => {
                    const statusColors = getStatusColor(order.orderStatus);
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      >
                        <td className="px-5 py-3 text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                          #{order._id?.slice(-8)?.toUpperCase()}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#6B6B6B] font-['DM_Sans']">
                          {order.user?.name || 'Unknown'}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-[#1A1A1A] font-['DM_Sans']">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} font-['DM_Sans']`}
                          >
                            {order.orderStatus?.replace(/-/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            to={`/control-panel/orders?id=${order._id}`}
                            className="p-1.5 text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors inline-flex"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top selling products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Top Products</h2>
            <Link
              to="/control-panel/products"
              className="flex items-center gap-1 text-sm text-[#C75B39] hover:text-[#a5492e] font-medium font-['DM_Sans'] transition-colors"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-3">
            {topProducts.length === 0 ? (
              <p className="text-center py-8 text-sm text-[#6B6B6B] font-['DM_Sans']">
                No products yet.
              </p>
            ) : (
              <div className="space-y-1">
                {topProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-[#6B6B6B] w-5 text-center font-['DM_Sans']">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate font-['DM_Sans']">
                        {product.title}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">
                        {formatPrice(product.discountPrice || product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1A1A1A] font-['DM_Sans']">
                        {product.soldCount || 0}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-['DM_Sans']">sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
