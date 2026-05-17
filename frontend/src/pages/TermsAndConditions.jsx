import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import { usePageContent, useSiteSettings } from '../hooks/useSiteContent';

const DEFAULT_LAST_UPDATED = '17-05-2026 14:52:02';

const DEFAULT_SECTIONS = [
  {
    title: '1. Agreement',
    content:
      'These Terms and Conditions, along with privacy policy or other terms (\u201CTerms\u201D) constitute a binding agreement by and between CHETNA PALARIYA, ( \u201CWebsite Owner\u201D or \u201Cwe\u201D or \u201Cus\u201D or \u201Cour\u201D) and you (\u201Cyou\u201D or \u201Cyour\u201D) and relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, \u201CServices\u201D).\n\nBy using our website and availing the Services, you agree that you have read and accepted these Terms (including the Privacy Policy). We reserve the right to modify these Terms at any time and without assigning any reason. It is your responsibility to periodically review these Terms to stay informed of updates.',
  },
  {
    title: '2. Terms of Use',
    content:
      'The use of this website or availing of our Services is subject to the following terms of use:\n\n\u2022 To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account.\n\n\u2022 Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.\n\n\u2022 Your use of our Services and the website is solely at your own risk and discretion. You are required to independently assess and ensure that the Services meet your requirements.\n\n\u2022 The contents of the Website and the Services are proprietary to Us and you will not have any authority to claim any intellectual property rights, title, or interest in its contents.\n\n\u2022 You acknowledge that unauthorized use of the Website or the Services may lead to action against you as per these Terms or applicable laws.\n\n\u2022 You agree to pay us the charges associated with availing the Services.\n\n\u2022 You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.\n\n\u2022 You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites.\n\n\u2022 You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the us for the Services.\n\n\u2022 You shall be entitled to claim a refund of the payment made by you in case we are not able to provide the Service. The timelines for such return and refund will be according to the specific Service you have availed or within the time period provided in our policies (as applicable). In case you do not raise a refund claim within the stipulated time, than this would make you ineligible for a refund.\n\n\u2022 Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event.\n\n\u2022 These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India.\n\n\u2022 All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Haldwani, Uttarakhand.\n\n\u2022 All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.',
  },
];

const DEFAULT_TC = {
  pageTitle: 'Terms & Conditions',
  lastUpdated: DEFAULT_LAST_UPDATED,
  sections: DEFAULT_SECTIONS,
};

const TermsAndConditions = () => {
  const { content } = usePageContent('termsAndConditions', DEFAULT_TC);
  const { data: settings } = useSiteSettings();
  const contactEmail = settings?.contact?.email || 'joblessartist99@gmail.com';
  const contactPhone = settings?.contact?.phone || '+91 82185 85651';
  const contactAddress = settings?.contact?.address || 'Jaipur Padli Phase 2, Near primary school Issainagar, Lamachaur, Haldwani, Haldwani, Uttarakhand, PIN: 263139';
  const businessOwner = settings?.contact?.businessOwner || 'Chetna Palariya';
  const sections = (content?.sections || DEFAULT_TC.sections).map((s) => ({
    ...s,
    content: s.content
      .replace(/joblessartist99@gmail\.com/g, contactEmail)
      .replace(/\+91 82185 85651/g, contactPhone)
      .replace(/Jaipur Padli Phase 2, Near primary school Issainagar, Lamachaur, Haldwani, Haldwani, Uttarakhand, PIN: 263139/g, contactAddress)
      .replace(/Chetna Palariya/g, businessOwner),
  }));
  const lastUpdated = content?.lastUpdated || DEFAULT_TC.lastUpdated;

  return (
    <AnimatedPage>
      <SEO title="Terms & Conditions" description="Read the terms and conditions for using the Jobless Artist website and purchasing handcrafted art." path="/terms-and-conditions" />
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
