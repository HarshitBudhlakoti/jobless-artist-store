import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiXCircle, FiRotateCcw, FiAlertCircle, FiCheckCircle, FiPackage, FiMail } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';

const sections = [
  {
    icon: FiXCircle,
    title: 'Cancellation Policy',
    content: [
      'Orders can be cancelled anytime before they are dispatched.',
      'To cancel an order, please contact us immediately at joblessartist99@gmail.com or call +91 82185 85651.',
      'Once the order has been dispatched, it cannot be cancelled. You may request a return instead (subject to our return policy below).',
      'If the cancellation is approved, the refund will be processed to your original payment method.',
    ],
  },
  {
    icon: FiRotateCcw,
    title: 'Return Policy',
    content: [
      'We accept returns within 7 days from the date of delivery.',
      'Returns are only accepted if the item has arrived with physical damage (e.g., broken frame, torn canvas, damaged artwork).',
      'This return policy applies equally to all products, including custom and made-to-order items.',
      'Items must be returned in their original packaging to be eligible for a return.',
    ],
  },
  {
    icon: FiAlertCircle,
    title: 'Conditions for Return',
    content: [
      'The product must have physical damage that occurred during transit.',
      'You must provide photographs of the damaged product as proof at the time of raising a return request.',
      'The return request must be raised within 7 days of receiving the product.',
      'Products that have been used, altered, or damaged by the customer after delivery are not eligible for return.',
    ],
  },
  {
    icon: FiPackage,
    title: 'Return Process',
    content: [
      'Contact us at joblessartist99@gmail.com or call +91 82185 85651 with your order details and photos of the damage.',
      'Our team will review your request and confirm eligibility within 2\u20133 business days.',
      'If approved, we will arrange for the return pickup or provide instructions for shipping the product back to us.',
      'Please ensure the item is packed securely to avoid further damage during the return transit.',
    ],
  },
  {
    icon: FiCheckCircle,
    title: 'Refund Policy',
    content: [
      'Refunds are initiated only after the returned product has been received and inspected by our team.',
      'Once the product is received, we will personally discuss the resolution with you \u2014 whether it is a full refund, replacement, or store credit.',
      'The refund method and timeline will be decided mutually during this discussion.',
      'For cancelled orders (before dispatch), refunds will be processed to the original payment method within 5\u20137 business days.',
    ],
  },
  {
    icon: FiMail,
    title: 'Contact for Returns & Refunds',
    content: [
      'Email: joblessartist99@gmail.com',
      'Phone: +91 82185 85651',
      'Address: Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139',
      'We aim to respond to all return and refund queries within 24 hours.',
    ],
  },
];

const RefundPolicy = () => {
  return (
    <AnimatedPage>
      <SEO title="Refund & Cancellation Policy" description="Understand our cancellation, return, and refund policies for handcrafted art purchases." path="/refund-policy" />
      <div style={{ background: '#FAF7F2' }}>
        {/* Hero */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 30% 40%, rgba(199,91,57,0.05) 0%, transparent 60%), ' +
                'radial-gradient(ellipse at 70% 60%, rgba(212,168,87,0.04) 0%, transparent 50%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
            >
              Our Policies
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Refunds & Cancellation Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              Your satisfaction matters to us. Here is everything you need to know about returns, refunds, and cancellations.
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="p-6 sm:p-8 rounded-2xl"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(199,91,57,0.08)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#C75B39' }} />
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {section.content.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
                      >
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#C75B39' }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 p-6 sm:p-8 rounded-2xl text-center"
            style={{
              background: 'rgba(199,91,57,0.05)',
              border: '1px solid rgba(199,91,57,0.1)',
            }}
          >
            <p
              className="text-base md:text-lg font-medium mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Need help with a return or refund?
            </p>
            <p
              className="text-sm mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              Our team is here to assist you. Reach out and we will resolve it together.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#C75B39',
              }}
            >
              Contact Us
            </Link>
          </motion.div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default RefundPolicy;
