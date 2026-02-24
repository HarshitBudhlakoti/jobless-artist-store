import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import { FaInstagram, FaPinterestP, FaFacebookF, FaTwitter } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { slideInLeft, menuItemVariants } from '../../utils/animations';

const socialLinks = [
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaPinterestP, href: '#', label: 'Pinterest' },
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
];

export default function MobileMenu({ isOpen, onClose, navLinks }) {
  const { isAuthenticated, user } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-cream shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <Link to="/" onClick={onClose}>
                <h2 className="font-display text-xl font-bold text-text-primary">
                  Jobless <span className="text-accent">Artist</span>
                </h2>
              </Link>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                aria-label="Close menu"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>

            {/* User greeting */}
            {isAuthenticated && user && (
              <div className="border-b border-gray-200 px-6 py-4">
                <p className="font-body text-sm text-text-secondary">Welcome back,</p>
                <p className="font-display text-lg font-semibold text-text-primary">
                  {user.name}
                </p>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.to}
                    custom={i}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <NavLink
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-3 font-body text-base font-medium transition-all ${
                          isActive
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-primary hover:bg-gray-100 hover:text-accent'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}

                {/* Auth links */}
                <div className="my-4 border-t border-gray-200" />

                {isAuthenticated ? (
                  <>
                    <motion.li
                      custom={navLinks.length}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <NavLink
                        to="/profile"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block rounded-lg px-4 py-3 font-body text-base font-medium transition-all ${
                            isActive
                              ? 'bg-accent/10 text-accent'
                              : 'text-text-primary hover:bg-gray-100 hover:text-accent'
                          }`
                        }
                      >
                        My Profile
                      </NavLink>
                    </motion.li>
                    <motion.li
                      custom={navLinks.length + 1}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <NavLink
                        to="/cart"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block rounded-lg px-4 py-3 font-body text-base font-medium transition-all ${
                            isActive
                              ? 'bg-accent/10 text-accent'
                              : 'text-text-primary hover:bg-gray-100 hover:text-accent'
                          }`
                        }
                      >
                        My Cart
                      </NavLink>
                    </motion.li>
                  </>
                ) : (
                  <motion.li
                    custom={navLinks.length}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="block rounded-lg bg-accent px-4 py-3 text-center font-body text-base font-semibold text-white transition-colors hover:bg-accent/90"
                    >
                      Login / Register
                    </Link>
                  </motion.li>
                )}
              </ul>
            </nav>

            {/* Social Links */}
            <div className="border-t border-gray-200 px-6 py-5">
              <p className="mb-3 font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
                Follow Us
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-text-secondary transition-all hover:bg-accent hover:text-white"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
