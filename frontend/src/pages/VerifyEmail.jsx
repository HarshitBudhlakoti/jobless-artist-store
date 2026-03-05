import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import api from '../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Invalid or expired verification link');
      }
    };
    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] items-center justify-center px-4"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <FiLoader className="mx-auto h-12 w-12 text-[#C75B39] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 font-['Playfair_Display']">
              Verifying your email...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 font-['Playfair_Display'] mb-2">
              Email Verified!
            </h2>
            <p className="text-sm text-gray-600 font-['DM_Sans'] mb-6">{message}</p>
            <Link
              to="/profile"
              className="inline-flex items-center px-6 py-3 bg-[#C75B39] text-white rounded-lg text-sm font-medium hover:bg-[#a5492e] transition-colors font-['DM_Sans']"
            >
              Go to Profile
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 font-['Playfair_Display'] mb-2">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 font-['DM_Sans'] mb-6">{message}</p>
            <Link
              to="/profile"
              className="inline-flex items-center px-6 py-3 bg-[#C75B39] text-white rounded-lg text-sm font-medium hover:bg-[#a5492e] transition-colors font-['DM_Sans']"
            >
              Go to Profile
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}
