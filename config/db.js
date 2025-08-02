const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

// Create skill_images table if it doesn't exist
const createSkillImagesTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS skill_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        skill_id INT NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      )
    `;
    
    await pool.execute(createTableQuery);
    console.log('✅ Skill images table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating skill images table:', error.message);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  await testConnection();
  await createSkillImagesTable();
};

module.exports = { pool, testConnection, initializeDatabase };
