const mongoose = require('mongoose');
const EarningQuiz = require('./models/EarningQuiz');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample quizzes data
const quizzes = [
    {
        title: "Blockchain Fundamentals",
        description: "Test your knowledge of blockchain basics and earn rewards!",
        questions: [
            {
                question: "What is a blockchain?",
                options: [
                    "A type of database where information is stored in blocks that are linked together",
                    "A programming language for cryptocurrencies",
                    "A physical device used for mining Bitcoin",
                    "A software application for trading cryptocurrencies"
                ],
                correctAnswer: 0
            },
            {
                question: "Which of the following is NOT a characteristic of blockchain technology?",
                options: [
                    "Decentralization",
                    "Immutability",
                    "Centralized control",
                    "Transparency"
                ],
                correctAnswer: 2
            },
            {
                question: "What is a consensus mechanism in blockchain?",
                options: [
                    "A tool for creating cryptocurrencies",
                    "A process for achieving agreement on the state of the network",
                    "A type of smart contract",
                    "A security feature for wallets"
                ],
                correctAnswer: 1
            },
            {
                question: "What is a 'block' in blockchain?",
                options: [
                    "A unit of cryptocurrency",
                    "A collection of transactions bundled together",
                    "A type of digital wallet",
                    "A private key"
                ],
                correctAnswer: 1
            },
            {
                question: "What is the purpose of cryptography in blockchain?",
                options: [
                    "To create new cryptocurrencies",
                    "To increase transaction speeds",
                    "To secure transactions and maintain privacy",
                    "To reduce energy consumption"
                ],
                correctAnswer: 2
            }
        ],
        reward: 20,
        timeLimit: 5,
        passingScore: 60
    },
    {
        title: "Cryptocurrency Basics",
        description: "Learn about cryptocurrencies and earn rewards for your knowledge!",
        questions: [
            {
                question: "What was the first cryptocurrency?",
                options: [
                    "Ethereum",
                    "Bitcoin",
                    "Litecoin",
                    "Dogecoin"
                ],
                correctAnswer: 1
            },
            {
                question: "What is a cryptocurrency wallet?",
                options: [
                    "A physical device that holds your coins",
                    "A software program that stores private and public keys",
                    "An exchange where you can trade cryptocurrencies",
                    "A website that tracks cryptocurrency prices"
                ],
                correctAnswer: 1
            },
            {
                question: "What is mining in cryptocurrency?",
                options: [
                    "The process of creating new cryptocurrency by solving complex mathematical problems",
                    "Buying cryptocurrency at a low price",
                    "Selling cryptocurrency at a high price",
                    "Converting cryptocurrency to fiat currency"
                ],
                correctAnswer: 0
            },
            {
                question: "What is a 'private key' in cryptocurrency?",
                options: [
                    "A password for logging into an exchange",
                    "A secret code that allows you to access and transfer your cryptocurrency",
                    "A recovery phrase for your wallet",
                    "The address where your cryptocurrency is stored"
                ],
                correctAnswer: 1
            },
            {
                question: "What is a 'hard fork' in cryptocurrency?",
                options: [
                    "A significant upgrade to a blockchain protocol",
                    "A tool used for mining",
                    "A type of wallet",
                    "A malicious attack on a blockchain"
                ],
                correctAnswer: 0
            }
        ],
        reward: 25,
        timeLimit: 7,
        passingScore: 60
    },
    {
        title: "Smart Contracts",
        description: "Test your knowledge of smart contracts and blockchain applications!",
        questions: [
            {
                question: "What is a smart contract?",
                options: [
                    "A legally binding document for blockchain transactions",
                    "Self-executing code with the terms of an agreement directly written into code",
                    "A contract between miners and validators",
                    "A subscription service for blockchain platforms"
                ],
                correctAnswer: 1
            },
            {
                question: "Which blockchain platform is most commonly associated with smart contracts?",
                options: [
                    "Bitcoin",
                    "Ethereum",
                    "Litecoin",
                    "Ripple"
                ],
                correctAnswer: 1
            },
            {
                question: "What language is commonly used to write Ethereum smart contracts?",
                options: [
                    "Java",
                    "Python",
                    "Solidity",
                    "C++"
                ],
                correctAnswer: 2
            },
            {
                question: "What is a DApp?",
                options: [
                    "A decentralized application that runs on a blockchain",
                    "A digital asset protection protocol",
                    "A type of cryptocurrency",
                    "A software development framework"
                ],
                correctAnswer: 0
            },
            {
                question: "What is gas in Ethereum?",
                options: [
                    "A cryptocurrency used for small transactions",
                    "A measure of computational effort required to execute operations",
                    "A type of smart contract",
                    "A security feature to prevent hacking"
                ],
                correctAnswer: 1
            }
        ],
        reward: 30,
        timeLimit: 8,
        passingScore: 70
    },
    {
        title: "Web3 Fundamentals",
        description: "Test your knowledge of Web3 and decentralized applications!",
        questions: [
            {
                question: "What is Web3?",
                options: [
                    "The third generation of internet services",
                    "A programming language for blockchain",
                    "A specific blockchain platform",
                    "A cryptocurrency exchange"
                ],
                correctAnswer: 0
            },
            {
                question: "Which of these is a key feature of Web3?",
                options: [
                    "Centralized data control",
                    "Reliance on large tech companies",
                    "Decentralization and trustless interactions",
                    "Simpler user interfaces than Web2"
                ],
                correctAnswer: 2
            },
            {
                question: "What technology forms the backbone of Web3?",
                options: [
                    "Cloud computing",
                    "Artificial intelligence",
                    "Blockchain",
                    "Virtual reality"
                ],
                correctAnswer: 2
            },
            {
                question: "What is a DAO?",
                options: [
                    "Digital Asset Organization",
                    "Decentralized Autonomous Organization",
                    "Distributed Application Overlay",
                    "Direct Access Operation"
                ],
                correctAnswer: 1
            },
            {
                question: "Which of these is NOT typically associated with Web3?",
                options: [
                    "NFTs (Non-Fungible Tokens)",
                    "Smart contracts",
                    "Centralized servers",
                    "Digital wallets"
                ],
                correctAnswer: 2
            }
        ],
        reward: 35,
        timeLimit: 6,
        passingScore: 60
    },
    {
        title: "NFT Knowledge Test",
        description: "Test your understanding of Non-Fungible Tokens and earn rewards!",
        questions: [
            {
                question: "What does NFT stand for?",
                options: [
                    "New Financial Technology",
                    "Non-Fungible Token",
                    "Network Function Transfer",
                    "Nested File Type"
                ],
                correctAnswer: 1
            },
            {
                question: "What makes NFTs different from cryptocurrencies like Bitcoin?",
                options: [
                    "NFTs are fungible, while Bitcoin is not",
                    "NFTs represent unique assets, while Bitcoin units are interchangeable",
                    "NFTs cannot be sold for money",
                    "NFTs don't use blockchain technology"
                ],
                correctAnswer: 1
            },
            {
                question: "Which blockchain is most commonly used for NFTs?",
                options: [
                    "Bitcoin",
                    "Ethereum",
                    "Ripple",
                    "Litecoin"
                ],
                correctAnswer: 1
            },
            {
                question: "What type of digital content can be made into an NFT?",
                options: [
                    "Only digital art",
                    "Only videos and music",
                    "Only tweets and social media posts",
                    "Almost any type of digital content can be made into an NFT"
                ],
                correctAnswer: 3
            },
            {
                question: "What is 'minting' in the context of NFTs?",
                options: [
                    "The process of creating an NFT on a blockchain",
                    "Selling an NFT for profit",
                    "Converting cryptocurrency to an NFT",
                    "Storing an NFT in a digital wallet"
                ],
                correctAnswer: 0
            }
        ],
        reward: 25,
        timeLimit: 5,
        passingScore: 60
    }
];

// Seed function
async function seedQuizzes() {
    try {
        // Delete existing quizzes
        await EarningQuiz.deleteMany({});
        console.log('Deleted existing quizzes');
        
        // Insert new quizzes
        const insertedQuizzes = await EarningQuiz.insertMany(quizzes);
        console.log(`Added ${insertedQuizzes.length} quizzes to the database`);
        
        // Exit process
        mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding quizzes:', error);
        process.exit(1);
    }
}

// Run the seed function
seedQuizzes(); 