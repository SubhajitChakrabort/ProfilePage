const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('./config/db');
const profileRoutes = require('./routes/profileRoutes');
const contentRoutes = require('./routes/contentRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const sectionsRoutes = require('./routes/sectionsRoutes');
const dbFixRoutes = require('./routes/dbFixRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files with better configuration - MUST come before other routes
app.use(express.static('public'));
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));

// Specific route to handle file serving with comprehensive debugging - MUST come before parameterized routes
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log(`📁 File request: ${filename}`);
  console.log(`📁 File path: ${filePath}`);
  console.log(`📁 Current directory: ${__dirname}`);
  
  // Check if uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log(`❌ Uploads directory does not exist: ${uploadsDir}`);
    return res.status(404).json({ 
      error: 'Uploads directory not found',
      message: 'The uploads directory does not exist on this server',
      requestedFile: filename
    });
  }
  
  // List some files in uploads directory for debugging
  let files = [];
  try {
    files = fs.readdirSync(uploadsDir);
    console.log(`📁 Uploads directory contains ${files.length} files`);
    if (files.length > 0) {
      console.log(`📁 Sample files: ${files.slice(0, 3).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Error reading uploads directory: ${error.message}`);
  }
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ File exists, serving: ${filename}`);
    const stats = fs.statSync(filePath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    res.sendFile(filePath);
  } else {
    console.log(`❌ File not found: ${filename}`);
    console.log(`❌ Full path checked: ${filePath}`);
    
    // Try to find similar files
    try {
      const similarFiles = files.filter(file => 
        file.includes(filename.split('.')[0]) || 
        filename.includes(file.split('.')[0])
      );
      if (similarFiles.length > 0) {
        console.log(`🔍 Similar files found: ${similarFiles.join(', ')}`);
      }
      
      // Check for files with similar patterns
      const filePattern = filename.split('-')[0]; // e.g., "profilePicture", "coverImage", "files"
      const patternFiles = files.filter(file => file.startsWith(filePattern));
      if (patternFiles.length > 0) {
        console.log(`🔍 Files with same pattern (${filePattern}): ${patternFiles.slice(0, 5).join(', ')}`);
      }
      
      // Try to serve a fallback file of the same type
      const fileExtension = path.extname(filename).toLowerCase();
      const fallbackFiles = files.filter(file => 
        file.endsWith(fileExtension) && 
        (file.includes('profilePicture') || file.includes('coverImage') || file.includes('files'))
      );
      
      if (fallbackFiles.length > 0) {
        const fallbackFile = fallbackFiles[0];
        const fallbackPath = path.join(uploadsDir, fallbackFile);
        console.log(`🔄 Serving fallback file: ${fallbackFile}`);
        return res.sendFile(fallbackPath);
      }
      
    } catch (error) {
      console.log(`❌ Error searching for similar files: ${error.message}`);
    }
    
    res.status(404).json({ 
      error: 'File not found',
      message: 'The requested file does not exist on this server',
      requestedFile: filename,
      availableFiles: files.length,
      serverTime: new Date().toISOString(),
      suggestion: 'Consider running the sync script to download missing files from production'
    });
  }
});

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Test database connection
testConnection();

// API Routes - these should come after static file serving
app.use('/api/profile', profileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/db', dbFixRoutes);

// Serve main HTML file for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'create-profile.html'));
});

// Serve profile page with unique ID - these should come after static file serving
app.get('/profile/:profileId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve profile page by username - these should come after static file serving
app.get('/@:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.url}`);
  console.log(`❌ User agent: ${req.get('User-Agent')}`);
  console.log(`❌ Referer: ${req.get('Referer')}`);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});

module.exports = app;