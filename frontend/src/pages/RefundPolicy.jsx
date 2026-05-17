import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiXCircle, FiRotateCcw, FiAlertCircle, FiCheckCircle, FiPackage, FiMail } from 'react-icons/fi';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import { usePageContent, useSiteSettings } from '../hooks/useSiteContent';

const REFUND_ICONS = [FiXCircle, FiRotateCcw, FiAlertCircle, FiPackage, FiCheckCircle, FiMail];

const DEFAULT_SECTIONS = [
  {
    icon: FiXCircle,
    title: 'Cancellation Policy',
    content: [
      'Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.',
      'CHETNA PALARIYA does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.',
    ],
  },
  {
    icon: FiAlertCircle,
    title: 'Damaged or Defective Items',
    content: [
      'In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 7 Days days of receipt of the products.',
      'In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 7 Days days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.',
    ],
  },
  {
    icon: FiCheckCircle,
    title: 'Refund Processing',
    content: [
      'In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.',
      'In case of any Refunds approved by the CHETNA PALARIYA, it\u2019ll take 9-15 Days days for the refund to be processed to the end customer.',
    ],
  },
];

const DEFAULT_POLICY = {
  pageTitle: 'Cancellation & Refund Policy',
  lastUpdated: '17-05-2026 14:52:02',
  sections: DEFAULT_SECTIONS.map(({ title, content }) => ({ title, content })),
};

const RefundPolicy = () => {
  const { content } = usePageContent('refundPolicy', DEFAULT_POLICY);
  const { data: settings } = useSiteSettings();
  const contactEmail = settings?.contact?.email || 'joblessartist99@gmail.com';
  const contactPhone = settings?.contact?.phone || '+91 82185 85651';
  const contactAddress = settings?.contact?.address || 'Jaipur Padli Phase 2, Near primary school Issainagar, Lamachaur, Haldwani, Haldwani, Uttarakhand, PIN: 263139';
  const sections = (content?.sections || DEFAULT_POLICY.sections).map((s, i) => ({
    ...s,
    icon: REFUND_ICONS[i] || FiXCircle,
    content: s.content.map((item) =>
      item
        .replace('joblessartist99@gmail.com', contactEmail)
        .replace('+91 82185 85651', contactPhone)
        .replace('Jaipur Padli Phase 2, Near primary school Issainagar, Lamachaur, Haldwani, Haldwani, Uttarakhand, PIN: 263139', contactAddress)
    ),
  }));

  return (
    <AnimatedPage>
      <SEO title="Cancellation & Refund Policy" description="Understand our cancellation, return, and refund policies for handcrafted art purchases." path="/refund-policy" />
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
              {content?.pageTitle || 'Cancellation & Refund Policy'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-sm max-w-xl mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
            >
              Last updated: {content?.lastUpdated || '17-05-2026 14:52:02'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mx-auto leading-relaxed mt-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              CHETNA PALARIYA believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
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
