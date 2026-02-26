import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaInstagram,
  FaPinterestP,
  FaFacebookF,
  FaTwitter,
} from 'react-icons/fa';
import {
  HiOutlineMail,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { useSiteSettings } from '../../hooks/useSiteContent';

const quickLinks = [
  { to: '/shop', label: 'Shop All' },
  { to: '/custom-order', label: 'Custom Orders' },
  { to: '/about', label: 'About the Artist' },
  { to: '/contact', label: 'Contact' },
];

const customerCare = [
  { to: '/shipping-policy', label: 'Shipping Policy' },
  { to: '/refund-policy', label: 'Refunds & Cancellation' },
  { to: '/terms-and-conditions', label: 'Terms & Conditions' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/contact', label: 'Contact Us' },
];

const SOCIAL_ICON_MAP = {
  instagram: FaInstagram,
  pinterest: FaPinterestP,
  facebook: FaFacebookF,
  twitter: FaTwitter,
};

const DEFAULT_SOCIAL = [
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaPinterestP, href: '#', label: 'Pinterest' },
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const { data: settings } = useSiteSettings();
  const [email, setEmail] = useState('');

  // Build social links from settings
  const socialLinks = settings?.socialLinks
    ? Object.entries(settings.socialLinks)
        .filter(([, url]) => url)
        .map(([key, url]) => ({
          icon: SOCIAL_ICON_MAP[key] || FaInstagram,
          href: url,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        }))
    : DEFAULT_SOCIAL;
  if (socialLinks.length === 0) {
    // show defaults if no links configured
    socialLinks.push(...DEFAULT_SOCIAL);
  }

  const brandDesc = settings?.footer?.brandDescription ||
    'Handcrafted art that tells a story. Each piece is created with passion, precision, and a deep love for artistic expression. Bringing unique, soulful art into your world.';
  const copyrightText = settings?.footer?.copyrightText || 'Jobless Artist. All rights reserved.';
  const paymentMethods = settings?.footer?.paymentMethods || ['Visa', 'Mastercard', 'UPI', 'Cashfree'];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="bg-primary text-cream/90">
      {/* Main footer content */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <motion.div variants={staggerItem}>
            <Link to="/">
              <h3 className="font-display text-2xl font-bold text-white">
                Jobless <span className="text-accent">Artist</span>
              </h3>
            </Link>
            <p className="mt-4 font-body text-sm leading-relaxed text-cream/70">
              {brandDesc}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/60 transition-all hover:border-accent hover:bg-accent hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={staggerItem}>
            <h4 className="font-display text-lg font-semibold text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-body text-sm text-cream/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Customer Care */}
          <motion.div variants={staggerItem}>
            <h4 className="font-display text-lg font-semibold text-white">
              Customer Care
            </h4>
            <ul className="mt-4 space-y-3">
              {customerCare.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-body text-sm text-cream/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Newsletter */}
          <motion.div variants={staggerItem}>
            <h4 className="font-display text-lg font-semibold text-white">
              Stay Inspired
            </h4>
            <p className="mt-4 font-body text-sm text-cream/70">
              Subscribe for new arrivals, exclusive offers, and behind-the-scenes peeks
              into the creative process.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-5">
              <div className="flex overflow-hidden rounded-lg border border-cream/20 focus-within:border-accent">
                <div className="flex items-center pl-3 text-cream/40">
                  <HiOutlineMail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 border-0 bg-transparent px-3 py-2.5 font-body text-sm text-cream placeholder-cream/40 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center bg-accent px-4 text-white transition-colors hover:bg-accent/80"
                  aria-label="Subscribe"
                >
                  <HiOutlineArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-body text-xs text-cream/50">
            &copy; {new Date().getFullYear()} {copyrightText}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 font-body text-xs text-cream/40">
              {paymentMethods.map((method) => (
                <span key={method} className="rounded border border-cream/20 px-2 py-1">{method}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
