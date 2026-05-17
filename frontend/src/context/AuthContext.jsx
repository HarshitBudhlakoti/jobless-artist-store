import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          const userData = data.data || data.user || data;
          setUser(userData);
          setIsAuthenticated(true);
          // Extract wishlist IDs
          if (userData.wishlist && Array.isArray(userData.wishlist)) {
            const ids = userData.wishlist.map((item) =>
              typeof item === 'string' ? item : item._id
            );
            setWishlist(ids);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          setWishlist([]);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.token;
      const userData = data.data || data.user || data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const token = data.token;
      const userData = data.data || data.user || data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  const googleLogin = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiUrl}/auth/google`;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Profile updated successfully!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || 'Profile update failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const msg = error.message || 'Password change failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const toggleWishlist = useCallback(async (productId) => {
    try {
      const { data } = await api.post('/auth/wishlist/toggle', { productId });
      const updatedWishlist = (data.wishlist || []).map((item) =>
        typeof item === 'string' ? item : item._id
      );
      setWishlist(updatedWishlist);
      return { success: true, wishlist: updatedWishlist };
    } catch (error) {
      const msg = error.message || 'Failed to update wishlist';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlist.includes(productId),
    [wishlist]
  );

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    googleLogin,
    updateProfile,
    changePassword,
    wishlist,
    toggleWishlist,
    isInWishlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
