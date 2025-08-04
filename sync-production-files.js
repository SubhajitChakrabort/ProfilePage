const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const PRODUCTION_URL = 'https://profilepage-88aj.onrender.com';
const LOCAL_UPLOADS_DIR = './uploads';

// Files that were reported as missing
const MISSING_FILES = [
  'profilePicture-1754299010885-903229573.jpg',
  'coverImage-1754299013225-590716727.jpg',
  'files-1754295657640-131777492.jpg',
  'files-1754295657430-835343830.jpg'
];

// Function to download a file from production
function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}/uploads/${filename}`;
    const filePath = path.join(LOCAL_UPLOADS_DIR, filename);
    
    console.log(`📥 Attempting to download: ${filename}`);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Successfully downloaded: ${filename}`);
          resolve(filename);
        });
        
        fileStream.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Delete the file if it exists
          console.log(`❌ Error writing file ${filename}: ${error.message}`);
          reject(error);
        });
      } else {
        console.log(`❌ Failed to download ${filename}: HTTP ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', (error) => {
      console.log(`❌ Network error downloading ${filename}: ${error.message}`);
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to check if a file exists locally
function checkLocalFile(filename) {
  const filePath = path.join(LOCAL_UPLOADS_DIR, filename);
  return fs.existsSync(filePath);
}

// Function to list all files in local uploads directory
function listLocalFiles() {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    console.log('❌ Local uploads directory does not exist');
    return [];
  }
  
  try {
    const files = fs.readdirSync(LOCAL_UPLOADS_DIR);
    console.log(`📁 Local uploads directory contains ${files.length} files`);
    return files;
  } catch (error) {
    console.log(`❌ Error reading local uploads directory: ${error.message}`);
    return [];
  }
}

// Main function
async function syncProductionFiles() {
  console.log('🔄 Starting production file sync...');
  console.log(`📁 Local uploads directory: ${path.resolve(LOCAL_UPLOADS_DIR)}`);
  console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
  
  // Ensure uploads directory exists
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
  
  // List current local files
  const localFiles = listLocalFiles();
  
  // Check missing files
  console.log('\n🔍 Checking missing files...');
  const missingFiles = MISSING_FILES.filter(filename => !checkLocalFile(filename));
  
  if (missingFiles.length === 0) {
    console.log('✅ All reported missing files are already present locally');
    return;
  }
  
  console.log(`📋 Found ${missingFiles.length} missing files:`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
  
  // Download missing files
  console.log('\n📥 Downloading missing files...');
  const downloadPromises = missingFiles.map(filename => 
    downloadFile(filename).catch(error => {
      console.log(`❌ Failed to download ${filename}: ${error.message}`);
      return null;
    })
  );
  
  const results = await Promise.all(downloadPromises);
  const successfulDownloads = results.filter(result => result !== null);
  
  console.log(`\n✅ Sync completed!`);
  console.log(`📊 Successfully downloaded: ${successfulDownloads.length}/${missingFiles.length} files`);
  
  if (successfulDownloads.length > 0) {
    console.log('✅ Downloaded files:');
    successfulDownloads.forEach(filename => console.log(`   - ${filename}`));
  }
  
  if (successfulDownloads.length < missingFiles.length) {
    console.log('❌ Failed downloads:');
    missingFiles.forEach(filename => {
      if (!successfulDownloads.includes(filename)) {
        console.log(`   - ${filename}`);
      }
    });
  }
}

// Run the sync
if (require.main === module) {
  syncProductionFiles().catch(error => {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  });
}

module.exports = { syncProductionFiles, downloadFile, checkLocalFile }; 