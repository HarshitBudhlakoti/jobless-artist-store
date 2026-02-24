import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const AdminLogin = () => {
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as admin, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'admin') {
      navigate('/control-panel', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        if (result.user?.role !== 'admin') {
          setErrors({ form: 'Access denied. Admin privileges required.' });
          setSubmitting(false);
          return;
        }
        navigate('/control-panel', { replace: true });
      } else {
        setErrors({ form: result?.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ form: 'Login failed. Please try again.' });
    }
    setSubmitting(false);
  };

  const errorVariants = {
    initial: { opacity: 0, y: -8, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#1A1A1A' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div
          className="bg-white rounded-2xl p-8 sm:p-10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#C75B39] mb-4">
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                JA
              </span>
            </div>
            <h1
              className="text-2xl font-bold text-[#1A1A1A] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Panel
            </h1>
            <p
              className="text-sm text-[#6B6B6B]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in with your admin credentials
            </p>
          </div>

          {/* Form error */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <FiAlertCircle className="shrink-0" />
                <span>{errors.form}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium mb-1.5 text-[#2C2C2C]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors duration-200
                    ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#C75B39]'}
                    bg-white placeholder-gray-400`}
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    variants={errorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <FiAlertCircle size={12} />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium mb-1.5 text-[#2C2C2C]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-colors duration-200
                    ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#C75B39]'}
                    bg-white placeholder-gray-400`}
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    variants={errorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <FiAlertCircle size={12} />
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || authLoading}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#C75B39',
                boxShadow: '0 4px 14px rgba(199,91,57,0.25)',
              }}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
