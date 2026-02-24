import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import api from '../api/axios';
import AnimatedPage from '../components/common/AnimatedPage';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#FAF7F2' }}
      >
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 hover:underline"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#C75B39' }}
          >
            <FiArrowLeft size={14} /> Back to Login
          </Link>

          <div
            className="p-8 rounded-2xl"
            style={{ background: '#FFFFFF', boxShadow: '0 4px 24px rgba(44,44,44,0.06)' }}
          >
            {sent ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)' }}
                >
                  <FiMail size={24} style={{ color: '#16a34a' }} />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Check Your Email
                </h2>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  If an account exists for <strong>{email}</strong>, we've sent password reset
                  instructions. The link will expire in 30 minutes.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold
                             transition-all duration-200 hover:shadow-lg"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: '#C75B39',
                  }}
                >
                  Return to Login
                </Link>
              </motion.div>
            ) : (
              /* Form state */
              <>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
                >
                  Forgot Password?
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                >
                  Enter the email address associated with your account and we'll send you a link to
                  reset your password.
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: 'rgba(199,91,57,0.08)',
                      color: '#C75B39',
                      border: '1px solid rgba(199,91,57,0.2)',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <FiMail className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                    </div>
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="w-full rounded-xl border bg-white text-sm outline-none transition-all
                                 duration-200 focus:ring-2 py-3.5 pl-11 pr-4"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        borderColor: error ? '#C75B39' : 'rgba(44,44,44,0.12)',
                        color: '#2C2C2C',
                        '--tw-ring-color': '#C75B39',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                               text-base font-semibold text-white transition-all duration-300
                               hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: '#C75B39',
                      boxShadow: '0 4px 14px rgba(199,91,57,0.3)',
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
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
                        Send Reset Link
                        <FiSend className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
