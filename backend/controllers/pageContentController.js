const PageContent = require('../models/PageContent');

const SECTION_KEY_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;
const MAX_CONTENT_SIZE = 100000; // 100KB

// @desc    Get a single section by key
// @route   GET /api/page-content/:sectionKey
// @access  Public
const getSection = async (req, res, next) => {
  try {
    if (!SECTION_KEY_REGEX.test(req.params.sectionKey)) {
      return res.status(400).json({ success: false, message: 'Invalid section key format' });
    }

    const section = await PageContent.findOne({ sectionKey: req.params.sectionKey });
    if (!section) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sections (optionally filtered by keys)
// @route   GET /api/page-content
// @access  Public
const getAllSections = async (req, res, next) => {
  try {
    const { keys } = req.query;
    let filter = {};
    if (keys) {
      const keyArray = keys.split(',').slice(0, 20); // max 20 keys
      // Validate each key
      for (const k of keyArray) {
        if (!SECTION_KEY_REGEX.test(k.trim())) {
          return res.status(400).json({ success: false, message: 'Invalid section key format' });
        }
      }
      filter = { sectionKey: { $in: keyArray.map((k) => k.trim()) } };
    }
    const sections = await PageContent.find(filter).sort({ sectionKey: 1 });
    res.json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a section
// @route   PUT /api/page-content/:sectionKey
// @access  Admin
const upsertSection = async (req, res, next) => {
  try {
    if (!SECTION_KEY_REGEX.test(req.params.sectionKey)) {
      return res.status(400).json({ success: false, message: 'Invalid section key format' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Validate content size
    const contentSize = JSON.stringify(content).length;
    if (contentSize > MAX_CONTENT_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Content is too large (${Math.round(contentSize / 1024)}KB). Max 100KB allowed.`,
      });
    }

    const section = await PageContent.findOneAndUpdate(
      { sectionKey: req.params.sectionKey },
      { sectionKey: req.params.sectionKey, content },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSection, getAllSections, upsertSection };
