import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data.products || data.data || data);
      if (data.pagination) {
        setPagination(data.pagination);
      } else if (data.page !== undefined) {
        setPagination({
          page: data.page,
          pages: data.pages || data.totalPages || 1,
          total: data.total || data.totalProducts || 0,
          limit: data.limit || 12,
        });
      }
      return data;
    } catch (err) {
      const message = err.message || 'Failed to fetch products';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products/featured');
      const featured = data.products || data.data || data;
      setProducts(featured);
      return featured;
    } catch (err) {
      const message = err.message || 'Failed to fetch featured products';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/${id}`);
      const productData = data.product || data.data || data;
      setProduct(productData);
      return productData;
    } catch (err) {
      const message = err.message || 'Failed to fetch product';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    product,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProduct,
  };
}
