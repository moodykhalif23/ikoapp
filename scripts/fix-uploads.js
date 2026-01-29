#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    console.log('🔧 Fixing uploads directory for Caddy + Next.js setup...');
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    
    // Ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created/verified');
    
    // Set directory permissions (755 - owner: rwx, group: rx, others: rx)
    await fs.chmod(uploadsDir, 0o755);
    console.log('✅ Directory permissions set to 755');
    
    // List existing files and fix their permissions
    const files = await fs.readdir(uploadsDir);
    console.log(`📁 Found ${files.length} files in uploads directory`);
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        // Set file permissions (644 - owner: rw, group: r, others: r)
        await fs.chmod(filePath, 0o644);
        console.log(`✅ Fixed permissions for: ${file}`);
      }
    }
    
    console.log('🎉 All uploads directory permissions fixed!');
    console.log('');
    console.log('🚀 Next steps for your server:');
    console.log('1. Run this script: node scripts/fix-uploads.js');
    console.log('2. Check ownership: sudo chown -R ikobriq:ikobriq /home/ikobriq/ikoapp/public/uploads');
    console.log('3. Restart your Next.js app: pm2 restart ikoapp (or your process manager)');
    console.log('4. Test upload: curl -X POST -F "files=@test.jpg" http://localhost:3000/api/uploads');
    console.log('5. Test file access: curl -I https://ikobriqapp.duckdns.org/uploads/filename.jpg');
    
  } catch (error) {
    console.error('❌ Error fixing uploads directory:', error.message);
    console.log('');
    console.log('🔧 Manual fix commands for your server:');
    console.log('sudo mkdir -p /home/ikobriq/ikoapp/public/uploads');
    console.log('sudo chmod 755 /home/ikobriq/ikoapp/public/uploads');
    console.log('sudo chown -R ikobriq:ikobriq /home/ikobriq/ikoapp/public/uploads');
    console.log('sudo chmod 644 /home/ikobriq/ikoapp/public/uploads/*');
    process.exit(1);
  }
}

fixUploadsDirectory();