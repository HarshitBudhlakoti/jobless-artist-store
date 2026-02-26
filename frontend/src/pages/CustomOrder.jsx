import { motion } from 'framer-motion';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import CustomOrderForm from '../components/custom-order/CustomOrderForm';

const CustomOrder = () => {
  return (
    <AnimatedPage>
      <SEO title="Custom Order" description="Commission a custom handcrafted painting tailored to your vision. Share your idea and let Jobless Artist bring it to life." path="/custom-order" />
      <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden py-16 sm:py-20">
          {/* Decorative background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(199,91,57,0.06) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 80% 50%, rgba(212,168,87,0.05) 0%, transparent 50%)',
            }}
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-sm uppercase tracking-[0.2em] mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
              >
                Custom Commission
              </p>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
              >
                Commission Your Art
              </h1>
              <p
                className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Tell us your vision and we will bring it to life on canvas.
                Every piece is uniquely crafted just for you.
              </p>
            </motion.div>

            {/* Decorative brush stroke */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 h-0.5 w-24 rounded-full origin-left"
              style={{ background: 'linear-gradient(90deg, #C75B39, #D4A857)' }}
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10"
          >
            <CustomOrderForm />
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CustomOrder;
