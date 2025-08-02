const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updateProfilePicture,
  updateCoverImage,
  createProfile,
  getProfileById,
  getProfileByUsername
} = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Create new profile (no auth required)
router.post('/create', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), handleUploadError, createProfile);

// Get profile data (requires auth) - must come before /:profileId
router.get('/', authenticateUser, getProfile);

// Update profile (no auth required - uses profile ID)
router.put('/', updateProfile);

// Update profile picture (no auth required - uses profile ID)
router.post('/picture', upload.single('profilePicture'), handleUploadError, updateProfilePicture);

// Update cover image (no auth required - uses profile ID)
router.post('/cover', upload.single('coverImage'), handleUploadError, updateCoverImage);

// Get profile by username (no auth required)
router.get('/username/:username', getProfileByUsername);

// Get profile by ID (no auth required) - must come last
router.get('/:profileId', getProfileById);

module.exports = router;