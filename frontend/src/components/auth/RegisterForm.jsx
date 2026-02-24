import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import GoogleAuthButton from './GoogleAuthButton';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: 'Weak', color: '#EF4444' };
  if (score <= 3) return { score: 2, label: 'Medium', color: '#F59E0B' };
  return { score: 3, label: 'Strong', color: '#22C55E' };
};

const RegisterForm = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ form: msg });
    }
  };

  const errorVariants = {
    initial: { opacity: 0, y: -8, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Heading */}
      <div className="mb-8 text-center sm:text-left">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          Join Jobless Artist
        </h1>
        <p
          className="text-base"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
        >
          Create your account to start collecting
        </p>
      </div>

      {/* Form-level error */}
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
        {/* Name */}
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium mb-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
          >
            Full Name
          </label>
          <div className="relative">
            <FiUser
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors duration-200
                ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#C75B39]'}
                bg-white placeholder-gray-400`}
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            />
          </div>
          <AnimatePresence>
            {errors.name && (
              <motion.p
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
              >
                <FiAlertCircle size={12} />
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium mb-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
          >
            Email Address
          </label>
          <div className="relative">
            <FiMail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
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
            htmlFor="register-password"
            className="block text-sm font-medium mb-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
          >
            Password
          </label>
          <div className="relative">
            <FiLock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              autoComplete="new-password"
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

          {/* Password strength indicator */}
          {formData.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <div className="flex gap-1.5 mb-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        passwordStrength.score >= level ? passwordStrength.color : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
              <p
                className="text-xs font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif", color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {errors.password && (
              <motion.p
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
              >
                <FiAlertCircle size={12} />
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium mb-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <FiLock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-colors duration-200
                ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#C75B39]'}
                bg-white placeholder-gray-400`}
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {/* Match indicator */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-xs text-green-500 flex items-center gap-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <FiCheck size={12} />
              Passwords match
            </motion.p>
          )}
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
              >
                <FiAlertCircle size={12} />
                {errors.confirmPassword}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#C75B39] cursor-pointer"
            />
            <span
              className="text-sm leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="font-medium hover:underline"
                style={{ color: '#C75B39' }}
              >
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-medium hover:underline"
                style={{ color: '#C75B39' }}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          <AnimatePresence>
            {errors.agreeTerms && (
              <motion.p
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-6"
              >
                <FiAlertCircle size={12} />
                {errors.agreeTerms}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: '#C75B39',
            boxShadow: '0 4px 14px rgba(199,91,57,0.25)',
          }}
        >
          {loading ? (
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
        >
          or continue with
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Login link */}
      <p
        className="mt-8 text-center text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold hover:underline"
          style={{ color: '#C75B39' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
