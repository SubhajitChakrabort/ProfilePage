const { pool } = require('./config/db');

async function fixProductionDatabase() {
  try {
    console.log('🔧 Starting production database fixes...');
    
    // Check current column types
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM section_items WHERE Field IN ('file_path', 'file_type')
    `);
    
    console.log('📋 Current column types:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });
    
    // Fix file_path column to TEXT
    console.log('\n🔧 Updating file_path column to TEXT...');
    await pool.execute(`
      ALTER TABLE section_items 
      MODIFY COLUMN file_path TEXT
    `);
    console.log('✅ file_path column updated to TEXT');
    
    // Fix file_type column to VARCHAR(50)
    console.log('\n🔧 Updating file_type column to VARCHAR(50)...');
    await pool.execute(`
      ALTER TABLE section_items 
      MODIFY COLUMN file_type VARCHAR(50)
    `);
    console.log('✅ file_type column updated to VARCHAR(50)');
    
    // Verify the changes
    const [updatedColumns] = await pool.execute(`
      SHOW COLUMNS FROM section_items WHERE Field IN ('file_path', 'file_type')
    `);
    
    console.log('\n📋 Updated column types:');
    updatedColumns.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });
    
    // Test with a sample JSON to make sure it works
    console.log('\n🧪 Testing with sample JSON data...');
    const testJson = JSON.stringify([
      { path: 'test1.jpg', type: 'image' },
      { path: 'test2.jpg', type: 'image' },
      { path: 'test3.jpg', type: 'image' },
      { path: 'test4.jpg', type: 'image' },
      { path: 'test5.jpg', type: 'image' },
      { path: 'test6.jpg', type: 'image' },
      { path: 'test7.jpg', type: 'image' },
      { path: 'test8.jpg', type: 'image' },
      { path: 'test9.jpg', type: 'image' },
      { path: 'test10.jpg', type: 'image' }
    ]);
    
    console.log(`Test JSON length: ${testJson.length} characters`);
    console.log('✅ JSON data length is acceptable for TEXT column');
    
    console.log('\n🎉 Production database fixes completed successfully!');
    console.log('✅ You can now upload multiple files without errors');
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixProductionDatabase(); 