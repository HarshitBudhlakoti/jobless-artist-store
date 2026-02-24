import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
  FiArrowUp,
  FiArrowDown,
  FiLayers,
  FiImage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CATEGORY_TYPES = [
  { value: 'painting', label: 'Painting' },
  { value: 'craft', label: 'Craft' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'custom', label: 'Custom' },
];

const typeColorMap = {
  painting: 'bg-blue-100 text-blue-700',
  craft: 'bg-emerald-100 text-emerald-700',
  portrait: 'bg-purple-100 text-purple-700',
  custom: 'bg-amber-100 text-amber-700',
};

const emptyForm = {
  name: '',
  description: '',
  type: 'painting',
  image: null,
  displayOrder: 0,
  isActive: true,
};

function CategoryModal({ isOpen, onClose, category, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        type: category.type || 'painting',
        image: category.image || null,
        displayOrder: category.displayOrder ?? 0,
        isActive: category.isActive !== false,
      });
      setImagePreview(category.image?.url || null);
    } else {
      setForm(emptyForm);
      setImagePreview(null);
    }
  }, [category, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const image = data.data?.url ? data.data : data.data?.[0] || { url: data.url, public_id: data.public_id };
      setForm((prev) => ({ ...prev, image }));
      setImagePreview(image.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        image: form.image,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      if (category?._id) {
        await api.put(`/categories/${category._id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }

      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">
                  {category ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                    placeholder="Enter category name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 resize-none font-['DM_Sans']"
                    placeholder="Optional description"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange('type', type.value)}
                        className={`px-3.5 py-2.5 border rounded-lg text-sm font-medium transition-all font-['DM_Sans'] ${
                          form.type === type.value
                            ? 'border-[#C75B39] bg-[#C75B39]/5 text-[#C75B39]'
                            : 'border-gray-300 text-[#6B6B6B] hover:border-gray-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Image
                  </label>
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, image: null }));
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#C75B39] hover:bg-[#C75B39]/5 transition-colors"
                    >
                      <FiUpload className="w-6 h-6 mx-auto text-[#6B6B6B] mb-2" />
                      <p className="text-sm text-[#6B6B6B] font-['DM_Sans']">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Display order */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-['DM_Sans']">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.displayOrder}
                    onChange={(e) => handleChange('displayOrder', e.target.value)}
                    className="w-full max-w-[200px] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#C75B39] focus:ring-2 focus:ring-[#C75B39]/20 font-['DM_Sans']"
                  />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-[22px] rounded-full transition-colors duration-200 ${
                        form.isActive ? 'bg-[#C75B39]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${
                          form.isActive ? 'translate-x-[18px]' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-[#1A1A1A] font-['DM_Sans']">Active</span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-[#6B6B6B] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#C75B39] hover:bg-[#a5492e] rounded-lg transition-colors disabled:opacity-50 font-['DM_Sans']"
                  >
                    {saving ? 'Saving...' : category ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      const sorted = (data.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setCategories(sorted);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditCategory(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    try {
      await api.delete(`/categories/${deleteModal.category._id}`);
      toast.success('Category deleted');
      setDeleteModal({ open: false, category: null });
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const moveCategory = async (index, direction) => {
    const newCategories = [...categories];
    const target = index + direction;
    if (target < 0 || target >= newCategories.length) return;

    [newCategories[index], newCategories[target]] = [newCategories[target], newCategories[index]];

    // Update display orders
    const updated = newCategories.map((cat, i) => ({ ...cat, displayOrder: i }));
    setCategories(updated);

    try {
      await Promise.all(
        updated.map((cat) =>
          api.put(`/categories/${cat._id}`, { displayOrder: cat.displayOrder })
        )
      );
    } catch {
      toast.error('Failed to reorder');
      fetchCategories();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] font-['Playfair_Display']">Categories</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5 font-['DM_Sans']">{categories.length} categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C75B39] hover:bg-[#a5492e] text-white text-sm font-medium rounded-lg transition-colors font-['DM_Sans']"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center py-20">
          <FiLayers className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-[#6B6B6B] font-['DM_Sans']">No categories yet</p>
          <button
            onClick={handleAdd}
            className="mt-3 text-sm text-[#C75B39] hover:text-[#a5492e] font-medium font-['DM_Sans']"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, idx) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow"
            >
              {/* Image */}
              <div className="h-36 bg-gray-100 relative">
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <FiImage className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {/* Type badge */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-medium font-['DM_Sans'] ${
                    typeColorMap[category.type] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.type?.charAt(0).toUpperCase() + category.type?.slice(1) || 'General'}
                </span>
                {/* Active status */}
                <span
                  className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                    category.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={category.isActive ? 'Active' : 'Inactive'}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A] font-['DM_Sans']">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-2 font-['DM_Sans']">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#6B6B6B] bg-gray-100 px-2 py-0.5 rounded font-['DM_Sans'] flex-shrink-0 ml-2">
                    #{category.displayOrder}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveCategory(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                      title="Move up"
                    >
                      <FiArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 1)}
                      disabled={idx === categories.length - 1}
                      className="p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                      title="Move down"
                    >
                      <FiArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-[#6B6B6B] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, category })}
                      className="p-1.5 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCategory(null); }}
        category={editCategory}
        onSave={fetchCategories}
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
              onClick={() => setDeleteModal({ open: false, category: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-[#1A1A1A] font-['DM_Sans']">Delete Category</h3>
                <p className="text-sm text-[#6B6B6B] mt-2 font-['DM_Sans']">
                  Are you sure you want to delete <strong>"{deleteModal.category?.name}"</strong>? Products in this category will become uncategorized.
                </p>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setDeleteModal({ open: false, category: null })}
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
