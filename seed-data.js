const mongoose = require('mongoose');
const Course = require('./models/Course');
const Module = require('./models/Module');
const User = require('./models/User');
const UserProgress = require('./models/UserProgress');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/earnly', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Demo courses data
const courses = [
    {
        title: 'Introduction to Blockchain',
        description: 'Learn the fundamentals of blockchain technology, including distributed ledgers, consensus mechanisms, and cryptographic principles. This course provides a solid foundation for understanding how blockchain works and its applications in various industries.',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        reward: '100',
        difficulty: 'Beginner',
        category: 'Blockchain',
        estimatedTime: '2 hours',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 4.5,
        reviews: 12
    },
    {
        title: 'Smart Contract Development',
        description: 'Master the art of writing smart contracts on blockchain platforms. Learn Solidity programming, contract security, testing, and deployment. This course covers everything you need to know to become a proficient smart contract developer.',
        image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        reward: '200',
        difficulty: 'Intermediate',
        category: 'Development',
        estimatedTime: '4 hours',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 4.8,
        reviews: 18
    },
    {
        title: 'Web3 Development',
        description: 'Build decentralized applications (dApps) on the blockchain. Learn how to connect frontend applications to smart contracts, handle transactions, and create a seamless user experience in the Web3 ecosystem.',
        image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        reward: '150',
        difficulty: 'Advanced',
        category: 'Development',
        estimatedTime: '3 hours',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 4.6,
        reviews: 15
    }
];

// Module templates for each course
const moduleTemplates = {
    'Introduction to Blockchain': [
        {
            title: 'What is Blockchain?',
            description: 'An introduction to blockchain technology and its core concepts.',
            type: 'video',
            level: 1,
            reward: '10',
            order: 1,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Blockchain Architecture',
            description: 'Understanding the components and architecture of blockchain systems.',
            type: 'text',
            level: 2,
            reward: '15',
            order: 2,
            content: {
                textContent: 'Blockchain architecture consists of several key components that work together to create a secure, decentralized system. These components include the distributed ledger, consensus mechanisms, cryptographic algorithms, and network protocols. In this module, we will explore each of these components in detail and understand how they interact to maintain the integrity and security of the blockchain.'
            }
        },
        {
            title: 'Cryptography in Blockchain',
            description: 'Learn about the cryptographic principles that secure blockchain networks.',
            type: 'video',
            level: 3,
            reward: '15',
            order: 3,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Consensus Mechanisms',
            description: 'Understanding how blockchain networks reach agreement on transaction validity.',
            type: 'text',
            level: 4,
            reward: '20',
            order: 4,
            content: {
                textContent: 'Consensus mechanisms are protocols that ensure all nodes in a blockchain network agree on the state of the ledger. Different blockchain platforms use various consensus mechanisms, such as Proof of Work (PoW), Proof of Stake (PoS), Delegated Proof of Stake (DPoS), and Practical Byzantine Fault Tolerance (PBFT). Each mechanism has its own advantages and trade-offs in terms of security, scalability, and energy efficiency.'
            }
        },
        {
            title: 'Blockchain Quiz 1',
            description: 'Test your knowledge of blockchain fundamentals.',
            type: 'quiz',
            level: 5,
            reward: '10',
            order: 5,
            content: {
                questions: [
                    {
                        question: 'What is a blockchain?',
                        options: [
                            'A centralized database',
                            'A distributed ledger',
                            'A cloud storage system',
                            'A file sharing protocol'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of the following is NOT a key feature of blockchain?',
                        options: [
                            'Decentralization',
                            'Transparency',
                            'Immutability',
                            'Centralized control'
                        ],
                        correctAnswer: 3
                    },
                    {
                        question: 'What is a block in a blockchain?',
                        options: [
                            'A physical storage device',
                            'A collection of transactions',
                            'A network node',
                            'A consensus mechanism'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        },
        {
            title: 'Public vs Private Blockchains',
            description: 'Understanding the differences between public and private blockchain networks.',
            type: 'video',
            level: 6,
            reward: '15',
            order: 6,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Blockchain Applications',
            description: 'Exploring real-world applications of blockchain technology.',
            type: 'text',
            level: 7,
            reward: '10',
            order: 7,
            content: {
                textContent: 'Blockchain technology has applications across various industries, including finance, supply chain management, healthcare, voting systems, and digital identity. In this module, we will explore some of the most promising use cases and how they are transforming traditional business processes. We will also discuss the challenges and limitations of implementing blockchain solutions in different contexts.'
            }
        },
        {
            title: 'Final Assessment',
            description: 'Comprehensive quiz covering all aspects of blockchain fundamentals.',
            type: 'quiz',
            level: 8,
            reward: '5',
            order: 8,
            content: {
                questions: [
                    {
                        question: 'Which consensus mechanism is used by Bitcoin?',
                        options: [
                            'Proof of Stake',
                            'Proof of Work',
                            'Delegated Proof of Stake',
                            'Practical Byzantine Fault Tolerance'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the primary advantage of a private blockchain?',
                        options: [
                            'Better security',
                            'Higher transaction throughput',
                            'Complete transparency',
                            'No need for trust'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which industry has seen the most blockchain adoption so far?',
                        options: [
                            'Healthcare',
                            'Finance',
                            'Supply Chain',
                            'Education'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        }
    ],
    'Smart Contract Development': [
        {
            title: 'Introduction to Smart Contracts',
            description: 'Learn what smart contracts are and how they work on blockchain platforms.',
            type: 'video',
            level: 1,
            reward: '20',
            order: 1,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Solidity Programming Language',
            description: 'Introduction to the Solidity programming language used for Ethereum smart contracts.',
            type: 'text',
            level: 2,
            reward: '25',
            order: 2,
            content: {
                textContent: 'Solidity is a statically-typed programming language designed for developing smart contracts that run on the Ethereum Virtual Machine (EVM). It is influenced by C++, Python, and JavaScript, and is designed to target the EVM. In this module, we will cover the basic syntax, data types, control structures, and functions in Solidity, along with best practices for writing secure and efficient smart contracts.'
            }
        },
        {
            title: 'Smart Contract Architecture',
            description: 'Understanding the architecture and design patterns for smart contracts.',
            type: 'video',
            level: 3,
            reward: '30',
            order: 3,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Smart Contract Security',
            description: 'Learn about common vulnerabilities and security best practices for smart contracts.',
            type: 'text',
            level: 4,
            reward: '35',
            order: 4,
            content: {
                textContent: 'Smart contract security is critical due to the immutable nature of blockchain. Once deployed, vulnerabilities cannot be easily patched. This module covers common security issues such as reentrancy attacks, integer overflow/underflow, front-running, and more. We will also discuss security tools, auditing processes, and best practices for developing secure smart contracts.'
            }
        },
        {
            title: 'Smart Contract Quiz',
            description: 'Test your knowledge of smart contract development concepts.',
            type: 'quiz',
            level: 5,
            reward: '20',
            order: 5,
            content: {
                questions: [
                    {
                        question: 'What is a smart contract?',
                        options: [
                            'A legal document',
                            'Self-executing code on a blockchain',
                            'A digital signature',
                            'A cryptocurrency wallet'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which programming language is primarily used for Ethereum smart contracts?',
                        options: [
                            'JavaScript',
                            'Python',
                            'Solidity',
                            'Java'
                        ],
                        correctAnswer: 2
                    },
                    {
                        question: 'What is the main security concern with smart contracts?',
                        options: [
                            'Network attacks',
                            'Code vulnerabilities',
                            'User authentication',
                            'Data privacy'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        },
        {
            title: 'Testing Smart Contracts',
            description: 'Learn how to test smart contracts using various testing frameworks.',
            type: 'video',
            level: 6,
            reward: '25',
            order: 6,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Deploying Smart Contracts',
            description: 'Step-by-step guide to deploying smart contracts to blockchain networks.',
            type: 'text',
            level: 7,
            reward: '20',
            order: 7,
            content: {
                textContent: 'Deploying smart contracts to a blockchain network involves several steps, including compiling the contract, estimating gas costs, handling deployment transactions, and verifying the contract on block explorers. This module covers the entire deployment process, from local development environments to testnets and mainnet deployments. We will also discuss tools like Truffle, Hardhat, and Remix that simplify the deployment process.'
            }
        },
        {
            title: 'Advanced Smart Contract Patterns',
            description: 'Explore advanced design patterns and techniques for complex smart contracts.',
            type: 'quiz',
            level: 8,
            reward: '35',
            order: 8,
            content: {
                questions: [
                    {
                        question: 'Which of the following is a common design pattern for upgradable smart contracts?',
                        options: [
                            'Proxy Pattern',
                            'Singleton Pattern',
                            'Factory Pattern',
                            'Observer Pattern'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is the purpose of a fallback function in a smart contract?',
                        options: [
                            'To handle errors',
                            'To receive Ether',
                            'To upgrade the contract',
                            'To terminate the contract'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which gas optimization technique involves storing multiple values in a single storage slot?',
                        options: [
                            'Memory vs Storage',
                            'Bit Packing',
                            'Batch Processing',
                            'Lazy Loading'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        }
    ],
    'Web3 Development': [
        {
            title: 'Introduction to Web3',
            description: 'Understanding the Web3 ecosystem and its components.',
            type: 'video',
            level: 1,
            reward: '15',
            order: 1,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Web3.js and Ethers.js',
            description: 'Learn how to interact with blockchain networks using JavaScript libraries.',
            type: 'text',
            level: 2,
            reward: '20',
            order: 2,
            content: {
                textContent: 'Web3.js and Ethers.js are popular JavaScript libraries that allow developers to interact with Ethereum and other EVM-compatible blockchains. These libraries provide APIs for connecting to nodes, sending transactions, interacting with smart contracts, and handling events. In this module, we will explore the core functionality of these libraries and how to use them in web applications.'
            }
        },
        {
            title: 'Connecting to Blockchain Networks',
            description: 'Learn how to connect your application to different blockchain networks.',
            type: 'video',
            level: 3,
            reward: '20',
            order: 3,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Wallet Integration',
            description: 'Integrating cryptocurrency wallets into Web3 applications.',
            type: 'text',
            level: 4,
            reward: '25',
            order: 4,
            content: {
                textContent: 'Cryptocurrency wallets are essential components of Web3 applications, allowing users to manage their digital assets and sign transactions. This module covers different types of wallets, including browser extensions like MetaMask, hardware wallets, and mobile wallets. We will learn how to detect wallet presence, request account access, handle connection events, and manage wallet state in our applications.'
            }
        },
        {
            title: 'Web3 Quiz',
            description: 'Test your knowledge of Web3 development concepts.',
            type: 'quiz',
            level: 5,
            reward: '15',
            order: 5,
            content: {
                questions: [
                    {
                        question: 'What is Web3?',
                        options: [
                            'A new version of HTML',
                            'A decentralized internet built on blockchain',
                            'A JavaScript framework',
                            'A cloud computing platform'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which library is commonly used to interact with Ethereum in JavaScript?',
                        options: [
                            'React',
                            'Web3.js',
                            'jQuery',
                            'Vue.js'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the purpose of MetaMask?',
                        options: [
                            'To mine cryptocurrency',
                            'To store and manage digital assets',
                            'To create smart contracts',
                            'To host decentralized applications'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        },
        {
            title: 'Smart Contract Interaction',
            description: 'Learn how to interact with smart contracts from Web3 applications.',
            type: 'video',
            level: 6,
            reward: '25',
            order: 6,
            content: {
                videoUrl: 'courcedemo.mp4'
            }
        },
        {
            title: 'Event Handling and Real-time Updates',
            description: 'Implementing real-time updates using blockchain events.',
            type: 'text',
            level: 7,
            reward: '20',
            order: 7,
            content: {
                textContent: 'Blockchain events are a powerful way to implement real-time updates in Web3 applications. When smart contracts emit events, client applications can listen for these events and update their UI accordingly. This module covers how to define, emit, and listen for events using Web3.js and Ethers.js. We will also explore techniques for filtering events and handling event data in our applications.'
            }
        },
        {
            title: 'Advanced Web3 Patterns',
            description: 'Explore advanced patterns and best practices for Web3 development.',
            type: 'quiz',
            level: 8,
            reward: '10',
            order: 8,
            content: {
                questions: [
                    {
                        question: 'Which pattern is commonly used to handle asynchronous blockchain operations?',
                        options: [
                            'Observer Pattern',
                            'Promise-based Pattern',
                            'Singleton Pattern',
                            'Factory Pattern'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the purpose of gas estimation in Web3 applications?',
                        options: [
                            'To calculate mining rewards',
                            'To estimate transaction costs',
                            'To optimize smart contracts',
                            'To validate blockchain data'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which approach is recommended for handling failed transactions?',
                        options: [
                            'Ignore them',
                            'Retry automatically',
                            'Provide user feedback and options',
                            'Log them silently'
                        ],
                        correctAnswer: 2
                    }
                ]
            }
        }
    ]
};

// Function to seed the database
async function seedDatabase() {
    try {
        // Clear existing data
        await Course.deleteMany({});
        await Module.deleteMany({});
        await UserProgress.deleteMany({});
        
        console.log('Existing data cleared');
        
        // Create courses and modules
        for (const courseData of courses) {
            // Create course
            const course = await Course.create(courseData);
            console.log(`Created course: ${course.title}`);
            
            // Create modules for the course
            const modules = moduleTemplates[courseData.title];
            for (const moduleData of modules) {
                const module = await Module.create({
                    ...moduleData,
                    course: course._id
                });
                console.log(`Created module: ${module.title} for course: ${course.title}`);
            }
            
            // Update course with module references
            const courseModules = await Module.find({ course: course._id });
            course.modules = courseModules.map(m => m._id);
            await course.save();
        }
        
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding function
seedDatabase(); 