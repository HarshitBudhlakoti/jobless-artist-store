import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api/axios';
import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <SEO title="Reset Password" description="Set your new password." path="/reset-password" />
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: '#FAF7F2' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div
            className="bg-white rounded-2xl p-8 sm:p-10"
            style={{ boxShadow: '0 4px 24px rgba(44,44,44,0.06)' }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
                >
                  <FiCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Password Reset!
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  Your password has been changed successfully. You can now log in with your new password.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Go to Login
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(199,91,57,0.08)' }}
                  >
                    <FiLock className="w-6 h-6" style={{ color: '#C75B39' }} />
                  </div>
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                  >
                    Set New Password
                  </h1>
                  <p
                    className="text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                  >
                    Enter your new password below.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl text-sm"
                    style={{
                      backgroundColor: 'rgba(199,91,57,0.08)',
                      border: '1px solid rgba(199,91,57,0.2)',
                      color: '#C75B39',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all outline-none pr-11"
                        style={{
                          border: '1.5px solid #E5E5E5',
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2C2C2C',
                          backgroundColor: '#FAFAFA',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#C75B39')}
                        onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#9CA3AF' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all outline-none pr-11"
                        style={{
                          border: '1.5px solid #E5E5E5',
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2C2C2C',
                          backgroundColor: '#FAFAFA',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#C75B39')}
                        onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#9CA3AF' }}
                        tabIndex={-1}
                      >
                        {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ backgroundColor: '#C75B39', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
                  >
                    <FiArrowLeft size={14} />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
