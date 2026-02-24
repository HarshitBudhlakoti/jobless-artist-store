import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
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
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  images: [],
  medium: '',
  stock: 1,
  tags: '',
  isActive: true,
};

function CraftFormPanel({ isOpen, onClose, product, craftCategories, onSave }) {
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
        stock: product.stock ?? 1,
        tags: product.tags?.join(', ') || '',
        isActive: product.isActive !== false,
      });
      setImagePreviews(product.images?.map((img) => img.url) || []);
    } else {
      const defaultCat = craftCategories.length > 0 ? craftCategories[0]._id : '';
      setForm({ ...emptyForm, category: defaultCat });
      setImagePreviews([]);
    }
  }, [product, isOpen, craftCategories]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        return data.data?.[0] || data.images?.[0] || { url: data.url, public_id: data.public_id };
      });

      const uploaded = await Promise.all(uploadPromises);
      const newImages = [...form.images, ...uploaded];
      setForm((prev) => ({ ...prev, images: newImages }));
      setImagePreviews(newImages.map((img) => img.url));
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }

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
      };
      if (!payload.discountPrice) delete payload.discountPrice;

      if (product?._id) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Craft item updated');
      } else {
        await api.post('/products', payload);
        toast.success('Craft item created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
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
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">
                {product ? 'Edit Craft Item' : 'Add Craft Item'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  placeholder="Craft item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 resize-none font-['DM_Sans']"
                />
              </div>

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
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Craft Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans'] bg-white"
                  >
                    <option value="">Select category</option>
                    {craftCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">Images</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-[#C75B39] hover:bg-[#C75B39]/5 transition-colors"
                >
                  <FiUpload className="w-6 h-6 mx-auto text-[#6B6B6B] mb-1" />
                  <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                  </p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  placeholder="handmade, gift, decor (comma separated)"
                />
              </div>

              {/* Availability toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-[22px] rounded-full transition-colors duration-200 ${form.isActive ? 'bg-[#C75B39]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </div>
                </div>
                <span className="text-sm text-[#1A1A1A] font-['DM_Sans']">Available for Sale</span>
              </label>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[#6B6B6B] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C75B39] hover:bg-[#a5492e] rounded-lg transition-colors disabled:opacity-50 font-['DM_Sans']"
              >
                {saving ? 'Saving...' : product ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CraftCatalogManager() {
  const [products, setProducts] = useState([]);
  const [craftCategories, setCraftCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });

  useEffect(() => {
    fetchCraftCategories();
  }, []);

  useEffect(() => {
    if (craftCategories.length > 0) {
      fetchProducts();
    }
  }, [page, craftCategories]);

  const fetchCraftCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      const cats = (data.data || []).filter((c) => c.type === 'craft');
      setCraftCategories(cats);

      if (cats.length === 0) {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (craftCategories.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch products for all craft categories
      const categoryIds = craftCategories.map((c) => c._id);
      const allProducts = [];

      for (const catId of categoryIds) {
        const { data } = await api.get('/products', {
          params: { category: catId, limit: 100, search: search || undefined },
        });
        allProducts.push(...(data.data || []));
      }

      // Deduplicate
      const unique = Array.from(new Map(allProducts.map((p) => [p._id, p])).values());

      setTotal(unique.length);
      setTotalPages(Math.ceil(unique.length / limit) || 1);
      const start = (page - 1) * limit;
      setProducts(unique.slice(start, start + limit));
    } catch {
      toast.error('Failed to load craft items');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      fetchProducts();
    }, 400),
    [craftCategories]
  );

  useEffect(() => {
    if (craftCategories.length > 0) {
      debouncedSearch();
    }
  }, [search]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      toast.success('Craft item deleted');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      toast.success(`Item ${product.isActive ? 'hidden' : 'made available'}`);
      fetchProducts();
    } catch {
      toast.error('Failed to update');
    }
  };

  const pagination = getPaginationRange(page, totalPages);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Craft Catalog</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{total} craft item(s)</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setPanelOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C75B39] hover:bg-[#a5492e] text-white text-sm font-medium rounded-lg transition-colors font-['DM_Sans']"
        >
          <FiPlus className="w-4 h-4" />
          Add Craft Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search craft items..."
            className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center py-20">
          <FiPackage className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-[#6B6B6B] font-['DM_Sans']">
            {craftCategories.length === 0
              ? 'No craft categories found. Create a category with type "craft" first.'
              : 'No craft items found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow group"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-[#1A1A1A] text-xs font-medium px-3 py-1 rounded-full font-['DM_Sans']">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] truncate font-['DM_Sans']">{product.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {product.discountPrice ? (
                    <>
                      <span className="text-sm font-bold text-[#C75B39] font-['DM_Sans']">{formatPrice(product.discountPrice)}</span>
                      <span className="text-xs text-[#6B6B6B] line-through font-['DM_Sans']">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-[#1A1A1A] font-['DM_Sans']">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-['DM_Sans'] ${product.stock === 0 ? 'text-red-600' : 'text-[#6B6B6B]'}`}>
                    Stock: {product.stock}
                  </span>
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium font-['DM_Sans'] transition-colors ${
                      product.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {product.isActive ? 'Available' : 'Hidden'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setEditProduct(product); setPanelOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors font-['DM_Sans']"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, product })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-['DM_Sans']"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-white transition-colors"
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
                  page === p ? 'bg-[#C75B39] text-white' : 'text-[#6B6B6B] hover:bg-white'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-30 rounded-lg hover:bg-white transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form panel */}
      <CraftFormPanel
        isOpen={panelOpen}
        onClose={() => { setPanelOpen(false); setEditProduct(null); }}
        product={editProduct}
        craftCategories={craftCategories}
        onSave={fetchProducts}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteModal({ open: false, product: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Delete Craft Item</h3>
                <p className="text-sm text-[#6B6B6B] mt-2 font-['DM_Sans']">
                  Are you sure you want to delete <strong>"{deleteModal.product?.title}"</strong>?
                </p>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setDeleteModal({ open: false, product: null })}
                    className="px-4 py-2 text-sm font-medium text-[#6B6B6B] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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
    </div>
  );
}
