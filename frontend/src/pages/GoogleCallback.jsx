import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      // Save token
      localStorage.setItem('token', token);

      try {
        // Fetch user profile with the new token
        const { data } = await api.get('/auth/me');
        const userData = data.data || data.user || data;
        localStorage.setItem('user', JSON.stringify(userData));

        // Force a full page reload so AuthContext picks up the new token
        window.location.replace('/');
      } catch {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#FAF7F2' }}
    >
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#C75B39" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="#C75B39"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}
