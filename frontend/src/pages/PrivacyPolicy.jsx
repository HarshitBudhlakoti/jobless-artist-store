import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiDatabase, FiShare2, FiLock, FiEye, FiUser, FiSettings, FiMail } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import { usePageContent } from '../hooks/useSiteContent';

const PRIVACY_ICONS = [FiDatabase, FiEye, FiShare2, FiLock, FiShield, FiUser, FiSettings, FiMail];

const DEFAULT_LAST_UPDATED = '25 February 2026';

const DEFAULT_SECTIONS = [
  {
    icon: FiDatabase,
    title: 'Information We Collect',
    content: [
      'Personal details you provide during registration or checkout: name, email address, phone number, and shipping address.',
      'Payment information processed securely through our payment gateway (we do not store your card details on our servers).',
      'Order history and preferences to improve your shopping experience.',
      'Device and browser information, IP address, and browsing activity on our website collected automatically through cookies and similar technologies.',
    ],
  },
  {
    icon: FiEye,
    title: 'How We Use Your Information',
    content: [
      'To process and fulfil your orders, including shipping and delivery.',
      'To communicate with you about your orders, custom requests, and customer support inquiries.',
      'To send promotional emails and updates about new artworks and offers (you can opt out at any time).',
      'To improve our website, products, and services based on your feedback and usage patterns.',
      'To prevent fraud and ensure the security of our platform.',
    ],
  },
  {
    icon: FiShare2,
    title: 'Information Sharing',
    content: [
      'We do not sell, trade, or rent your personal information to third parties.',
      'We share your information only with trusted service providers necessary for order fulfilment: shipping partners (for delivery), payment gateway (for transaction processing), and cloud services (for website hosting).',
      'We may disclose your information if required by law, court order, or government regulation.',
    ],
  },
  {
    icon: FiLock,
    title: 'Data Security',
    content: [
      'We implement industry-standard security measures including SSL encryption to protect your personal information.',
      'Access to personal data is restricted to authorised personnel only.',
      'While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.',
    ],
  },
  {
    icon: FiShield,
    title: 'Cookies & Tracking',
    content: [
      'We use cookies to enhance your browsing experience, remember your preferences, and analyse website traffic.',
      'Essential cookies are required for the website to function properly (login sessions, cart items).',
      'You can control cookie preferences through your browser settings. Disabling cookies may affect some website functionality.',
    ],
  },
  {
    icon: FiUser,
    title: 'Your Rights',
    content: [
      'You can access, update, or delete your personal information by logging into your account or contacting us.',
      'You can unsubscribe from marketing emails at any time using the unsubscribe link in our emails.',
      'You can request a copy of the personal data we hold about you.',
      'You can request deletion of your account and associated data by contacting us at joblessartist99@gmail.com.',
    ],
  },
  {
    icon: FiSettings,
    title: 'Third-Party Services',
    content: [
      'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.',
      'We use Cloudinary for image hosting, Google for authentication services, and secure payment gateways for transaction processing.',
      'We recommend reviewing the privacy policies of any third-party services you interact with through our website.',
    ],
  },
  {
    icon: FiMail,
    title: 'Contact Us',
    content: [
      'If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us:',
      'Email: joblessartist99@gmail.com',
      'Phone: +91 82185 85651',
      'Address: Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139',
    ],
  },
];

const DEFAULT_PRIVACY = {
  pageTitle: 'Privacy Policy',
  lastUpdated: DEFAULT_LAST_UPDATED,
  sections: DEFAULT_SECTIONS.map(({ title, content }) => ({ title, content })),
};

const PrivacyPolicy = () => {
  const { content } = usePageContent('privacyPolicy', DEFAULT_PRIVACY);
  const sections = (content?.sections || DEFAULT_PRIVACY.sections).map((s, i) => ({
    ...s,
    icon: PRIVACY_ICONS[i] || FiShield,
  }));
  const lastUpdated = content?.lastUpdated || DEFAULT_PRIVACY.lastUpdated;

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
              Your Privacy Matters
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              {content?.pageTitle || 'Privacy Policy'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              We respect your privacy and are committed to protecting the personal information you share with us.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
            >
              Last updated: {lastUpdated}
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
            transition={{ duration: 0.5, delay: 0.8 }}
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
              Have questions about your privacy?
            </p>
            <p
              className="text-sm mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              We are happy to address any concerns you may have about your personal data.
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

export default PrivacyPolicy;
