import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTruck, FiPackage, FiGlobe, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';

const sections = [
  {
    icon: FiTruck,
    title: 'Shipping Charges',
    content: [
      'Free shipping on all orders above \u20B93,000.',
      'A flat shipping charge of \u20B975 applies to orders below \u20B93,000.',
      'International shipping charges may vary based on destination and will be calculated at checkout.',
    ],
  },
  {
    icon: FiClock,
    title: 'Dispatch & Handling Time',
    content: [
      'All orders are processed and dispatched within 2\u20133 business days after the order is confirmed.',
      'Custom and made-to-order items may require additional handling time, which will be communicated at the time of order.',
    ],
  },
  {
    icon: FiMapPin,
    title: 'Domestic Delivery (India)',
    content: [
      'Estimated delivery time: 5\u20137 business days from the date of dispatch.',
      'We deliver to all serviceable pin codes across India.',
      'Delivery timelines may vary for remote or hard-to-reach locations.',
    ],
  },
  {
    icon: FiGlobe,
    title: 'International Delivery',
    content: [
      'Estimated delivery time: 15\u201321 business days from the date of dispatch.',
      'International orders may be subject to customs duties or import taxes, which are the responsibility of the buyer.',
      'We are not responsible for delays caused by customs clearance processes.',
    ],
  },
  {
    icon: FiPackage,
    title: 'Packaging & Care',
    content: [
      'Every artwork is carefully packaged using protective materials to ensure it arrives in perfect condition.',
      'Paintings are wrapped in bubble wrap and placed in sturdy corrugated boxes.',
      'Fragile items are marked clearly on the packaging for safe handling during transit.',
    ],
  },
  {
    icon: FiDollarSign,
    title: 'Order Tracking',
    content: [
      'Once your order is dispatched, you will receive a tracking number via email or SMS.',
      'You can use this tracking number to monitor the status of your delivery.',
      'For any delivery-related queries, please contact us at joblessartist99@gmail.com or call +91 82185 85651.',
    ],
  },
];

const ShippingPolicy = () => {
  return (
    <AnimatedPage>
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
              Delivery Information
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Shipping Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              We deliver handcrafted art across India and internationally with utmost care.
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
              Have questions about shipping?
            </p>
            <p
              className="text-sm mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              Feel free to reach out to us and we will be happy to help.
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

export default ShippingPolicy;
