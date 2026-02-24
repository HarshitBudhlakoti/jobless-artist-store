import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';
import api from '../../api/axios';

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const ReferenceUpload = ({ referenceImages, onChange }) => {
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setError('');

      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((r) => {
          const errs = r.errors.map((e) => e.message).join(', ');
          return `${r.file.name}: ${errs}`;
        });
        setError(reasons.join('. '));
        return;
      }

      const remaining = MAX_FILES - referenceImages.length;
      if (acceptedFiles.length > remaining) {
        setError(`You can upload ${remaining} more image${remaining !== 1 ? 's' : ''}.`);
        return;
      }

      for (const file of acceptedFiles) {
        const tempId = `${file.name}-${Date.now()}`;

        setUploading((prev) => ({
          ...prev,
          [tempId]: { name: file.name, progress: 0, preview: URL.createObjectURL(file) },
        }));

        try {
          const formData = new FormData();
          formData.append('image', file);

          const { data } = await api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
              const pct = Math.round((e.loaded * 100) / (e.total || 1));
              setUploading((prev) => ({
                ...prev,
                [tempId]: { ...prev[tempId], progress: pct },
              }));
            },
          });

          const url = data.url || data.imageUrl || data.data?.url || '';
          onChange([...referenceImages, url]);
        } catch (err) {
          setError(`Failed to upload ${file.name}. Please try again.`);
        } finally {
          setUploading((prev) => {
            const copy = { ...prev };
            if (copy[tempId]?.preview) {
              URL.revokeObjectURL(copy[tempId].preview);
            }
            delete copy[tempId];
            return copy;
          });
        }
      }
    },
    [referenceImages, onChange]
  );

  const removeImage = (index) => {
    const updated = referenceImages.filter((_, i) => i !== index);
    onChange(updated);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES - referenceImages.length,
    disabled: referenceImages.length >= MAX_FILES,
  });

  const uploadingEntries = Object.entries(uploading);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-colors duration-300 ${
            isDragActive
              ? 'border-[#C75B39] bg-[#C75B39]/5'
              : referenceImages.length >= MAX_FILES
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-[#C75B39]/50 hover:bg-[#C75B39]/[0.02]'
          }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(199,91,57,0.08)' }}
          >
            <FiUploadCloud className="w-7 h-7 text-[#C75B39]" />
          </div>
          {isDragActive ? (
            <p className="text-[#C75B39] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Drop images here...
            </p>
          ) : referenceImages.length >= MAX_FILES ? (
            <p className="text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Maximum {MAX_FILES} images uploaded
            </p>
          ) : (
            <>
              <p className="text-[#2C2C2C] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Drag images here or click to browse
              </p>
              <p className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                JPG, PNG, or WebP up to 5MB each (max {MAX_FILES} images)
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-red-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Uploading previews */}
      <AnimatePresence>
        {uploadingEntries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {uploadingEntries.map(([id, info]) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={info.preview}
                  alt="Uploading"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#C75B39' }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${info.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p
                    className="text-xs text-center mt-1 text-gray-600 truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {info.progress}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Uploaded thumbnails */}
      <AnimatePresence>
        {referenceImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {referenceImages.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm"
              >
                <img
                  src={url}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm
                    flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 hover:bg-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                  <span
                    className="text-xs text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {index + 1}/{MAX_FILES}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <FiImage className="w-4 h-4 flex-shrink-0" />
        <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Upload reference images to help the artist understand your vision.
          {referenceImages.length > 0 &&
            ` ${referenceImages.length}/${MAX_FILES} uploaded.`}
        </span>
      </div>
    </div>
  );
};

export default ReferenceUpload;
