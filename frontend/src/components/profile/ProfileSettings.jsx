import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiPhone,
  FiCamera,
  FiMapPin,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheck,
  FiSave,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import { getInitials, getImageUrl } from '../../utils/helpers';

const errorVariants = {
  initial: { opacity: 0, y: -8, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.2 } },
};

/* ---- Section wrapper ---- */
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6">
    <h3
      className="text-lg font-bold flex items-center gap-2 mb-5"
      style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C' }}
    >
      <Icon size={18} style={{ color: '#C75B39' }} />
      {title}
    </h3>
    {children}
  </div>
);

/* ---- Input field ---- */
const InputField = ({ id, label, icon: Icon, error, ...inputProps }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium mb-1.5"
      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      )}
      <input
        id={id}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-200
          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#C75B39]'}
          bg-white placeholder-gray-400`}
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
        {...inputProps}
      />
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          variants={errorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mt-1 text-xs text-red-500 flex items-center gap-1"
        >
          <FiAlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ---- Save button ---- */
const SaveButton = ({ loading, onClick, label = 'Save Changes' }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.01 }}
    whileTap={{ scale: loading ? 1 : 0.98 }}
    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold
               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#C75B39',
      boxShadow: '0 2px 8px rgba(199,91,57,0.2)',
    }}
  >
    {loading ? (
      <>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Saving...
      </>
    ) : (
      <>
        <FiSave size={15} />
        {label}
      </>
    )}
  </motion.button>
);

const ProfileSettings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const fileInputRef = useRef(null);

  /* ---- Profile state ---- */
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  /* ---- Address state ---- */
  const [addressData, setAddressData] = useState({
    street: user?.address?.street || user?.address?.address || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || user?.address?.zipCode || user?.address?.pincode || '',
    country: user?.address?.country || 'India',
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressLoading, setAddressLoading] = useState(false);

  /* ---- Password state ---- */
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ---- Avatar handling ---- */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ---- Save profile ---- */
  const handleSaveProfile = async () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (profileData.phone && !/^[+]?[\d\s-]{7,15}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;

    setProfileLoading(true);
    try {
      // If avatar file, upload via FormData
      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', profileData.name);
        if (profileData.phone) formData.append('phone', profileData.phone);
        formData.append('avatar', avatarFile);

        const { data } = await api.put('/auth/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const userData = data.user || data;
        // Manually update the auth context user
        await updateProfile({ name: userData.name, phone: userData.phone });
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        await updateProfile({
          name: profileData.name,
          phone: profileData.phone,
        });
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ---- Save address ---- */
  const handleSaveAddress = async () => {
    const errors = {};
    if (!addressData.street.trim()) errors.street = 'Street address is required';
    if (!addressData.city.trim()) errors.city = 'City is required';
    if (!addressData.state.trim()) errors.state = 'State is required';
    if (!addressData.zip.trim()) errors.zip = 'ZIP/Postal code is required';
    setAddressErrors(errors);
    if (Object.keys(errors).length) return;

    setAddressLoading(true);
    try {
      await updateProfile({ address: addressData });
      toast.success('Address updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setAddressLoading(false);
    }
  };

  /* ---- Change password ---- */
  const handleChangePassword = async () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setPasswordLoading(true);
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result?.success !== false) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* ======== Profile Section ======== */}
      <Section title="Profile Information" icon={FiUser}>
        {/* Avatar upload */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            {avatarPreview || user?.avatar ? (
              <img
                src={avatarPreview || getImageUrl(user.avatar, 96, 96)}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover border-2"
                style={{ borderColor: '#C75B39' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #C75B39, #D4A857)',
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {getInitials(user?.name)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Upload avatar"
            >
              <FiCamera className="text-white" size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            >
              Profile Photo
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B6B6B' }}
            >
              JPG, PNG. Max 5MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <InputField
            id="settings-name"
            label="Full Name"
            icon={FiUser}
            value={profileData.name}
            onChange={(e) => {
              setProfileData((p) => ({ ...p, name: e.target.value }));
              if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: '' }));
            }}
            placeholder="Your full name"
            error={profileErrors.name}
          />
          <InputField
            id="settings-phone"
            label="Phone Number"
            icon={FiPhone}
            value={profileData.phone}
            onChange={(e) => {
              setProfileData((p) => ({ ...p, phone: e.target.value }));
              if (profileErrors.phone) setProfileErrors((p) => ({ ...p, phone: '' }));
            }}
            placeholder="+91 98765 43210"
            type="tel"
            error={profileErrors.phone}
          />
        </div>

        <SaveButton loading={profileLoading} onClick={handleSaveProfile} label="Save Profile" />
      </Section>

      {/* ======== Address Section ======== */}
      <Section title="Shipping Address" icon={FiMapPin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="sm:col-span-2">
            <InputField
              id="settings-street"
              label="Street Address"
              value={addressData.street}
              onChange={(e) => {
                setAddressData((p) => ({ ...p, street: e.target.value }));
                if (addressErrors.street) setAddressErrors((p) => ({ ...p, street: '' }));
              }}
              placeholder="123 Art Lane, Apt 4B"
              error={addressErrors.street}
            />
          </div>
          <InputField
            id="settings-city"
            label="City"
            value={addressData.city}
            onChange={(e) => {
              setAddressData((p) => ({ ...p, city: e.target.value }));
              if (addressErrors.city) setAddressErrors((p) => ({ ...p, city: '' }));
            }}
            placeholder="Mumbai"
            error={addressErrors.city}
          />
          <InputField
            id="settings-state"
            label="State"
            value={addressData.state}
            onChange={(e) => {
              setAddressData((p) => ({ ...p, state: e.target.value }));
              if (addressErrors.state) setAddressErrors((p) => ({ ...p, state: '' }));
            }}
            placeholder="Maharashtra"
            error={addressErrors.state}
          />
          <InputField
            id="settings-zip"
            label="ZIP / Postal Code"
            value={addressData.zip}
            onChange={(e) => {
              setAddressData((p) => ({ ...p, zip: e.target.value }));
              if (addressErrors.zip) setAddressErrors((p) => ({ ...p, zip: '' }));
            }}
            placeholder="400001"
            error={addressErrors.zip}
          />
          <InputField
            id="settings-country"
            label="Country"
            value={addressData.country}
            onChange={(e) => setAddressData((p) => ({ ...p, country: e.target.value }))}
            placeholder="India"
          />
        </div>

        <SaveButton loading={addressLoading} onClick={handleSaveAddress} label="Save Address" />
      </Section>

      {/* ======== Password Section ======== */}
      <Section title="Change Password" icon={FiLock}>
        <div className="space-y-4 mb-5 max-w-md">
          {/* Current password */}
          <div>
            <label
              htmlFor="settings-current-password"
              className="block text-sm font-medium mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            >
              Current Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="settings-current-password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData((p) => ({ ...p, currentPassword: e.target.value }));
                  if (passwordErrors.currentPassword) setPasswordErrors((p) => ({ ...p, currentPassword: '' }));
                }}
                placeholder="Enter current password"
                autoComplete="current-password"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm transition-colors duration-200
                  ${passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#C75B39]'}
                  bg-white placeholder-gray-400`}
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <AnimatePresence>
              {passwordErrors.currentPassword && (
                <motion.p
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-1 text-xs text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle size={11} />
                  {passwordErrors.currentPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="settings-new-password"
              className="block text-sm font-medium mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            >
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="settings-new-password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData((p) => ({ ...p, newPassword: e.target.value }));
                  if (passwordErrors.newPassword) setPasswordErrors((p) => ({ ...p, newPassword: '' }));
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm transition-colors duration-200
                  ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#C75B39]'}
                  bg-white placeholder-gray-400`}
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <AnimatePresence>
              {passwordErrors.newPassword && (
                <motion.p
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-1 text-xs text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle size={11} />
                  {passwordErrors.newPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm new password */}
          <div>
            <label
              htmlFor="settings-confirm-password"
              className="block text-sm font-medium mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="settings-confirm-password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }));
                  if (passwordErrors.confirmPassword) setPasswordErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm transition-colors duration-200
                  ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#C75B39]'}
                  bg-white placeholder-gray-400`}
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2C2C2C' }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {/* Match indicator */}
            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-xs text-green-500 flex items-center gap-1"
              >
                <FiCheck size={11} />
                Passwords match
              </motion.p>
            )}
            <AnimatePresence>
              {passwordErrors.confirmPassword && (
                <motion.p
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-1 text-xs text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle size={11} />
                  {passwordErrors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <SaveButton
          loading={passwordLoading}
          onClick={handleChangePassword}
          label="Change Password"
        />
      </Section>
    </div>
  );
};

export default ProfileSettings;
