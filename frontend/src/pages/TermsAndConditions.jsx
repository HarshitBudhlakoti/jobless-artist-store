import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/common/AnimatedPage';
import { usePageContent } from '../hooks/useSiteContent';

const DEFAULT_LAST_UPDATED = '25 February 2026';

const DEFAULT_SECTIONS = [
  {
    title: '1. Introduction',
    content:
      'Welcome to Jobless Artist (www.joblessartist.in). These Terms and Conditions govern your use of our website and the purchase of products from us. By accessing or using our website, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our website.',
  },
  {
    title: '2. Business Information',
    content:
      'Jobless Artist is a sole proprietorship operated by Chetna Palariya, located at Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139, India. For any queries, you can reach us at joblessartist99@gmail.com or +91 82185 85651.',
  },
  {
    title: '3. Products & Services',
    content:
      'Jobless Artist sells handcrafted artworks including paintings, custom commissions, and art-related products. All product images on the website are representative. Due to the handmade nature of our products, slight variations in colour, texture, and finish may occur. These variations are not considered defects and are part of the unique charm of handcrafted art.',
  },
  {
    title: '4. Pricing & Payment',
    content:
      'All prices listed on the website are in Indian Rupees (\u20B9) and are inclusive of applicable taxes unless otherwise stated. We reserve the right to change prices at any time without prior notice. Payments are processed securely through Cashfree payment gateway, which supports UPI, credit/debit cards, net banking, and wallets. For custom orders, a 50% advance payment is required at the time of order, with the remaining 50% due upon completion before dispatch.',
  },
  {
    title: '5. Orders & Confirmation',
    content:
      'When you place an order, you will receive an order confirmation via email. This confirmation does not guarantee acceptance of your order. We reserve the right to refuse or cancel any order for reasons including but not limited to: product unavailability, errors in pricing or product information, or suspected fraudulent activity.',
  },
  {
    title: '6. Shipping & Delivery',
    content:
      'We ship across India and internationally. Domestic delivery within India typically takes 5\u20137 business days. International delivery takes 15\u201321 business days. Shipping is free on orders above \u20B93,000. A flat \u20B975 shipping charge applies to orders below \u20B93,000. For full details, please refer to our Shipping Policy page.',
  },
  {
    title: '7. Cancellation, Returns & Refunds',
    content:
      'Orders can be cancelled anytime before dispatch. Returns are accepted within 7 days of delivery only if the product has physical damage. Refunds are processed after the returned product is received and inspected. The resolution (refund, replacement, or store credit) will be discussed with the customer. For full details, please refer to our Refunds & Cancellation Policy page.',
  },
  {
    title: '8. Intellectual Property',
    content:
      'All content on this website, including but not limited to images, artwork, text, graphics, logos, and designs, is the intellectual property of Jobless Artist and is protected under applicable copyright and intellectual property laws. You may not reproduce, distribute, modify, or use any content from this website without prior written permission from us. Purchasing an artwork grants you ownership of the physical piece but does not transfer copyright or reproduction rights.',
  },
  {
    title: '9. User Accounts',
    content:
      'When you create an account on our website, you are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must provide accurate and complete information during registration. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.',
  },
  {
    title: '10. Limitation of Liability',
    content:
      'Jobless Artist shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the website or purchase of products. Our total liability for any claim shall not exceed the amount paid by you for the specific product in question. We are not responsible for delays or failures in delivery caused by third-party logistics providers, natural disasters, or other circumstances beyond our control.',
  },
  {
    title: '11. Privacy',
    content:
      'We respect your privacy and handle your personal information with care. Any personal data collected through the website (name, email, address, phone number, payment details) is used solely for processing orders, communicating with you, and improving our services. We do not sell or share your personal information with third parties except as necessary for order fulfilment (e.g., shipping partners, payment gateway). For full details, please refer to our Privacy Policy page.',
  },
  {
    title: '12. Governing Law',
    content:
      'These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Haldwani, Nainital, Uttarakhand, India.',
  },
  {
    title: '13. Changes to Terms',
    content:
      'We reserve the right to update or modify these Terms and Conditions at any time without prior notice. The updated terms will be posted on this page with the revised date. Your continued use of the website after any changes constitutes acceptance of the modified terms.',
  },
  {
    title: '14. Contact Us',
    content:
      'If you have any questions or concerns about these Terms and Conditions, please contact us:\n\nJobless Artist\nProprietor: Chetna Palariya\nAddress: Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139\nEmail: joblessartist99@gmail.com\nPhone: +91 82185 85651\nWebsite: www.joblessartist.in',
  },
];

const DEFAULT_TC = {
  pageTitle: 'Terms & Conditions',
  lastUpdated: DEFAULT_LAST_UPDATED,
  sections: DEFAULT_SECTIONS,
};

const TermsAndConditions = () => {
  const { content } = usePageContent('termsAndConditions', DEFAULT_TC);
  const sections = content?.sections || DEFAULT_TC.sections;
  const lastUpdated = content?.lastUpdated || DEFAULT_TC.lastUpdated;

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
              Legal
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              {content?.pageTitle || 'Terms & Conditions'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm max-w-xl mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
            >
              Last updated: {lastUpdated}
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className="p-6 sm:p-8 md:p-10 rounded-2xl"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
            }}
          >
            <div className="space-y-8">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                >
                  <h2
                    className="text-lg md:text-xl font-bold mb-3"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                  >
                    {section.title}
                  </h2>
                  <div
                    className="text-sm md:text-base leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
                  >
                    {section.content}
                  </div>
                  {i < sections.length - 1 && (
                    <div className="mt-8 h-px" style={{ background: 'rgba(44,44,44,0.06)' }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/shipping-policy"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#FFFFFF',
                color: '#2C2C2C',
                boxShadow: '0 2px 12px rgba(44,44,44,0.08)',
              }}
            >
              Shipping Policy
            </Link>
            <Link
              to="/refund-policy"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#FFFFFF',
                color: '#2C2C2C',
                boxShadow: '0 2px 12px rgba(44,44,44,0.08)',
              }}
            >
              Refund & Cancellation Policy
            </Link>
            <Link
              to="/privacy-policy"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#FFFFFF',
                color: '#2C2C2C',
                boxShadow: '0 2px 12px rgba(44,44,44,0.08)',
              }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
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

export default TermsAndConditions;
