const express = require('express');
const router = express.Router();
const { createSection, getSections, addSectionItem, getSectionItems, deleteSection, deleteSectionItem, updateSection, updateSectionItem } = require('../controllers/sectionController');
const { upload, handleUploadError } = require('../middleware/upload');

// Section CRUD
router.post('/section', createSection);
router.get('/sections', getSections);
router.put('/section/:sectionId', updateSection);
router.delete('/section/:sectionId', deleteSection);

// Section Items CRUD
router.post('/section/item', upload.single('file'), handleUploadError, addSectionItem);
router.get('/section/items', getSectionItems);
router.put('/section/item/:itemId', upload.single('file'), handleUploadError, updateSectionItem);
router.delete('/section/item/:itemId', deleteSectionItem);

module.exports = router;