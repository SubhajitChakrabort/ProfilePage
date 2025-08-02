const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Generic function to get file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/vnd.android.package-archive') return 'apk';
  return 'document';
};

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

// Add new hobby
const addHobby = async (req, res) => {
  try {
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO hobbies (user_id, title, icon, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, icon || 'fa-solid fa-heart', filePath, fileType]
    );
    
    res.json({ 
      message: 'Hobby added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding hobby:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update existing hobby
const updateHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      // Delete old file if exists
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM hobbies WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const updateQuery = req.file 
      ? 'UPDATE hobbies SET title = ?, icon = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE hobbies SET title = ?, icon = ? WHERE id = ? AND user_id = ?';
    
    const params = req.file 
      ? [title, icon, filePath, fileType, id, userId]
      : [title, icon, id, userId];
    
    await pool.execute(updateQuery, params);
    
    res.json({ message: 'Hobby updated successfully' });
  } catch (error) {
    console.error('Error updating hobby:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new project
const addProject = async (req, res) => {
  try {
    const { title, description, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO projects (user_id, title, description, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, filePath, fileType]
    );
    
    res.json({ 
      message: 'Project added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update existing project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      // Delete old file if exists
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM projects WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const updateQuery = req.file 
      ? 'UPDATE projects SET title = ?, description = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE projects SET title = ?, description = ? WHERE id = ? AND user_id = ?';
    
    const params = req.file 
      ? [title, description, filePath, fileType, id, userId]
      : [title, description, id, userId];
    
    await pool.execute(updateQuery, params);
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new skill
const addSkill = async (req, res) => {
  try {
    const { name, icon, color, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO skills (user_id, name, icon, color, file_path, file_type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, icon || 'fa-solid fa-star', color || 'cyan-custom', filePath, fileType]
    );
    
    res.json({ 
      message: 'Skill added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update existing skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    let filePath = null;
    let fileType = null;
    
    if (req.file) {
      // Delete old file if exists
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM skills WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    
    const updateQuery = req.file 
      ? 'UPDATE skills SET name = ?, icon = ?, color = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE skills SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?';
    
    const params = req.file 
      ? [name, icon, color, filePath, fileType, id, userId]
      : [name, icon, color, id, userId];
    
    await pool.execute(updateQuery, params);
    
    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete hobby
const deleteHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Get file path before deletion
    const [rows] = await pool.execute(
      'SELECT file_path FROM hobbies WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.execute('DELETE FROM hobbies WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Hobby deleted successfully' });
  } catch (error) {
    console.error('Error deleting hobby:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Get file path before deletion
    const [rows] = await pool.execute(
      'SELECT file_path FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.execute('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Get file path before deletion
    const [rows] = await pool.execute(
      'SELECT file_path FROM skills WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.execute('DELETE FROM skills WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new certificate
const addCertificate = async (req, res) => {
  try {
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const [result] = await pool.execute(
      'INSERT INTO certificates (user_id, title, icon, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, icon || 'fa-solid fa-certificate', filePath, fileType]
    );
    res.json({ message: 'Certificate added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM certificates WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const updateQuery = req.file
      ? 'UPDATE certificates SET title = ?, icon = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE certificates SET title = ?, icon = ? WHERE id = ? AND user_id = ?';
    const params = req.file
      ? [title, icon, filePath, fileType, id, userId]
      : [title, icon, id, userId];
    await pool.execute(updateQuery, params);
    res.json({ message: 'Certificate updated successfully' });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    const [rows] = await pool.execute(
      'SELECT file_path FROM certificates WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.execute('DELETE FROM certificates WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new achievement
const addAchievement = async (req, res) => {
  try {
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const [result] = await pool.execute(
      'INSERT INTO achievements (user_id, title, icon, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, icon || 'fa-solid fa-trophy', filePath, fileType]
    );
    res.json({ message: 'Achievement added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM achievements WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const updateQuery = req.file
      ? 'UPDATE achievements SET title = ?, icon = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE achievements SET title = ?, icon = ? WHERE id = ? AND user_id = ?';
    const params = req.file
      ? [title, icon, filePath, fileType, id, userId]
      : [title, icon, id, userId];
    await pool.execute(updateQuery, params);
    res.json({ message: 'Achievement updated successfully' });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    const [rows] = await pool.execute(
      'SELECT file_path FROM achievements WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.execute('DELETE FROM achievements WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new adventure
const addAdventure = async (req, res) => {
  try {
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const [result] = await pool.execute(
      'INSERT INTO adventures (user_id, title, icon, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, title, icon || 'fa-solid fa-hiking', filePath, fileType]
    );
    res.json({ message: 'Adventure added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding adventure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAdventure = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, profileId } = req.body;
    const userId = await getUserId(profileId);
    let filePath = null;
    let fileType = null;
    if (req.file) {
      const [oldFile] = await pool.execute(
        'SELECT file_path FROM adventures WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      if (oldFile.length > 0 && oldFile[0].file_path) {
        const oldFilePath = path.join('./uploads', oldFile[0].file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      filePath = req.file.filename;
      fileType = getFileType(req.file.mimetype);
    }
    const updateQuery = req.file
      ? 'UPDATE adventures SET title = ?, icon = ?, file_path = ?, file_type = ? WHERE id = ? AND user_id = ?'
      : 'UPDATE adventures SET title = ?, icon = ? WHERE id = ? AND user_id = ?';
    const params = req.file
      ? [title, icon, filePath, fileType, id, userId]
      : [title, icon, id, userId];
    await pool.execute(updateQuery, params);
    res.json({ message: 'Adventure updated successfully' });
  } catch (error) {
    console.error('Error updating adventure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAdventure = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    const [rows] = await pool.execute(
      'SELECT file_path FROM adventures WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length > 0 && rows[0].file_path) {
      const filePath = path.join('./uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.execute('DELETE FROM adventures WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Adventure deleted successfully' });
  } catch (error) {
    console.error('Error deleting adventure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add image to skill
const addSkillImage = async (req, res) => {
  try {
    const { skillId, profileId } = req.body;
    const userId = await getUserId(profileId);
    
    // Verify skill belongs to user
    const [skillCheck] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );
    
    if (skillCheck.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.filename;
    const fileType = getFileType(req.file.mimetype);
    
    // Get current max display order
    const [maxOrder] = await pool.execute(
      'SELECT COALESCE(MAX(display_order), -1) as max_order FROM skill_images WHERE skill_id = ?',
      [skillId]
    );
    
    const displayOrder = maxOrder[0].max_order + 1;
    
    const [result] = await pool.execute(
      'INSERT INTO skill_images (skill_id, file_path, file_type, display_order) VALUES (?, ?, ?, ?)',
      [skillId, filePath, fileType, displayOrder]
    );
    
    res.json({ 
      message: 'Image added to skill successfully',
      id: result.insertId,
      filePath,
      fileType,
      displayOrder
    });
  } catch (error) {
    console.error('Error adding skill image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all images for a skill
const getSkillImages = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Verify skill belongs to user
    const [skillCheck] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );
    
    if (skillCheck.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    const [images] = await pool.execute(
      'SELECT * FROM skill_images WHERE skill_id = ? ORDER BY display_order ASC',
      [skillId]
    );
    
    res.json({ images });
  } catch (error) {
    console.error('Error getting skill images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update skill image order
const updateSkillImageOrder = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { imageOrders } = req.body; // Array of {id, display_order}
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Verify skill belongs to user
    const [skillCheck] = await pool.execute(
      'SELECT id FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );
    
    if (skillCheck.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Update each image's display order
    for (const imageOrder of imageOrders) {
      await pool.execute(
        'UPDATE skill_images SET display_order = ? WHERE id = ? AND skill_id = ?',
        [imageOrder.display_order, imageOrder.id, skillId]
      );
    }
    
    res.json({ message: 'Image order updated successfully' });
  } catch (error) {
    console.error('Error updating skill image order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete skill image
const deleteSkillImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { profileId } = req.query;
    const userId = await getUserId(profileId);
    
    // Get image info and verify ownership
    const [imageRows] = await pool.execute(
      `SELECT si.* FROM skill_images si 
       JOIN skills s ON si.skill_id = s.id 
       WHERE si.id = ? AND s.user_id = ?`,
      [imageId, userId]
    );
    
    if (imageRows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = imageRows[0];
    
    // Delete file from filesystem
    if (image.file_path) {
      const filePath = path.join('./uploads', image.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete from database
    await pool.execute('DELETE FROM skill_images WHERE id = ?', [imageId]);
    
    res.json({ message: 'Skill image deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
  deleteAdventure,
  addSkillImage,
  getSkillImages,
  updateSkillImageOrder,
  deleteSkillImage
};
