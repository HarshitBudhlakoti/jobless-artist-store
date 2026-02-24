import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiImage,
  FiFilter,
  FiMoreVertical,
  FiPackage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatPrice, debounce, getPaginationRange } from '../../utils/helpers';

const MEDIUMS = [
  { value: 'oil', label: 'Oil' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'digital', label: 'Digital' },
  { value: 'charcoal', label: 'Charcoal' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'ink', label: 'Ink' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'pencil', label: 'Pencil' },
  { value: 'other', label: 'Other' },
];

const UNITS = [
  { value: 'in', label: 'Inches' },
  { value: 'cm', label: 'cm' },
  { value: 'ft', label: 'Feet' },
];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  images: [],
  medium: '',
  dimensions: { width: '', height: '', unit: 'in' },
  isFramed: false,
  stock: 1,
  tags: '',
  isFeatured: false,
  isActive: true,
};

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-10 h-5.5 rounded-full transition-colors duration-200 ${
            checked ? 'bg-[#C75B39]' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
              checked ? 'translate-x-[18px]' : 'translate-x-0'
            }`}
            style={{ width: '18px', height: '18px' }}
          />
        </div>
      </div>
      {label && <span className="text-sm text-[#1A1A1A] font-['DM_Sans']">{label}</span>}
    </label>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, productTitle }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Delete Product</h3>
              <p className="text-sm text-[#6B6B6B] mt-2 font-['DM_Sans']">
                Are you sure you want to delete <strong>"{productTitle}"</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-['DM_Sans']"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductFormPanel({ isOpen, onClose, product, categories, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        category: product.category?._id || product.category || '',
        images: product.images || [],
        medium: product.medium || '',
        dimensions: {
          width: product.dimensions?.width || '',
          height: product.dimensions?.height || '',
          unit: product.dimensions?.unit || 'in',
        },
        isFramed: product.isFramed || false,
        stock: product.stock ?? 1,
        tags: product.tags?.join(', ') || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
      });
      setImagePreviews(product.images?.map((img) => img.url) || []);
    } else {
      setForm(emptyForm);
      setImagePreviews([]);
    }
  }, [product, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value },
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('images', file);
        const { data } = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data?.[0] || data.images?.[0] || data[0] || { url: data.url, public_id: data.public_id };
      });

      const uploaded = await Promise.all(uploadPromises);
      const newImages = [...form.images, ...uploaded];
      setForm((prev) => ({ ...prev, images: newImages }));
      setImagePreviews(newImages.map((img) => img.url));
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newImages.map((img) => img.url));
  };

  const moveImage = (index, direction) => {
    const newImages = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
    setForm((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newImages.map((img) => img.url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.price) {
      toast.error('Price is required');
      return;
    }
    if (!form.category) {
      toast.error('Category is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [],
        dimensions: {
          width: form.dimensions.width ? Number(form.dimensions.width) : undefined,
          height: form.dimensions.height ? Number(form.dimensions.height) : undefined,
          unit: form.dimensions.unit,
        },
      };

      if (!payload.discountPrice) delete payload.discountPrice;

      if (product?._id) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }

      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">
                {product ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  placeholder="Enter product title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 resize-none font-['DM_Sans']"
                  placeholder="Describe the product"
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Price (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.discountPrice}
                    onChange={(e) => handleChange('discountPrice', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Category and Medium */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Medium
                  </label>
                  <select
                    value={form.medium}
                    onChange={(e) => handleChange('medium', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                  >
                    <option value="">Select medium</option>
                    {MEDIUMS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Images
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#C75B39] hover:bg-[#C75B39]/5 transition-colors"
                >
                  <FiUpload className="w-8 h-8 mx-auto text-[#6B6B6B] mb-2" />
                  <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-[#6B6B6B] mt-1 font-['DM_Sans']">
                    JPG, PNG, WebP up to 5MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, -1)}
                              className="p-1 bg-white rounded text-xs"
                            >
                              <FiChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 bg-red-500 text-white rounded"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                          {idx < imagePreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 1)}
                              className="p-1 bg-white rounded text-xs"
                            >
                              <FiChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#C75B39] text-white text-[10px] px-1.5 py-0.5 rounded font-['DM_Sans']">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Dimensions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={form.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                    placeholder="Height"
                  />
                  <select
                    value={form.dimensions.unit}
                    onChange={(e) => handleDimensionChange('unit', e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  className="w-full max-w-[200px] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  placeholder="landscape, modern, abstract (comma separated)"
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(',').filter((t) => t.trim()).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#C75B39]/10 text-[#C75B39] font-['DM_Sans']"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <ToggleSwitch
                  checked={form.isFramed}
                  onChange={(val) => handleChange('isFramed', val)}
                  label="Is Framed"
                />
                <ToggleSwitch
                  checked={form.isFeatured}
                  onChange={(val) => handleChange('isFeatured', val)}
                  label="Featured"
                />
                <ToggleSwitch
                  checked={form.isActive}
                  onChange={(val) => handleChange('isActive', val)}
                  label="Active"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C75B39] hover:bg-[#a5492e] rounded-lg transition-colors disabled:opacity-50 font-['DM_Sans']"
              >
                {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data || []);
    } catch {
      // Categories may not be available
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: search || undefined };
      if (categoryFilter) params.category = categoryFilter;

      // For admin, we need to see all products (active and inactive)
      const { data } = await api.get('/products', params);
      let productList = data.data || [];

      // Client-side status filter since the API filters isActive by default
      if (statusFilter === 'active') {
        productList = productList.filter((p) => p.isActive);
      } else if (statusFilter === 'inactive') {
        productList = productList.filter((p) => !p.isActive);
      }

      setProducts(productList);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || productList.length);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchProducts();
    }, 400),
    [categoryFilter, statusFilter, limit]
  );

  useEffect(() => {
    debouncedSearch();
  }, [search]);

  const handleEdit = (product) => {
    setEditProduct(product);
    setPanelOpen(true);
  };

  const handleAdd = () => {
    setEditProduct(null);
    setPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      toast.success('Product deleted');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const toggleActive = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(products.map((p) => p._id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);

    try {
      if (action === 'delete') {
        await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
        toast.success(`${ids.length} product(s) deleted`);
      } else if (action === 'activate') {
        await Promise.all(ids.map((id) => api.put(`/products/${id}`, { isActive: true })));
        toast.success(`${ids.length} product(s) activated`);
      } else if (action === 'deactivate') {
        await Promise.all(ids.map((id) => api.put(`/products/${id}`, { isActive: false })));
        toast.success(`${ids.length} product(s) deactivated`);
      }
      setSelected(new Set());
      fetchProducts();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const pagination = getPaginationRange(page, totalPages);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Products</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{total} product(s) total</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C75B39] hover:bg-[#a5492e] text-white text-sm font-medium rounded-lg transition-colors font-['DM_Sans']"
        >
          <FiPlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white min-w-[130px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100"
          >
            <span className="text-sm text-[#6B6B6B] font-['DM_Sans']">
              {selected.size} selected
            </span>
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors font-['DM_Sans']"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-['DM_Sans']"
            >
              Delete
            </button>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiPackage className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-[#6B6B6B] font-['DM_Sans']">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#C75B39] focus:ring-[#C75B39]"
                    />
                  </th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Product</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Category</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Price</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Stock</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Status</th>
                  <th className="text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 py-3 font-['DM_Sans']">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product, idx) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product._id)}
                        onChange={() => handleSelectOne(product._id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#C75B39] focus:ring-[#C75B39]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate max-w-[200px] font-['DM_Sans']">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#D4A857]">
                                <FiStar className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {product.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-['DM_Sans']">
                        {product.discountPrice ? (
                          <>
                            <p className="text-sm font-medium text-[#C75B39]">
                              {formatPrice(product.discountPrice)}
                            </p>
                            <p className="text-xs text-[#6B6B6B] line-through">
                              {formatPrice(product.price)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium font-['DM_Sans'] ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock <= 3
                            ? 'text-yellow-600'
                            : 'text-[#1A1A1A]'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors font-['DM_Sans'] ${
                          product.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, product })}
                          className="p-1.5 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B6B6B] font-['DM_Sans']">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-['DM_Sans'] bg-white"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              {pagination.map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-sm text-[#6B6B6B] font-['DM_Sans']">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors font-['DM_Sans'] ${
                      page === p
                        ? 'bg-[#C75B39] text-white'
                        : 'text-[#6B6B6B] hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product form panel */}
      <ProductFormPanel
        isOpen={panelOpen}
        onClose={() => { setPanelOpen(false); setEditProduct(null); }}
        product={editProduct}
        categories={categories}
        onSave={fetchProducts}
      />

      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        productTitle={deleteModal.product?.title}
      />
    </div>
  );
}
