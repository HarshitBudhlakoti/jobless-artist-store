import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { invalidateCache } from '../../hooks/useSiteContent';

const emptyForm = {
  name: '',
  location: '',
  quote: '',
  rating: 5,
  isActive: true,
  displayOrder: 0,
};

function TestimonialModal({ isOpen, onClose, testimonial, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setForm({
        name: testimonial.name || '',
        location: testimonial.location || '',
        quote: testimonial.quote || '',
        rating: testimonial.rating ?? 5,
        isActive: testimonial.isActive !== false,
        displayOrder: testimonial.displayOrder ?? 0,
      });
    } else {
      setForm(emptyForm);
    }
  }, [testimonial, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error('Name and quote are required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      // error handled in parent
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39] outline-none transition-colors font-['DM_Sans']";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5 font-['DM_Sans']";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-['DM_Sans']">
              {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Quote *</label>
              <textarea
                className={inputClass}
                rows={4}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Rating</label>
                <select
                  className={inputClass}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className={labelClass}>Active</label>
                <select
                  className={inputClass}
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#C75B39] rounded-lg hover:bg-[#B04E30] transition-colors disabled:opacity-50 font-['DM_Sans']"
              >
                {saving ? 'Saving...' : testimonial ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials', { all: true });
      if (res.data?.success) setTestimonials(res.data.data);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    const res = await api.post('/testimonials', form);
    if (res.data?.success) {
      invalidateCache('testimonials');
      toast.success('Testimonial created');
      fetchTestimonials();
    }
  };

  const handleUpdate = async (form) => {
    const res = await api.put(`/testimonials/${editItem._id}`, form);
    if (res.data?.success) {
      invalidateCache('testimonials');
      toast.success('Testimonial updated');
      fetchTestimonials();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      invalidateCache('testimonials');
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1 font-['DM_Sans']">
            Manage customer testimonials shown on the homepage.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C75B39] text-white text-sm font-semibold rounded-lg hover:bg-[#B04E30] transition-colors font-['DM_Sans']"
        >
          <FiPlus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-['DM_Sans']">No testimonials yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 font-['DM_Sans']"
                style={{ background: 'linear-gradient(135deg, #C75B39, #D4A857)' }}
              >
                {item.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm font-['DM_Sans']">{item.name}</span>
                  {item.location && (
                    <span className="text-xs text-gray-400 font-['DM_Sans']">{item.location}</span>
                  )}
                  {!item.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-['DM_Sans']">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      className="w-3.5 h-3.5"
                      fill={s <= item.rating ? '#D4A857' : 'none'}
                      stroke={s <= item.rating ? '#D4A857' : '#D1D5DB'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 font-['DM_Sans']">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 text-gray-400 hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        testimonial={editItem}
        onSave={editItem ? handleUpdate : handleCreate}
      />
    </div>
  );
}
