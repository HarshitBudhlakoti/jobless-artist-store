import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiShoppingBag,
  FiPenTool,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import AnimatedPage from '../components/common/AnimatedPage';
import UserProfile from '../components/profile/UserProfile';
import OrderHistory from '../components/profile/OrderHistory';
import CustomOrderTracker from '../components/profile/CustomOrderTracker';
import ProfileSettings from '../components/profile/ProfileSettings';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { key: 'orders', label: 'Orders', icon: FiShoppingBag },
  { key: 'custom-orders', label: 'Custom Orders', icon: FiPenTool },
  { key: 'settings', label: 'Settings', icon: FiSettings },
];

const tabContentVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25 },
  },
};

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from URL hash
  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '');
    const valid = TABS.find((t) => t.key === hash);
    return valid ? hash : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);

  // Sync tab with URL hash
  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [loading, isAuthenticated, navigate, location]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    window.history.replaceState(null, '', `#${tabKey}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Loading state
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
          <p
            className="text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
          >
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AnimatedPage>
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page title */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              My Account
            </h1>
            <p
              className="text-sm mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
            >
              Manage your profile, orders, and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ---- Sidebar / Tab navigation ---- */}
            <aside className="lg:w-60 shrink-0">
              {/* Desktop sidebar */}
              <nav className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium
                                  transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'bg-orange-50/50'
                          : 'hover:bg-gray-50'
                        }`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: isActive ? '#C75B39' : '#6B6B6B',
                        borderLeft: isActive ? '3px solid #C75B39' : '3px solid transparent',
                      }}
                    >
                      <tab.icon size={17} />
                      {tab.label}
                    </button>
                  );
                })}

                {/* Logout */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium
                               text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <FiLogOut size={17} />
                    Log Out
                  </button>
                </div>
              </nav>

              {/* Mobile tab bar */}
              <div className="lg:hidden flex gap-1 bg-white rounded-xl border border-gray-100 p-1 overflow-x-auto">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium
                                  whitespace-nowrap transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        ...(isActive
                          ? {
                              background: '#C75B39',
                              boxShadow: '0 2px 8px rgba(199,91,57,0.25)',
                            }
                          : {}),
                      }}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* ---- Tab content ---- */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {activeTab === 'dashboard' && <UserProfile />}
                  {activeTab === 'orders' && <OrderHistory />}
                  {activeTab === 'custom-orders' && <CustomOrderTracker />}
                  {activeTab === 'settings' && <ProfileSettings />}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Mobile logout button */}
          <div className="lg:hidden mt-8 text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                         text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiLogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
