import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { invalidateCache } from '../../hooks/useSiteContent';

const TABS = [
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
  { key: 'policies', label: 'Policies' },
];

const HOMEPAGE_SECTIONS = ['hero', 'artistStory', 'customOrderCTA', 'categoriesGrid'];
const ABOUT_SECTIONS = ['aboutPage'];
const CONTACT_SECTIONS = ['contactFAQ'];
const POLICY_SECTIONS = ['shippingPolicy', 'termsAndConditions', 'privacyPolicy'];

const SECTION_LABELS = {
  hero: 'Hero Section',
  artistStory: 'Artist Story',
  customOrderCTA: 'Custom Order CTA',
  categoriesGrid: 'Categories Grid',
  aboutPage: 'About Page',
  contactFAQ: 'Contact FAQs',
  shippingPolicy: 'Shipping Policy',
  termsAndConditions: 'Terms & Conditions',
  privacyPolicy: 'Privacy Policy',
};

function getSectionsForTab(tab) {
  switch (tab) {
    case 'homepage': return HOMEPAGE_SECTIONS;
    case 'about': return ABOUT_SECTIONS;
    case 'contact': return CONTACT_SECTIONS;
    case 'policies': return POLICY_SECTIONS;
    default: return [];
  }
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#C75B39] focus:ring-1 focus:ring-[#C75B39] outline-none transition-colors font-['DM_Sans']";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5 font-['DM_Sans']";
const btnSmClass =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-['DM_Sans']";

// Generic list editor for arrays of objects (sections, features, etc.)
function ListEditor({ items, setItems, fields, label }) {
  const addItem = () => {
    const empty = {};
    fields.forEach((f) => (empty[f.key] = ''));
    setItems([...items, empty]);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };
    setItems(copy);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={labelClass}>{label}</span>
        <button onClick={addItem} className={`${btnSmClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}>
          <FiPlus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex-1 space-y-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 mb-0.5 block font-['DM_Sans']">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={item[f.key] || ''}
                    onChange={(e) => updateItem(idx, f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={item[f.key] || ''}
                    onChange={(e) => updateItem(idx, f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => removeItem(idx)}
            className="mt-6 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Content array editor (for policy pages that use string arrays)
function ContentArrayEditor({ items, setItems, label }) {
  const addItem = () => setItems([...items, '']);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, value) => {
    const copy = [...items];
    copy[idx] = value;
    setItems(copy);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-['DM_Sans']">{label}</span>
        <button onClick={addItem} className={`${btnSmClass} bg-gray-100 text-gray-600 hover:bg-gray-200`}>
          <FiPlus className="w-3 h-3" /> Add Line
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <textarea
            className={`${inputClass} flex-1`}
            rows={1}
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
          />
          <button
            onClick={() => removeItem(idx)}
            className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Section-specific editors
function HeroEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });
  const ctaButtons = content.ctaButtons || [];
  const setCtaButtons = (val) => setContent({ ...content, ctaButtons: val });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Heading</label>
        <input className={inputClass} value={content.heading || ''} onChange={(e) => update('heading', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Subtitle</label>
        <textarea className={inputClass} rows={2} value={content.subtitle || ''} onChange={(e) => update('subtitle', e.target.value)} />
      </div>
      <ListEditor
        items={ctaButtons}
        setItems={setCtaButtons}
        fields={[
          { key: 'label', label: 'Button Label' },
          { key: 'link', label: 'Link' },
        ]}
        label="CTA Buttons"
      />
    </div>
  );
}

function ArtistStoryEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });
  const paragraphs = content.paragraphs || [];

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Section Title</label>
        <input className={inputClass} value={content.sectionTitle || ''} onChange={(e) => update('sectionTitle', e.target.value)} />
      </div>
      <ContentArrayEditor
        items={paragraphs}
        setItems={(val) => update('paragraphs', val)}
        label="Story Paragraphs"
      />
      <div>
        <label className={labelClass}>Signature Line</label>
        <input className={inputClass} value={content.signatureLine || ''} onChange={(e) => update('signatureLine', e.target.value)} />
      </div>
    </div>
  );
}

function CustomOrderCTAEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });
  const features = content.features || [];

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Heading</label>
        <input className={inputClass} value={content.heading || ''} onChange={(e) => update('heading', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Heading Accent</label>
        <input className={inputClass} value={content.headingAccent || ''} onChange={(e) => update('headingAccent', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Paragraph 1</label>
        <textarea className={inputClass} rows={2} value={content.paragraph1 || ''} onChange={(e) => update('paragraph1', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Paragraph 2</label>
        <textarea className={inputClass} rows={2} value={content.paragraph2 || ''} onChange={(e) => update('paragraph2', e.target.value)} />
      </div>
      <ContentArrayEditor
        items={features}
        setItems={(val) => update('features', val)}
        label="Features"
      />
      <div>
        <label className={labelClass}>CTA Text</label>
        <input className={inputClass} value={content.ctaText || ''} onChange={(e) => update('ctaText', e.target.value)} />
      </div>
    </div>
  );
}

function CategoriesGridEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });
  const categories = content.categories || [];
  const setCategories = (val) => setContent({ ...content, categories: val });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Section Title</label>
        <input className={inputClass} value={content.sectionTitle || ''} onChange={(e) => update('sectionTitle', e.target.value)} />
      </div>
      <ListEditor
        items={categories}
        setItems={setCategories}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
          { key: 'description', label: 'Description' },
          { key: 'gradient', label: 'Gradient CSS' },
        ]}
        label="Categories"
      />
    </div>
  );
}

function AboutPageEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Hero Title</label>
        <input className={inputClass} value={content.heroTitle || ''} onChange={(e) => update('heroTitle', e.target.value)} />
      </div>
      <ListEditor
        items={content.storySections || []}
        setItems={(val) => update('storySections', val)}
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'text', label: 'Text', type: 'textarea' },
        ]}
        label="Story Sections"
      />
      <ListEditor
        items={content.values || []}
        setItems={(val) => update('values', val)}
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'desc', label: 'Description', type: 'textarea' },
        ]}
        label="Values"
      />
      <ListEditor
        items={content.processSteps || []}
        setItems={(val) => update('processSteps', val)}
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'desc', label: 'Description', type: 'textarea' },
        ]}
        label="Process Steps"
      />
    </div>
  );
}

function ContactFAQEditor({ content, setContent }) {
  const items = content.items || [];
  const setItems = (val) => setContent({ ...content, items: val });

  return (
    <ListEditor
      items={items}
      setItems={setItems}
      fields={[
        { key: 'question', label: 'Question' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
      ]}
      label="FAQ Items"
    />
  );
}

function PolicyEditor({ content, setContent }) {
  const update = (field, value) => setContent({ ...content, [field]: value });
  const sections = content.sections || [];

  const updateSection = (idx, field, value) => {
    const copy = [...sections];
    copy[idx] = { ...copy[idx], [field]: value };
    setContent({ ...content, sections: copy });
  };

  const addSection = () => {
    setContent({ ...content, sections: [...sections, { title: '', content: [''] }] });
  };

  const removeSection = (idx) => {
    setContent({ ...content, sections: sections.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Page Title</label>
        <input className={inputClass} value={content.pageTitle || ''} onChange={(e) => update('pageTitle', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Last Updated</label>
        <input className={inputClass} value={content.lastUpdated || ''} onChange={(e) => update('lastUpdated', e.target.value)} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Sections</span>
          <button onClick={addSection} className={`${btnSmClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}>
            <FiPlus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>
        {sections.map((section, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 font-['DM_Sans']">Section {idx + 1}</label>
              <button
                onClick={() => removeSection(idx)}
                className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Section Title"
              value={section.title || ''}
              onChange={(e) => updateSection(idx, 'title', e.target.value)}
            />
            <ContentArrayEditor
              items={Array.isArray(section.content) ? section.content : [section.content || '']}
              setItems={(val) => updateSection(idx, 'content', val)}
              label="Content Lines"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEditor({ sectionKey, content, setContent }) {
  switch (sectionKey) {
    case 'hero':
      return <HeroEditor content={content} setContent={setContent} />;
    case 'artistStory':
      return <ArtistStoryEditor content={content} setContent={setContent} />;
    case 'customOrderCTA':
      return <CustomOrderCTAEditor content={content} setContent={setContent} />;
    case 'categoriesGrid':
      return <CategoriesGridEditor content={content} setContent={setContent} />;
    case 'aboutPage':
      return <AboutPageEditor content={content} setContent={setContent} />;
    case 'contactFAQ':
      return <ContactFAQEditor content={content} setContent={setContent} />;
    case 'shippingPolicy':
    case 'termsAndConditions':
    case 'privacyPolicy':
      return <PolicyEditor content={content} setContent={setContent} />;
    default:
      return <p className="text-sm text-gray-500">No editor available for this section.</p>;
  }
}

export default function PageContentManager() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [activeSection, setActiveSection] = useState(null);
  const [sectionData, setSectionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionsForTab = getSectionsForTab(activeTab);

  useEffect(() => {
    setActiveSection(sectionsForTab[0] || null);
  }, [activeTab]);

  useEffect(() => {
    if (!activeSection) return;
    if (sectionData[activeSection] !== undefined) return;
    loadSection(activeSection);
  }, [activeSection]);

  const loadSection = async (key) => {
    setLoading(true);
    try {
      const res = await api.get(`/page-content/${key}`);
      setSectionData((prev) => ({
        ...prev,
        [key]: res.data?.data?.content || {},
      }));
    } catch {
      setSectionData((prev) => ({ ...prev, [key]: {} }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeSection) return;
    setSaving(true);
    try {
      await api.put(`/page-content/${activeSection}`, {
        content: sectionData[activeSection],
      });
      invalidateCache(activeSection);
      toast.success(`${SECTION_LABELS[activeSection]} saved successfully`);
    } catch {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const setContent = (data) => {
    setSectionData((prev) => ({ ...prev, [activeSection]: data }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">Page Content</h1>
          <p className="text-sm text-gray-500 mt-1 font-['DM_Sans']">
            Edit text content across all pages.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !activeSection}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C75B39] text-white text-sm font-semibold rounded-lg hover:bg-[#B04E30] transition-colors disabled:opacity-50 font-['DM_Sans']"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-['DM_Sans'] ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section selector + editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section list */}
        <div className="lg:col-span-1 space-y-1">
          {sectionsForTab.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors font-['DM_Sans'] ${
                activeSection === key
                  ? 'bg-[#C75B39]/10 text-[#C75B39] border border-[#C75B39]/20'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div
          className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeSection && sectionData[activeSection] !== undefined ? (
            <SectionEditor
              sectionKey={activeSection}
              content={sectionData[activeSection]}
              setContent={setContent}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-10 font-['DM_Sans']">
              Select a section to edit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
