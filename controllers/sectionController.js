const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Helper function to get user ID from profile ID or use default
const getUserId = async (profileId) => {
  if (profileId) {
    const [userRows] = await pool.execute(
      'SELECT id FROM users WHERE profile_id = ?',
      [profileId]
    );
    if (userRows.length > 0) {
      return userRows[0].id;
    }
  }
  return 1; // Default user ID for backward compatibility
};

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const { userId, name, icon, profileId } = req.body;
    const actualUserId = profileId ? await getUserId(profileId) : userId;
    const [result] = await pool.execute(
      'INSERT INTO sections (user_id, name, icon) VALUES (?, ?, ?)',
      [actualUserId, name, icon]
    );
    res.json({ id: result.insertId, name, icon });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create section' });
  }
};

// Get all sections for a user
exports.getSections = async (req, res) => {
  try {
    const { userId, profileId } = req.query;
    const actualUserId = profileId ? await getUserId(profileId) : userId;
    const [sections] = await pool.execute(
      'SELECT * FROM sections WHERE user_id = ? ORDER BY section_order, id',
      [actualUserId]
    );
    res.json({ sections });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
};

// Add item to a section
exports.addSectionItem = async (req, res) => {
  try {
    const { sectionId, title, icon, description } = req.body;
    let file_path = null, file_type = null;
    if (req.file) {
      file_path = req.file.filename;
      file_type = req.file.mimetype.startsWith('image/') ? 'image'
                : req.file.mimetype.startsWith('video/') ? 'video'
                : 'file';
    }
    const [result] = await pool.execute(
      'INSERT INTO section_items (section_id, title, icon, file_path, file_type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [sectionId, title, icon, file_path, file_type, description]
    );
    res.json({ id: result.insertId, title, icon, file_path, file_type, description });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// Get items for a section
exports.getSectionItems = async (req, res) => {
  try {
    const { sectionId } = req.query;
    const [items] = await pool.execute(
      'SELECT * FROM section_items WHERE section_id = ? ORDER BY id',
      [sectionId]
    );
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Delete a section (and its items)
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    await pool.execute('DELETE FROM sections WHERE id = ?', [sectionId]);
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete section' });
  }
};

// Delete an item
exports.deleteSectionItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    // Optionally: delete file from disk
    const [rows] = await pool.execute('SELECT file_path FROM section_items WHERE id = ?', [itemId]);
    if (rows.length && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.execute('DELETE FROM section_items WHERE id = ?', [itemId]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, icon, profileId } = req.body;
    const actualUserId = profileId ? await getUserId(profileId) : 1;
    
    await pool.execute(
      'UPDATE sections SET name = ?, icon = ? WHERE id = ? AND user_id = ?',
      [name, icon, sectionId, actualUserId]
    );
    res.json({ message: 'Section updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update section' });
  }
};

// Update a section item
exports.updateSectionItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { title, icon, description } = req.body;
    let file_path = null, file_type = null;
    
    if (req.file) {
      file_path = req.file.filename;
      file_type = req.file.mimetype.startsWith('image/') ? 'image'
                : req.file.mimetype.startsWith('video/') ? 'video'
                : 'file';
    }
    
    if (file_path) {
      await pool.execute(
        'UPDATE section_items SET title = ?, icon = ?, description = ?, file_path = ?, file_type = ? WHERE id = ?',
        [title, icon, description, file_path, file_type, itemId]
      );
    } else {
      await pool.execute(
        'UPDATE section_items SET title = ?, icon = ?, description = ? WHERE id = ?',
        [title, icon, description, itemId]
      );
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error updating section item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};