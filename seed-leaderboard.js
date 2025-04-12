require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Dummy user data
const dummyUsers = [
  { username: 'crypto_master', email: 'crypto@example.com', fullName: 'Alex Johnson' },
  { username: 'blockchain_guru', email: 'guru@example.com', fullName: 'Taylor Smith' },
  { username: 'token_collector', email: 'tokens@example.com', fullName: 'Jordan Lee' },
  { username: 'earn_expert', email: 'expert@example.com', fullName: 'Casey Williams' },
  { username: 'crypto_newbie', email: 'newbie@example.com', fullName: 'Riley Brown' },
  { username: 'blockchain_student', email: 'student@example.com', fullName: 'Morgan Wilson' },
  { username: 'aptos_fan', email: 'aptos@example.com', fullName: 'Jamie Davis' },
  { username: 'token_hunter', email: 'hunter@example.com', fullName: 'Quinn Miller' },
  { username: 'cryptoenthusiast', email: 'enthusiast@example.com', fullName: 'Avery Martinez' },
  { username: 'web3_learner', email: 'web3@example.com', fullName: 'Drew Thomas' }
];

// Transaction types and descriptions
const transactionTypes = ['reward', 'quiz', 'course'];
const descriptions = {
  reward: ['Claimed tokens for APT', 'Weekly reward bonus', 'Special promotion reward'],
  quiz: ['Completed Blockchain Basics Quiz', 'Passed Advanced Cryptography Quiz', 'Scored 100% on Web3 Quiz'],
  course: ['Completed Introduction to Blockchain', 'Finished Crypto Economics Module', 'Completed Smart Contract Development']
};

// Function to generate random wallet address
function generateWalletAddress() {
  return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Function to generate random date within the last 3 months
function generateRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
}

// Function to generate random amount
function generateRandomAmount(type) {
  switch (type) {
    case 'reward':
      return (Math.random() * 0.2 + 0.01).toFixed(6); // 0.01 - 0.21 APT
    case 'quiz':
      return (Math.random() * 0.05 + 0.01).toFixed(6); // 0.01 - 0.06 APT
    case 'course':
      return (Math.random() * 0.1 + 0.05).toFixed(6); // 0.05 - 0.15 APT
    default:
      return (Math.random() * 0.1).toFixed(6); // 0 - 0.1 APT
  }
}

// Function to get random description based on transaction type
function getRandomDescription(type) {
  const typeDescriptions = descriptions[type] || ['Transaction completed'];
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}

// Generate dummy user data
async function seedUsers() {
  try {
    // Delete existing dummy users
    await User.deleteMany({ email: { $in: dummyUsers.map(u => u.email) } });
    console.log('✅ Deleted existing dummy users');
    
    // Create dummy users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersToInsert = dummyUsers.map(user => ({
      ...user,
      password: hashedPassword,
      wallet: Math.floor(Math.random() * 1000).toString(), // Random token amount (0-999)
      totalEarnings: (Math.random() * 1).toFixed(6), // Random APT amount (0-1)
      walletAddress: generateWalletAddress(),
      role: 'user',
      createdAt: generateRandomDate()
    }));
    
    const createdUsers = await User.insertMany(usersToInsert);
    console.log(`✅ Created ${createdUsers.length} dummy users`);
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

// Generate transactions for users
async function seedTransactions(users) {
  try {
    const transactions = [];
    
    // Create different numbers of transactions for each user to make the leaderboard interesting
    for (const user of users) {
      // Create between 10-50 transactions per user
      const numTransactions = Math.floor(Math.random() * 40) + 10;
      
      for (let i = 0; i < numTransactions; i++) {
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = generateRandomAmount(type);
        
        transactions.push({
          userId: user._id,
          hash: uuidv4(),
          type,
          amount,
          walletAddress: user.walletAddress || generateWalletAddress(),
          description: getRandomDescription(type),
          timestamp: generateRandomDate()
        });
      }
    }
    
    // Delete existing dummy transactions
    await Transaction.deleteMany({ userId: { $in: users.map(u => u._id) } });
    console.log('✅ Deleted existing dummy transactions');
    
    // Insert new transactions
    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} dummy transactions`);
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
    throw error;
  }
}

// Main seed function
async function seed() {
  try {
    console.log('🌱 Starting leaderboard seed process...');
    const users = await seedUsers();
    await seedTransactions(users);
    console.log('✅ Leaderboard seed completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seed(); 