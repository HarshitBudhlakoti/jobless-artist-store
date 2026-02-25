import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiChevronDown,
  FiInstagram,
  FiTwitter,
  FiYoutube,
} from 'react-icons/fi';
import { FaPinterestP } from 'react-icons/fa';
import api from '../api/axios';
import AnimatedPage from '../components/common/AnimatedPage';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Decorative SVG elements                                           */
/* ------------------------------------------------------------------ */
const BrushStrokeUnderline = () => (
  <svg viewBox="0 0 240 14" fill="none" className="w-40 md:w-56 h-auto mt-2">
    <path
      d="M4 9C4 9 40 3 80 6C120 9 160 3 200 7C220 8 236 5 236 5"
      stroke="#C75B39"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const PaintSplatter = ({ className = '', color = '#C75B39', opacity = 0.1 }) => (
  <svg viewBox="0 0 50 50" fill="none" className={`absolute pointer-events-none ${className}`}>
    <circle cx="25" cy="25" r="16" fill={color} opacity={opacity} />
    <circle cx="14" cy="12" r="5" fill={color} opacity={opacity * 0.7} />
    <circle cx="40" cy="16" r="3" fill={color} opacity={opacity * 0.6} />
    <circle cx="36" cy="42" r="4" fill={color} opacity={opacity * 0.5} />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Custom Order Question',
  'Shipping Question',
  'Collaboration',
  'Other',
];

const contactDetails = [
  {
    icon: FiMail,
    label: 'Email',
    value: 'joblessartist99@gmail.com',
    href: 'mailto:joblessartist99@gmail.com',
  },
  {
    icon: FiPhone,
    label: 'Phone',
    value: '+91 82185 85651',
    href: 'tel:+918218585651',
  },
  {
    icon: FiMapPin,
    label: 'Studio',
    value: 'Issainagar Phase 2, Jaipur Padli, Lamachaur, Haldwani, Nainital 263139',
    href: null,
  },
  {
    icon: FiClock,
    label: 'Working Hours',
    value: 'Mon - Sat: 10:00 AM - 7:00 PM',
    href: null,
  },
];

const socialLinks = [
  { icon: FiInstagram, label: 'Instagram', href: '#' },
  { icon: FiTwitter, label: 'Twitter', href: '#' },
  { icon: FaPinterestP, label: 'Pinterest', href: '#' },
  { icon: FiYoutube, label: 'YouTube', href: '#' },
];

const faqData = [
  {
    question: 'How long does a custom painting take?',
    answer:
      'Custom paintings typically take 2-4 weeks depending on the size and complexity. Large or highly detailed commissions may take up to 6 weeks. We keep you updated throughout the process with progress photos and check-ins.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes! We ship across India and internationally. Domestic orders within India typically arrive in 5-7 business days. International shipping takes 15-21 business days depending on the destination. Shipping is free on orders above \u20B93,000. A flat \u20B975 shipping charge applies to orders below \u20B93,000. All shipments are carefully packaged to ensure your artwork arrives in perfect condition.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept UPI, all major credit and debit cards, net banking, and wallet payments through our secure Cashfree payment gateway. For custom orders, we offer a convenient 50% advance and 50% on completion payment plan.',
  },
  {
    question: 'Can I return a painting?',
    answer:
      'We offer a 7-day return policy from the date of delivery if the item arrives with physical damage. This applies to all orders including custom commissions. Once the returned product is received, we will discuss the refund or replacement with you directly. Orders can be cancelled anytime before dispatch.',
  },
  {
    question: 'How do I care for my painting?',
    answer:
      'Keep your painting away from direct sunlight and extreme humidity. Dust gently with a soft, dry cloth. Avoid using water or cleaning agents directly on the surface. For oil and acrylic paintings, we recommend a professional cleaning every few years. Each artwork comes with a care guide tailored to its specific medium.',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                */
/* ------------------------------------------------------------------ */
const FAQItem = ({ item, isOpen, onToggle }) => (
  <div
    className="border-b"
    style={{ borderColor: 'rgba(44,44,44,0.08)' }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
    >
      <span
        className="text-base md:text-lg font-semibold pr-4 transition-colors duration-200"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: isOpen ? '#C75B39' : '#2C2C2C',
        }}
      >
        {item.question}
      </span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0"
      >
        <FiChevronDown
          className="w-5 h-5 transition-colors duration-200"
          style={{ color: isOpen ? '#C75B39' : '#5A5A5A' }}
        />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <p
            className="pb-5 text-sm md:text-base leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
          >
            {item.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Form Input Wrapper                                                */
/* ------------------------------------------------------------------ */
const FormField = ({ icon: Icon, error, children }) => (
  <div className="relative">
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4" style={{ color: '#9CA3AF' }} />
        </div>
      )}
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs mt-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ================================================================== */
/*  CONTACT PAGE                                                      */
/* ================================================================== */
const Contact = () => {
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const faqRef = useRef(null);

  /* Form state */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  /* ── GSAP scroll animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (faqRef.current) {
        gsap.fromTo(
          faqRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: faqRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject.';
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      /* Auto-dismiss success message after 5 seconds */
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setErrors({ form: err.data?.message || err.message || 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    /* Clear field error on change */
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const inputBaseClass =
    'w-full rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2';

  return (
    <AnimatedPage>
      <div ref={pageRef} style={{ background: '#FAF7F2' }}>
        {/* ============================================================ */}
        {/*  HERO / PAGE TITLE                                           */}
        {/* ============================================================ */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 30% 40%, rgba(199,91,57,0.05) 0%, transparent 60%), ' +
                'radial-gradient(ellipse at 70% 60%, rgba(212,168,87,0.04) 0%, transparent 50%)',
            }}
          />
          <PaintSplatter className="w-16 h-16 top-10 right-16" />
          <PaintSplatter className="w-12 h-12 bottom-4 left-20" color="#D4A857" opacity={0.08} />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
            >
              Reach Out
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
            >
              Get in Touch
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <BrushStrokeUnderline />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-base md:text-lg max-w-xl mx-auto mt-6 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
            >
              Have a question, want to commission a painting, or just want to say hello?
              We would love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FORM + INFO SECTION                                         */}
        {/* ============================================================ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* ── Contact Form (left, 3 cols) ── */}
            <div ref={formRef} className="lg:col-span-3">
              <div
                className="p-6 sm:p-8 rounded-2xl"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
                }}
              >
                <h2
                  className="text-xl md:text-2xl font-bold mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Send Us a Message
                </h2>

                {/* Success toast */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6 p-4 rounded-xl"
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#166534' }}
                      >
                        Thank you! Your message has been sent successfully. We will get back to you within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Name */}
                  <FormField icon={FiUser} error={errors.name}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange('name')}
                      className={`${inputBaseClass} py-3.5 pl-11 pr-4`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        borderColor: errors.name ? '#C75B39' : 'rgba(44,44,44,0.12)',
                        color: '#2C2C2C',
                        '--tw-ring-color': '#C75B39',
                      }}
                    />
                  </FormField>

                  {/* Email */}
                  <FormField icon={FiMail} error={errors.email}>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      className={`${inputBaseClass} py-3.5 pl-11 pr-4`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        borderColor: errors.email ? '#C75B39' : 'rgba(44,44,44,0.12)',
                        color: '#2C2C2C',
                        '--tw-ring-color': '#C75B39',
                      }}
                    />
                  </FormField>

                  {/* Subject dropdown */}
                  <FormField icon={null} error={errors.subject}>
                    <select
                      value={formData.subject}
                      onChange={handleChange('subject')}
                      className={`${inputBaseClass} py-3.5 px-4 appearance-none cursor-pointer`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        borderColor: errors.subject ? '#C75B39' : 'rgba(44,44,44,0.12)',
                        color: formData.subject ? '#2C2C2C' : '#9CA3AF',
                        '--tw-ring-color': '#C75B39',
                      }}
                    >
                      <option value="" disabled>
                        Select a Subject
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <FiChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4"
                      style={{ color: '#9CA3AF' }}
                    />
                  </FormField>

                  {/* Message */}
                  <FormField icon={null} error={errors.message}>
                    <textarea
                      placeholder="Your Message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange('message')}
                      className={`${inputBaseClass} py-3.5 px-4 resize-none`}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        borderColor: errors.message ? '#C75B39' : 'rgba(44,44,44,0.12)',
                        color: '#2C2C2C',
                        '--tw-ring-color': '#C75B39',
                      }}
                    />
                  </FormField>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: '#C75B39',
                      boxShadow: '0 4px 14px rgba(199,91,57,0.3)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            fill="currentColor"
                            className="opacity-75"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <FiSend className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Contact Info (right, 2 cols) ── */}
            <div ref={infoRef} className="lg:col-span-2 space-y-8">
              {/* Contact details */}
              <div
                className="p-6 sm:p-8 rounded-2xl"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
                }}
              >
                <h2
                  className="text-xl md:text-2xl font-bold mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Contact Info
                </h2>
                <div className="space-y-5">
                  {contactDetails.map((item, i) => {
                    const Icon = item.icon;
                    const Wrapper = item.href ? 'a' : 'div';
                    const wrapperProps = item.href
                      ? { href: item.href, className: 'flex items-start gap-4 group' }
                      : { className: 'flex items-start gap-4' };
                    return (
                      <Wrapper key={i} {...wrapperProps}>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200 group-hover:bg-[#C75B39]/15"
                          style={{ background: 'rgba(199,91,57,0.08)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: '#C75B39' }} />
                        </div>
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-0.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                          >
                            {item.label}
                          </p>
                          <p
                            className="text-sm font-medium leading-snug"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            {item.value}
                          </p>
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-6 h-px" style={{ background: 'rgba(44,44,44,0.06)' }} />

                {/* Social links */}
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                  >
                    Follow Us
                  </p>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social, i) => {
                      const SIcon = social.icon;
                      return (
                        <a
                          key={i}
                          href={social.href}
                          aria-label={social.label}
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                          style={{
                            background: 'rgba(44,44,44,0.04)',
                            color: '#5A5A5A',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#C75B39';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(44,44,44,0.04)';
                            e.currentTarget.style.color = '#5A5A5A';
                          }}
                        >
                          <SIcon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #F5E6D3 0%, #E8D5BE 40%, #DDBF9C 70%, #D4A87A 100%)',
                  boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
                  aspectRatio: '4/3',
                }}
              >
                {/* Decorative map pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 400 300">
                    {/* Roads */}
                    <path d="M0 150 Q100 130 200 150 T400 140" stroke="#2C2C2C" strokeWidth="2" fill="none" />
                    <path d="M200 0 Q180 75 200 150 T220 300" stroke="#2C2C2C" strokeWidth="2" fill="none" />
                    <path d="M50 50 Q150 100 250 80 T380 120" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                    <path d="M100 250 Q200 200 300 230" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                    {/* Blocks */}
                    <rect x="120" y="100" width="60" height="40" rx="4" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                    <rect x="220" y="160" width="50" height="35" rx="4" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                    <rect x="80" y="180" width="40" height="50" rx="4" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                    <rect x="280" y="80" width="55" height="45" rx="4" stroke="#2C2C2C" strokeWidth="1" fill="none" />
                  </svg>
                </div>

                {/* Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="relative">
                    <svg width="40" height="52" viewBox="0 0 40 52" fill="none">
                      <path
                        d="M20 0C9 0 0 9 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 9 31 0 20 0Z"
                        fill="#C75B39"
                      />
                      <circle cx="20" cy="20" r="8" fill="#FAF7F2" />
                    </svg>
                    {/* Pulse ring */}
                    <div
                      className="absolute top-[18px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full animate-ping"
                      style={{ background: 'rgba(199,91,57,0.3)' }}
                    />
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div
                    className="p-3 rounded-xl backdrop-blur-sm"
                    style={{ background: 'rgba(255,255,255,0.85)' }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                    >
                      Visit Our Studio
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#5A5A5A' }}
                    >
                      Haldwani, Nainital
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FAQ SECTION                                                 */}
        {/* ============================================================ */}
        <section
          className="py-20 md:py-24"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,247,242,0) 0%, rgba(245,237,227,0.6) 100%)',
          }}
        >
          <div ref={faqRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                className="inline-block text-xs tracking-[0.25em] uppercase mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
              >
                Common Questions
              </span>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 4px 24px rgba(44,44,44,0.06)',
              }}
            >
              {faqData.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFAQ === i}
                  onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Contact;
