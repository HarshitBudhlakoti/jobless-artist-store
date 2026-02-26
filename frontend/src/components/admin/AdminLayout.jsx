import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiPackage,
  FiLayers,
  FiShoppingBag,
  FiPenTool,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiChevronDown,
  FiSettings,
  FiFileText,
  FiMessageSquare,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { to: '/control-panel', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/control-panel/products', icon: FiPackage, label: 'Products' },
  { to: '/control-panel/categories', icon: FiLayers, label: 'Categories' },
  { to: '/control-panel/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/control-panel/custom-orders', icon: FiPenTool, label: 'Custom Orders' },
  { to: '/control-panel/users', icon: FiUsers, label: 'Users' },
  { to: '/control-panel/site-settings', icon: FiSettings, label: 'Site Settings' },
  { to: '/control-panel/content', icon: FiFileText, label: 'Page Content' },
  { to: '/control-panel/testimonials', icon: FiMessageSquare, label: 'Testimonials' },
];

function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const crumbs = pathSegments.map((seg, i) => {
    const label = seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, path: '/' + pathSegments.slice(0, i + 1).join('/') };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm font-['DM_Sans']">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[#6B6B6B]">/</span>}
          <span
            className={
              i === crumbs.length - 1
                ? 'text-[#1A1A1A] font-medium'
                : 'text-[#6B6B6B]'
            }
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/control-panel/login');
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C75B39] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-['DM_Sans']">JA</span>
            </div>
            <span className="text-white font-semibold text-lg font-['DM_Sans']">
              JA Admin
            </span>
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-lg bg-[#C75B39] flex items-center justify-center">
            <span className="text-white font-bold text-sm font-['DM_Sans']">JA</span>
          </div>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-['DM_Sans'] ${
                isActive
                  ? 'bg-[#C75B39] text-white shadow-lg shadow-[#C75B39]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              } ${collapsed && !isMobile ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 w-full font-['DM_Sans'] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? (
              <FiChevronRight className="w-5 h-5" />
            ) : (
              <>
                <FiChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        )}

        {/* View Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 font-['DM_Sans'] ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <FiExternalLink className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-medium">View Site</span>
          )}
        </a>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 w-full font-['DM_Sans'] ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAF7F2] font-['DM_Sans']">
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-[#1A1A1A] fixed left-0 top-0 h-full z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 w-[280px] h-full bg-[#1A1A1A] z-50 lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-16 flex items-center px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C75B39] rounded-full" />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#C75B39]/10 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[#C75B39]">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#1A1A1A] leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-[#6B6B6B] leading-tight">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
