const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

// Create new profile
const createProfile = async (req, res) => {
  try {
    const { name, username, intro_text, highlights } = req.body;
    
    if (!name || !username || !intro_text || !highlights) {
      return res.status(400).json({ error: 'Name, username, intro text, and highlights are required' });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check if username already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already taken. Please choose a different one.' });
    }

    // Generate unique profile ID
    const profileId = uuidv4().replace(/-/g, '').substring(0, 12);
    
    // Create user record
    const [userResult] = await pool.execute(
      'INSERT INTO users (profile_id, username, name, intro_text) VALUES (?, ?, ?, ?)',
      [profileId, username, name, intro_text]
    );
    
    const userId = userResult.insertId;
    
    // Handle profile picture
    let profilePictureFilename = null;
    if (req.files && req.files.profilePicture) {
      profilePictureFilename = req.files.profilePicture[0].filename;
      await pool.execute(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePictureFilename, userId]
      );
    }
    
    // Handle cover image
    let coverImageFilename = null;
    if (req.files && req.files.coverImage) {
      coverImageFilename = req.files.coverImage[0].filename;
      await pool.execute(
        'UPDATE users SET cover_image = ? WHERE id = ?',
        [coverImageFilename, userId]
      );
    }
    
    // Create highlights
    const highlightsArray = highlights.split(',').map(h => h.trim()).filter(h => h);
    for (const highlight of highlightsArray) {
      await pool.execute(
        'INSERT INTO highlights (user_id, highlight_text) VALUES (?, ?)',
        [userId, highlight]
      );
    }
    
    res.json({ 
      message: 'Profile created successfully',
      profileId: profileId,
      userId: userId
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get profile by ID
const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE profile_id = ?',
      [profileId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const user = userRows[0];
    
    // Get highlights
    const [highlightRows] = await pool.execute(
      'SELECT highlight_text FROM highlights WHERE user_id = ?',
      [user.id]
    );
    
    // Get sections and their items
    const [sectionRows] = await pool.execute(
      'SELECT * FROM sections WHERE user_id = ? ORDER BY created_at ASC',
      [user.id]
    );
    
    const sections = [];
    for (const section of sectionRows) {
      const [itemRows] = await pool.execute(
        'SELECT * FROM section_items WHERE section_id = ? ORDER BY created_at ASC',
        [section.id]
      );
      sections.push({
        ...section,
        items: itemRows
      });
    }
    
    res.json({
      user: {
        ...user,
        highlights: highlightRows.map(h => h.highlight_text)
      },
      sections: sections
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get profile by username
const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const user = userRows[0];
    
    // Get highlights
    const [highlightRows] = await pool.execute(
      'SELECT highlight_text FROM highlights WHERE user_id = ?',
      [user.id]
    );
    
    // Get sections and their items
    const [sectionRows] = await pool.execute(
      'SELECT * FROM sections WHERE user_id = ? ORDER BY created_at ASC',
      [user.id]
    );
    
    const sections = [];
    for (const section of sectionRows) {
      const [itemRows] = await pool.execute(
        'SELECT * FROM section_items WHERE section_id = ? ORDER BY created_at ASC',
        [section.id]
      );
      sections.push({
        ...section,
        items: itemRows
      });
    }
    
    res.json({
      user: {
        ...user,
        highlights: highlightRows.map(h => h.highlight_text)
      },
      sections: sections
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get profile data (for authenticated users)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const user = userRows[0];
    
    // Get highlights
    const [highlightRows] = await pool.execute(
      'SELECT highlight_text FROM highlights WHERE user_id = ?',
      [userId]
    );
    
    // Get sections and their items
    const [sectionRows] = await pool.execute(
      'SELECT * FROM sections WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );
    
    const sections = [];
    for (const section of sectionRows) {
      const [itemRows] = await pool.execute(
        'SELECT * FROM section_items WHERE section_id = ? ORDER BY created_at ASC',
        [section.id]
      );
      sections.push({
        ...section,
        items: itemRows
      });
    }
    
    res.json({
      user: {
        ...user,
        highlights: highlightRows.map(h => h.highlight_text)
      },
      sections: sections
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { profileId, name, intro_text, highlights } = req.body;
    const userId = await getUserId(profileId);
    
    if (!name || !intro_text || !highlights) {
      return res.status(400).json({ error: 'Name, intro text, and highlights are required' });
    }
    
    // Update user info
    await pool.execute(
      'UPDATE users SET name = ?, intro_text = ? WHERE id = ?',
      [name, intro_text, userId]
    );
    
    // Delete existing highlights
    await pool.execute('DELETE FROM highlights WHERE user_id = ?', [userId]);
    
    // Create new highlights
    const highlightsArray = highlights.split(',').map(h => h.trim()).filter(h => h);
    for (const highlight of highlightsArray) {
      await pool.execute(
        'INSERT INTO highlights (user_id, highlight_text) VALUES (?, ?)',
        [userId, highlight]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const { profileId } = req.body;
    const userId = await getUserId(profileId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get current profile picture
    const [userRows] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    
    // Delete old profile picture if exists
    if (userRows.length > 0 && userRows[0].profile_picture && !userRows[0].profile_picture.startsWith('user.')) {
      const oldFilePath = path.join('./uploads', userRows[0].profile_picture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Update profile picture
    await pool.execute(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [req.file.filename, userId]
    );
    
    res.json({ 
      message: 'Profile picture updated successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update cover image
const updateCoverImage = async (req, res) => {
  try {
    const { profileId } = req.body;
    const userId = await getUserId(profileId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get current cover image
    const [userRows] = await pool.execute(
      'SELECT cover_image FROM users WHERE id = ?',
      [userId]
    );
    
    // Delete old cover image if exists
    if (userRows.length > 0 && userRows[0].cover_image) {
      const oldFilePath = path.join('./uploads', userRows[0].cover_image);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Update cover image
    await pool.execute(
      'UPDATE users SET cover_image = ? WHERE id = ?',
      [req.file.filename, userId]
    );
    
    res.json({ 
      message: 'Cover image updated successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProfile,
  getProfileById,
  getProfileByUsername,
  getProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverImage
};