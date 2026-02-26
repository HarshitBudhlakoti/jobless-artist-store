import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import { HiOutlineUser } from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import MobileMenu from './MobileMenu';
import CartDrawer from '../cart/CartDrawer';
import { navbarVariants } from '../../utils/animations';
import { getInitials } from '../../utils/helpers';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/custom-order', label: 'Custom Order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.header
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-md'
            : 'bg-cream/80 backdrop-blur-sm'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
                Jobless{' '}
                <span className="text-accent">Artist</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative font-body text-sm font-medium tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-accent'
                        : 'text-text-primary hover:text-accent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-full p-2 text-text-primary transition-colors hover:bg-accent/10 hover:text-accent"
                aria-label="Search"
              >
                <HiOutlineSearch className="h-5 w-5" />
              </button>

              {/* Cart */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative rounded-full p-2 text-text-primary transition-colors hover:bg-accent/10 hover:text-accent"
                aria-label="Cart"
              >
                <HiOutlineShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* User / Login */}
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent/10"
                  aria-label="Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-sm font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md sm:flex"
                >
                  <HiOutlineUser className="h-4 w-4" />
                  Login
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-full p-2 text-text-primary transition-colors hover:bg-accent/10 lg:hidden"
                aria-label="Open menu"
              >
                <HiOutlineMenu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search Bar - expandable */}
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-200 pb-4"
            >
              <form onSubmit={handleSearchSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks, styles, mediums..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-body text-sm text-text-primary placeholder-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-6 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
