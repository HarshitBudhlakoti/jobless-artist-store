const cloudinary = require('../config/cloudinary');

// @desc    Upload a single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        public_id: req.file.filename,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an image from Cloudinary
// @route   DELETE /api/upload/image/:public_id
// @access  Private
const deleteImage = async (req, res, next) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Image public_id is required',
      });
    }

    // Reconstruct full public_id (folder/filename)
    const fullPublicId = `jobless-artist/${public_id}`;

    const result = await cloudinary.uploader.destroy(fullPublicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else if (result.result === 'not found') {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
};
