const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Temporary endpoint to fix database columns
router.post('/fix-db-columns', async (req, res) => {
  try {
    console.log('🔧 Starting database column fixes via API...');
    
    // Fix file_path column to TEXT
    await pool.execute(`
      ALTER TABLE section_items 
      MODIFY COLUMN file_path TEXT
    `);
    
    // Fix file_type column to VARCHAR(50)
    await pool.execute(`
      ALTER TABLE section_items 
      MODIFY COLUMN file_type VARCHAR(50)
    `);
    
    console.log('✅ Database columns fixed successfully');
    res.json({ 
      success: true, 
      message: 'Database columns fixed successfully',
      changes: {
        file_path: 'TEXT',
        file_type: 'VARCHAR(50)'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing database columns:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
  }
});

module.exports = router; 