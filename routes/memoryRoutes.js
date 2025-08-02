const express = require('express');
const router = express.Router();
const { getMemories, uploadMemory, deleteMemory } = require('../controllers/memoryController');
const { upload, handleUploadError } = require('../middleware/upload');

// Memory routes (no auth required - uses profile ID)
router.get('/', getMemories);
router.post('/', upload.single('memory'), handleUploadError, uploadMemory);
router.delete('/:id', deleteMemory);

module.exports = router;
