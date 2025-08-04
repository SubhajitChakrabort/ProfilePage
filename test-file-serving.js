const fs = require('fs');
const path = require('path');

// Test file serving functionality
function testFileServing() {
  console.log('🧪 Testing file serving functionality...');
  
  const uploadsDir = './uploads';
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory does not exist');
    return;
  }
  
  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 Found ${files.length} files in uploads directory`);
  
  // Test a few sample files
  const sampleFiles = files.slice(0, 5);
  
  sampleFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    
    console.log(`📄 File: ${file}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Path: ${filePath}`);
    console.log(`   Exists: ${fs.existsSync(filePath) ? '✅' : '❌'}`);
    console.log('');
  });
  
  // Test specific file pattern mentioned in the issue
  const testPattern = /file-\d+_\d+\.jpg/;
  const matchingFiles = files.filter(file => testPattern.test(file));
  
  console.log(`🔍 Found ${matchingFiles.length} files matching pattern 'file-{timestamp}_{random}.jpg'`);
  matchingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  console.log('\n✅ File serving test completed');
}

// Run the test
testFileServing(); 