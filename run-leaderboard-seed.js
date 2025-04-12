// Script to run the leaderboard seed
const { spawn } = require('child_process');

console.log('🚀 Starting leaderboard seed process...');

// Run the seed-leaderboard.js script
const seedProcess = spawn('node', ['seed-leaderboard.js'], { stdio: 'inherit' });

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Leaderboard seed completed successfully!');
  } else {
    console.error(`❌ Leaderboard seed failed with code ${code}`);
  }
}); 