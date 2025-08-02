const express = require('express');
const router = express.Router();
const { 
  addHobby,
  updateHobby, 
  addProject,
  updateProject, 
  addSkill,
  updateSkill,
  deleteHobby,
  deleteProject,
  deleteSkill,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  addAdventure,
  updateAdventure,
  deleteAdventure
} = require('../controllers/contentController');
const { upload, handleUploadError } = require('../middleware/upload');

// Hobby routes (no auth required - uses profile ID)
router.post('/hobbies', upload.single('file'), handleUploadError, addHobby);
router.put('/hobbies/:id', upload.single('file'), handleUploadError, updateHobby);
router.delete('/hobbies/:id', deleteHobby);

// Project routes (no auth required - uses profile ID)
router.post('/projects', upload.single('file'), handleUploadError, addProject);
router.put('/projects/:id', upload.single('file'), handleUploadError, updateProject);
router.delete('/projects/:id', deleteProject);

// Skill routes (no auth required - uses profile ID)
router.post('/skills', upload.single('file'), handleUploadError, addSkill);
router.put('/skills/:id', upload.single('file'), handleUploadError, updateSkill);
router.delete('/skills/:id', deleteSkill);

// Certificate routes (no auth required - uses profile ID)
router.post('/certificates', upload.single('file'), handleUploadError, addCertificate);
router.put('/certificates/:id', upload.single('file'), handleUploadError, updateCertificate);
router.delete('/certificates/:id', deleteCertificate);

// Achievement routes (no auth required - uses profile ID)
router.post('/achievements', upload.single('file'), handleUploadError, addAchievement);
router.put('/achievements/:id', upload.single('file'), handleUploadError, updateAchievement);
router.delete('/achievements/:id', deleteAchievement);

// Adventure routes (no auth required - uses profile ID)
router.post('/adventures', upload.single('file'), handleUploadError, addAdventure);
router.put('/adventures/:id', upload.single('file'), handleUploadError, updateAdventure);
router.delete('/adventures/:id', deleteAdventure);

module.exports = router;
