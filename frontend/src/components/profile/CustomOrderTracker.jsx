import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle,
  FiDollarSign,
  FiThumbsUp,
  FiTool,
  FiEye,
  FiCheckCircle,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiPenTool,
  FiArrowRight,
  FiImage,
  FiClock,
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatPrice, getStatusColor, getImageUrl } from '../../utils/helpers';

/* ---- Stage definitions for the visual timeline ---- */
const STAGES = [
  { key: 'inquiry', label: 'Inquiry', icon: FiMessageCircle },
  { key: 'quoted', label: 'Quoted', icon: FiDollarSign },
  { key: 'accepted', label: 'Accepted', icon: FiThumbsUp },
  { key: 'in-progress', label: 'In Progress', icon: FiTool },
  { key: 'review', label: 'Review', icon: FiEye },
  { key: 'completed', label: 'Completed', icon: FiCheckCircle },
  { key: 'delivered', label: 'Delivered', icon: FiTruck },
];

const getStageIndex = (status) => {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');
  const idx = STAGES.findIndex((s) => s.key === normalized);
  return idx >= 0 ? idx : 0;
};

/* ---- Progress Timeline component ---- */
const Timeline = ({ currentStatus }) => {
  const currentIdx = getStageIndex(currentStatus);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start min-w-[520px]">
        {STAGES.map((stage, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex items-start flex-1">
              {/* Node */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                    ${isPast ? 'border-green-400 bg-green-50' : ''}
                    ${isCurrent ? 'border-[#C75B39] bg-[#C75B39]' : ''}
                    ${isUpcoming ? 'border-gray-200 bg-gray-50' : ''}
                  `}
                >
                  {isPast ? (
                    <FiCheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Icon
                      size={15}
                      className={isCurrent ? 'text-white' : 'text-gray-300'}
                    />
                  )}
                </motion.div>
                <span
                  className={`text-[10px] mt-1.5 text-center leading-tight max-w-[60px]
                    ${isCurrent ? 'font-bold' : 'font-medium'}
                  `}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isPast ? '#22C55E' : isCurrent ? '#C75B39' : '#9CA3AF',
                  }}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < STAGES.length - 1 && (
                <div className="flex-1 flex items-center pt-[18px] px-1">
                  <div
                    className="h-0.5 w-full rounded-full transition-colors duration-300"
                    style={{
                      background: idx < currentIdx ? '#22C55E' : '#E5E7EB',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---- Image gallery thumbnail strip ---- */
const ImageGallery = ({ images, label }) => {
  if (!images || !images.length) return null;

  return (
    <div className="mt-3">
      <p
        className="text-xs font-semibold mb-2 flex items-center gap-1"
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
      >
        <FiImage size={12} /> {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, idx) => (
          <a
            key={idx}
            href={typeof img === 'string' ? img : img.url || img.src}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100
                       hover:border-[#C75B39] transition-colors"
          >
            <img
              src={getImageUrl(typeof img === 'string' ? img : img.url || img.src, 120, 120)}
              alt={`${label} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

const CustomOrderTracker = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchCustomOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/custom-orders/my-orders');
        setCustomOrders(data.orders || data.data || data || []);
      } catch {
        setCustomOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <div key={j} className="flex-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto" />
                  <div className="h-2 bg-gray-100 rounded mt-1 mx-auto w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!customOrders.length) {
    return (
      <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
        <FiPenTool className="mx-auto mb-4 text-gray-300" size={48} />
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
        >
          No custom orders yet
        </h3>
        <p
          className="text-sm mb-6 max-w-sm mx-auto"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
        >
          Have something unique in mind? Commission a custom artwork tailored to your vision.
        </p>
        <Link
          to="/custom-order"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold
                     transition-all duration-200 hover:shadow-lg"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: '#C75B39',
            boxShadow: '0 4px 14px rgba(199,91,57,0.25)',
          }}
        >
          Request Custom Art <FiArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {customOrders.map((order) => {
        const isExpanded = expandedId === order._id;
        const status = order.status || 'inquiry';
        const statusColors = getStatusColor(status);
        const orderType = order.type || order.artType || order.category || 'Custom Art';

        return (
          <motion.div
            key={order._id}
            layout
            className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
          >
            {/* Order header */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-sm font-semibold capitalize"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                  >
                    {typeof orderType === 'string' ? orderType.replace(/-/g, ' ') : 'Custom Art'}
                  </p>
                  <p
                    className="text-xs flex items-center gap-1 mt-1"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                  >
                    <FiClock size={11} />
                    Submitted{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors.bg} ${statusColors.text}`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {status.replace(/-/g, ' ')}
                  </span>
                  {(order.estimatedPrice || order.finalPrice || order.price) && (
                    <p
                      className="text-sm font-bold mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                    >
                      {order.finalPrice ? (
                        <>
                          <span>{formatPrice(order.finalPrice)}</span>
                          {order.estimatedPrice && order.estimatedPrice !== order.finalPrice && (
                            <span className="text-xs font-normal line-through ml-1.5 text-gray-400">
                              {formatPrice(order.estimatedPrice)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-normal">
                          Est. {formatPrice(order.estimatedPrice || order.price)}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <Timeline currentStatus={status} />
            </div>

            {/* Expand/collapse button */}
            <button
              onClick={() => toggleExpand(order._id)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                         border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
            >
              {isExpanded ? 'Show less' : 'Show details'}
              {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>

            {/* Expanded details */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    {/* Description */}
                    {order.description && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                        >
                          Description
                        </p>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
                        >
                          {order.description}
                        </p>
                      </div>
                    )}

                    {/* Order details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {order.size && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                          >
                            Size
                          </p>
                          <p
                            className="text-xs font-medium capitalize"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            {order.size}
                          </p>
                        </div>
                      )}
                      {order.medium && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                          >
                            Medium
                          </p>
                          <p
                            className="text-xs font-medium capitalize"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            {order.medium}
                          </p>
                        </div>
                      )}
                      {order.dimensions && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                          >
                            Dimensions
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            {order.dimensions}
                          </p>
                        </div>
                      )}
                      {order.deadline && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#9CA3AF' }}
                          >
                            Deadline
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
                          >
                            {new Date(order.deadline).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reference images */}
                    <ImageGallery
                      images={order.referenceImages || order.references}
                      label="Your Reference Images"
                    />

                    {/* Progress images from artist */}
                    <ImageGallery
                      images={order.progressImages || order.progress}
                      label="Progress Updates"
                    />

                    {/* Admin notes */}
                    {order.adminNotes && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: '#92400E' }}
                        >
                          Artist Notes
                        </p>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: '#78350F' }}
                        >
                          {order.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CustomOrderTracker;
