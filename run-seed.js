// Simple script to run the seed data
const { exec } = require('child_process');

console.log('Starting database seeding...');

exec('node seed-data.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing seed script: ${error}`);
        return;
    }
    console.log(`Seed script output: ${stdout}`);
    if (stderr) {
        console.error(`Seed script errors: ${stderr}`);
    }
    console.log('Database seeding completed!');
}); 