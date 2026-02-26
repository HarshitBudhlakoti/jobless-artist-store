import { useState, useEffect } from 'react';
import { FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { invalidateCache } from '../../hooks/useSiteContent';

const sectionConfig = [
  { key: 'contact', label: 'Contact Information' },
  { key: 'socialLinks', label: 'Social Media Links' },
  { key: 'footer', label: 'Footer Settings' },
  { key: 'artistStats', label: 'Artist Stats' },
];

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState({ contact: true });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/site-settings');
      if (res.data?.success) setSettings(res.data.data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handlePaymentMethodsChange = (value) => {
    const methods = value.split(',').map((m) => m.trim()).filter(Boolean);
    setSettings((prev) => ({
      ...prev,
      footer: { ...prev.footer, paymentMethods: methods },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { contact, socialLinks, footer, artistStats } = settings;
      await api.put('/site-settings', { contact, socialLinks, footer, artistStats });
      invalidateCache('settings');
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return <p className="text-center py-10 text-gray-500">Failed to load settings.</p>;

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39] outline-none transition-colors font-['DM_Sans']";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5 font-['DM_Sans']";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1 font-['DM_Sans']">
            Manage contact info, social links, footer, and artist stats.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C75B39] text-white text-sm font-semibold rounded-lg hover:bg-[#B04E30] transition-colors disabled:opacity-50 font-['DM_Sans']"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Accordion sections */}
      {sectionConfig.map(({ key, label }) => (
        <div
          key={key}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <button
            onClick={() => toggleSection(key)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-base font-semibold text-gray-900 font-['DM_Sans']">{label}</h2>
            {openSections[key] ? (
              <FiChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSections[key] && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
              {key === 'contact' && (
                <>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      className={inputClass}
                      value={settings.contact?.email || ''}
                      onChange={(e) => handleChange('contact', 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      className={inputClass}
                      value={settings.contact?.phone || ''}
                      onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={settings.contact?.address || ''}
                      onChange={(e) => handleChange('contact', 'address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Working Hours</label>
                    <input
                      className={inputClass}
                      value={settings.contact?.workingHours || ''}
                      onChange={(e) => handleChange('contact', 'workingHours', e.target.value)}
                    />
                  </div>
                </>
              )}

              {key === 'socialLinks' && (
                <>
                  {['instagram', 'pinterest', 'facebook', 'twitter', 'youtube'].map((platform) => (
                    <div key={platform}>
                      <label className={labelClass}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                      <input
                        className={inputClass}
                        placeholder={`https://${platform}.com/...`}
                        value={settings.socialLinks?.[platform] || ''}
                        onChange={(e) => handleChange('socialLinks', platform, e.target.value)}
                      />
                    </div>
                  ))}
                </>
              )}

              {key === 'footer' && (
                <>
                  <div>
                    <label className={labelClass}>Brand Description</label>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={settings.footer?.brandDescription || ''}
                      onChange={(e) => handleChange('footer', 'brandDescription', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Copyright Text</label>
                    <input
                      className={inputClass}
                      value={settings.footer?.copyrightText || ''}
                      onChange={(e) => handleChange('footer', 'copyrightText', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Payment Methods (comma-separated)</label>
                    <input
                      className={inputClass}
                      value={(settings.footer?.paymentMethods || []).join(', ')}
                      onChange={(e) => handlePaymentMethodsChange(e.target.value)}
                    />
                  </div>
                </>
              )}

              {key === 'artistStats' && (
                <>
                  {[
                    { field: 'paintingsCreated', label: 'Paintings Created' },
                    { field: 'happyClients', label: 'Happy Clients' },
                    { field: 'yearsOfPassion', label: 'Years of Passion' },
                  ].map(({ field, label: fieldLabel }) => (
                    <div key={field}>
                      <label className={labelClass}>{fieldLabel}</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={settings.artistStats?.[field] ?? 0}
                        onChange={(e) =>
                          handleChange('artistStats', field, parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
