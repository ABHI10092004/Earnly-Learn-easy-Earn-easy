const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const Module = require('../models/Module');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample courses data
const courses = [
    {
        title: 'Introduction to Blockchain',
        description: 'Learn the fundamentals of blockchain technology, including how it works, its history, and its potential applications. This course covers the basics of distributed ledgers, consensus mechanisms, and cryptography.',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
        reward: '100',
        difficulty: 'Beginner',
        category: 'Blockchain Basics',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 0,
        reviews: 0
    },
    {
        title: 'Smart Contract Development',
        description: 'Master the art of writing smart contracts on Aptos. Learn about the Move programming language, contract security, testing, and deployment. Build your own decentralized applications from scratch.',
        image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
        reward: '200',
        difficulty: 'Intermediate',
        category: 'Development',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 0,
        reviews: 0
    },
    {
        title: 'Web3 Development',
        description: 'Build decentralized applications on the Aptos blockchain. Learn how to integrate Web3 functionality into your applications, interact with smart contracts, and create a seamless user experience.',
        image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
        reward: '150',
        difficulty: 'Advanced',
        category: 'Development',
        totalModules: 8,
        enrolledUsers: 0,
        rating: 0,
        reviews: 0
    }
];

// Sample modules data for each course
const modulesData = [
    // Course 1: Introduction to Blockchain
    [
        {
            title: 'What is Blockchain?',
            description: 'An introduction to blockchain technology and its core concepts.',
            type: 'video',
            level: 1,
            reward: '10',
            isLocked: false,
            order: 1,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'History of Blockchain',
            description: 'Learn about the history of blockchain from Bitcoin to modern platforms.',
            type: 'text',
            level: 2,
            reward: '10',
            isLocked: true,
            order: 2,
            content: {
                textContent: `
                    <h2>The History of Blockchain</h2>
                    <p>Blockchain technology was first introduced in 2008 with the publication of the Bitcoin whitepaper by an individual or group using the pseudonym Satoshi Nakamoto. The paper described a peer-to-peer electronic cash system that would allow online payments to be sent directly from one party to another without going through a financial institution.</p>
                    
                    <h3>Bitcoin (2009)</h3>
                    <p>In January 2009, the Bitcoin network was launched, and the first block (genesis block) was mined. This marked the beginning of the blockchain era. Bitcoin introduced the concept of a decentralized, trustless system where transactions could be verified without the need for a central authority.</p>
                    
                    <h3>Ethereum (2015)</h3>
                    <p>In 2015, Ethereum was launched, introducing the concept of smart contracts and programmable blockchain. This allowed developers to build decentralized applications (dApps) on top of the blockchain, expanding its use cases beyond just digital currency.</p>
                    
                    <h3>The Rise of Alternative Blockchains</h3>
                    <p>Following the success of Bitcoin and Ethereum, numerous alternative blockchains emerged, each with their own unique features and use cases. These include platforms like Solana, Cardano, and Aptos, which aim to address scalability and usability challenges faced by earlier blockchain platforms.</p>
                    
                    <h3>Blockchain Today</h3>
                    <p>Today, blockchain technology is being adopted across various industries, from finance and supply chain to healthcare and voting systems. The technology continues to evolve, with new platforms and applications being developed to address the challenges and limitations of earlier implementations.</p>
                `
            }
        },
        {
            title: 'Cryptography Basics',
            description: 'Understand the cryptographic principles that secure blockchain networks.',
            type: 'video',
            level: 3,
            reward: '10',
            isLocked: true,
            order: 3,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Consensus Mechanisms',
            description: 'Learn about different consensus mechanisms used in blockchain networks.',
            type: 'text',
            level: 4,
            reward: '10',
            isLocked: true,
            order: 4,
            content: {
                textContent: `
                    <h2>Consensus Mechanisms in Blockchain</h2>
                    <p>Consensus mechanisms are protocols that ensure all nodes in a blockchain network agree on the state of the ledger. They are crucial for maintaining the security and integrity of the blockchain.</p>
                    
                    <h3>Proof of Work (PoW)</h3>
                    <p>Proof of Work is the original consensus mechanism used by Bitcoin. In PoW, miners compete to solve complex mathematical puzzles. The first miner to solve the puzzle gets to add the next block to the blockchain and is rewarded with newly created cryptocurrency and transaction fees.</p>
                    
                    <h3>Proof of Stake (PoS)</h3>
                    <p>Proof of Stake is an alternative consensus mechanism that selects validators based on the amount of cryptocurrency they hold and are willing to "stake" as collateral. PoS is more energy-efficient than PoW and is used by platforms like Ethereum 2.0 and Cardano.</p>
                    
                    <h3>Delegated Proof of Stake (DPoS)</h3>
                    <p>In Delegated Proof of Stake, token holders vote for delegates who are responsible for validating transactions and maintaining the blockchain. DPoS is used by platforms like EOS and TRON.</p>
                    
                    <h3>Practical Byzantine Fault Tolerance (PBFT)</h3>
                    <p>PBFT is a consensus mechanism designed to work efficiently in systems with a known set of validators. It's used by platforms like Hyperledger Fabric and some versions of Ripple.</p>
                    
                    <h3>Aptos BFT</h3>
                    <p>Aptos uses a variant of Byzantine Fault Tolerance called AptosBFT, which is designed to be efficient, secure, and scalable. It allows the network to reach consensus even when some validators are malicious or faulty.</p>
                `
            }
        },
        {
            title: 'Blockchain Architecture',
            description: 'Explore the architecture of blockchain networks and how they function.',
            type: 'video',
            level: 5,
            reward: '10',
            isLocked: true,
            order: 5,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Public vs Private Blockchains',
            description: 'Compare public and private blockchain networks and their use cases.',
            type: 'text',
            level: 6,
            reward: '10',
            isLocked: true,
            order: 6,
            content: {
                textContent: `
                    <h2>Public vs Private Blockchains</h2>
                    <p>Blockchain networks can be categorized as either public or private, each with its own characteristics, advantages, and use cases.</p>
                    
                    <h3>Public Blockchains</h3>
                    <p>Public blockchains are open to anyone who wants to participate. They are decentralized, transparent, and permissionless. Anyone can join the network, validate transactions, and create new blocks.</p>
                    
                    <p>Examples of public blockchains include Bitcoin, Ethereum, and Aptos.</p>
                    
                    <h3>Private Blockchains</h3>
                    <p>Private blockchains are restricted to a specific group of participants. They are typically used by organizations for internal purposes. Access to the network is controlled, and only authorized participants can validate transactions and create new blocks.</p>
                    
                    <p>Examples of private blockchain platforms include Hyperledger Fabric and Corda.</p>
                    
                    <h3>Key Differences</h3>
                    <ul>
                        <li><strong>Access:</strong> Public blockchains are open to everyone, while private blockchains are restricted to authorized participants.</li>
                        <li><strong>Control:</strong> Public blockchains are decentralized, while private blockchains are typically controlled by a single organization or consortium.</li>
                        <li><strong>Transparency:</strong> Public blockchains are transparent, with all transactions visible to everyone, while private blockchains can restrict visibility to authorized participants.</li>
                        <li><strong>Use Cases:</strong> Public blockchains are suitable for applications that require transparency, decentralization, and trustlessness, while private blockchains are suitable for applications that require privacy, control, and efficiency.</li>
                    </ul>
                `
            }
        },
        {
            title: 'Blockchain Applications',
            description: 'Discover real-world applications of blockchain technology across industries.',
            type: 'video',
            level: 7,
            reward: '10',
            isLocked: true,
            order: 7,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Final Quiz',
            description: 'Test your knowledge of blockchain fundamentals with this comprehensive quiz.',
            type: 'quiz',
            level: 8,
            reward: '40',
            isLocked: true,
            order: 8,
            content: {
                questions: [
                    {
                        question: 'What is a blockchain?',
                        options: [
                            'A type of cryptocurrency',
                            'A distributed ledger technology',
                            'A centralized database',
                            'A cloud storage service'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Who created Bitcoin?',
                        options: [
                            'Vitalik Buterin',
                            'Satoshi Nakamoto',
                            'Charlie Lee',
                            'Nick Szabo'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a smart contract?',
                        options: [
                            'A legal contract stored on the blockchain',
                            'A self-executing contract with the terms directly written into code',
                            'A contract between two parties facilitated by a third party',
                            'A contract that is automatically renewed'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the primary purpose of a consensus mechanism?',
                        options: [
                            'To mine new cryptocurrency',
                            'To ensure all nodes agree on the state of the blockchain',
                            'To encrypt transactions',
                            'To store data on the blockchain'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of the following is NOT a type of consensus mechanism?',
                        options: [
                            'Proof of Work',
                            'Proof of Stake',
                            'Proof of Authority',
                            'Proof of Existence'
                        ],
                        correctAnswer: 3
                    }
                ]
            }
        }
    ],
    
    // Course 2: Smart Contract Development
    [
        {
            title: 'Introduction to Move',
            description: 'Learn about the Move programming language and its unique features.',
            type: 'video',
            level: 1,
            reward: '20',
            isLocked: false,
            order: 1,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Move Language Basics',
            description: 'Master the fundamentals of the Move programming language.',
            type: 'text',
            level: 2,
            reward: '20',
            isLocked: true,
            order: 2,
            content: {
                textContent: `
                    <h2>Move Language Basics</h2>
                    <p>Move is a programming language designed specifically for blockchain applications. It was developed by Facebook (now Meta) for the Libra (now Diem) project and is now used by the Aptos blockchain.</p>
                    
                    <h3>Key Features of Move</h3>
                    <ul>
                        <li><strong>Resource-oriented:</strong> Move treats digital assets as resources that can't be copied or destroyed, only moved between accounts.</li>
                        <li><strong>Static typing:</strong> Move is a statically typed language, which helps catch errors at compile time.</li>
                        <li><strong>Linear type system:</strong> Move's linear type system ensures that resources are used exactly once, preventing double-spending.</li>
                        <li><strong>Formal verification:</strong> Move is designed to be formally verifiable, allowing for mathematical proofs of correctness.</li>
                    </ul>
                    
                    <h3>Basic Syntax</h3>
                    <pre><code>
module 0x1::BasicCoin {
    struct Coin has key {
        value: u64
    }
    
    public fun mint(account: &signer, value: u64) {
        move_to(account, Coin { value })
    }
    
    public fun balance_of(account: &signer): u64 {
        let coin = borrow_global<Coin>(@0x1);
        coin.value
    }
}
                    </code></pre>
                    
                    <h3>Resources and Abilities</h3>
                    <p>In Move, resources are types that have special abilities:</p>
                    <ul>
                        <li><strong>key:</strong> The resource can be stored as a top-level value in global storage.</li>
                        <li><strong>store:</strong> The resource can be stored inside other resources.</li>
                        <li><strong>copy:</strong> The resource can be copied.</li>
                        <li><strong>drop:</strong> The resource can be dropped.</li>
                    </ul>
                `
            }
        },
        {
            title: 'Smart Contract Structure',
            description: 'Understand the structure of smart contracts in Move.',
            type: 'video',
            level: 3,
            reward: '20',
            isLocked: true,
            order: 3,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Resource Management',
            description: 'Learn how to manage resources in Move smart contracts.',
            type: 'text',
            level: 4,
            reward: '20',
            isLocked: true,
            order: 4,
            content: {
                textContent: `
                    <h2>Resource Management in Move</h2>
                    <p>Resource management is a core concept in Move. Unlike other programming languages where values can be freely copied and destroyed, Move enforces strict rules about how resources are handled.</p>
                    
                    <h3>Resource Creation</h3>
                    <p>Resources are created using the <code>move_to</code> function, which stores a resource in the global storage under an account's address.</p>
                    
                    <pre><code>
public fun create_resource(account: &signer, value: u64) {
    move_to(account, MyResource { value })
}
                    </code></pre>
                    
                    <h3>Resource Access</h3>
                    <p>Resources can be accessed using the <code>borrow_global</code> or <code>borrow_global_mut</code> functions, which return a reference to the resource.</p>
                    
                    <pre><code>
public fun get_resource_value(account: address): u64 {
    let resource = borrow_global<MyResource>(account);
    resource.value
}
                    </code></pre>
                    
                    <h3>Resource Destruction</h3>
                    <p>Resources can be destroyed using the <code>move_from</code> function, which removes a resource from global storage.</p>
                    
                    <pre><code>
public fun destroy_resource(account: address): MyResource {
    move_from<MyResource>(account)
}
                    </code></pre>
                    
                    <h3>Resource Transfer</h3>
                    <p>Resources can be transferred between accounts using the <code>move_to</code> function.</p>
                    
                    <pre><code>
public fun transfer_resource(from: &signer, to: address, value: u64) {
    let resource = MyResource { value };
    move_to(to, resource);
}
                    </code></pre>
                `
            }
        },
        {
            title: 'Testing Smart Contracts',
            description: 'Learn how to test your Move smart contracts.',
            type: 'video',
            level: 5,
            reward: '20',
            isLocked: true,
            order: 5,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Security Best Practices',
            description: 'Discover best practices for securing your smart contracts.',
            type: 'text',
            level: 6,
            reward: '20',
            isLocked: true,
            order: 6,
            content: {
                textContent: `
                    <h2>Security Best Practices for Smart Contracts</h2>
                    <p>Smart contracts often handle valuable assets, making security a top priority. Here are some best practices for securing your Move smart contracts.</p>
                    
                    <h3>Access Control</h3>
                    <p>Implement proper access control to ensure that only authorized users can perform sensitive operations.</p>
                    
                    <pre><code>
public fun sensitive_operation(account: &signer) {
    assert!(is_admin(@account), 0); // Check if the account is an admin
    // Perform sensitive operation
}
                    </code></pre>
                    
                    <h3>Input Validation</h3>
                    <p>Always validate inputs to prevent unexpected behavior.</p>
                    
                    <pre><code>
public fun transfer(account: &signer, amount: u64) {
    assert!(amount > 0, 0); // Ensure amount is positive
    // Perform transfer
}
                    </code></pre>
                    
                    <h3>Reentrancy Protection</h3>
                    <p>Protect against reentrancy attacks by updating state before making external calls.</p>
                    
                    <pre><code>
public fun withdraw(account: &signer, amount: u64) {
    // Update state first
    let balance = borrow_global_mut<Balance>(@account);
    assert!(balance.value >= amount, 0);
    balance.value = balance.value - amount;
    
    // Then make external call
    transfer(account, amount);
}
                    </code></pre>
                    
                    <h3>Formal Verification</h3>
                    <p>Use formal verification tools to prove the correctness of your smart contracts.</p>
                    
                    <h3>Auditing</h3>
                    <p>Have your smart contracts audited by security experts before deploying them to production.</p>
                `
            }
        },
        {
            title: 'Deploying Smart Contracts',
            description: 'Learn how to deploy your smart contracts to the Aptos blockchain.',
            type: 'video',
            level: 7,
            reward: '20',
            isLocked: true,
            order: 7,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Final Quiz',
            description: 'Test your knowledge of Move smart contract development with this comprehensive quiz.',
            type: 'quiz',
            level: 8,
            reward: '80',
            isLocked: true,
            order: 8,
            content: {
                questions: [
                    {
                        question: 'What is the primary feature of Move that distinguishes it from other programming languages?',
                        options: [
                            'It is a functional programming language',
                            'It is resource-oriented',
                            'It is dynamically typed',
                            'It is interpreted rather than compiled'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of the following is NOT an ability in Move?',
                        options: [
                            'key',
                            'store',
                            'copy',
                            'delete'
                        ],
                        correctAnswer: 3
                    },
                    {
                        question: 'How do you create a resource in Move?',
                        options: [
                            'Using the create_resource function',
                            'Using the move_to function',
                            'Using the new_resource function',
                            'Using the resource keyword'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the purpose of the assert! macro in Move?',
                        options: [
                            'To print debug information',
                            'To create a new resource',
                            'To check a condition and abort if it is false',
                            'To transfer a resource between accounts'
                        ],
                        correctAnswer: 2
                    },
                    {
                        question: 'Which of the following is a best practice for securing smart contracts?',
                        options: [
                            'Using global variables for sensitive data',
                            'Implementing proper access control',
                            'Allowing anyone to call any function',
                            'Using hardcoded values for critical parameters'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        }
    ],
    
    // Course 3: Web3 Development
    [
        {
            title: 'Introduction to Web3',
            description: 'Learn about Web3 and how it differs from Web1 and Web2.',
            type: 'video',
            level: 1,
            reward: '15',
            isLocked: false,
            order: 1,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Web3 Architecture',
            description: 'Understand the architecture of Web3 applications.',
            type: 'text',
            level: 2,
            reward: '15',
            isLocked: true,
            order: 2,
            content: {
                textContent: `
                    <h2>Web3 Architecture</h2>
                    <p>Web3 applications have a unique architecture that combines blockchain technology with traditional web technologies. Understanding this architecture is crucial for building effective Web3 applications.</p>
                    
                    <h3>Components of a Web3 Application</h3>
                    <ul>
                        <li><strong>Frontend:</strong> The user interface of the application, typically built with HTML, CSS, and JavaScript.</li>
                        <li><strong>Backend:</strong> The server-side logic of the application, which may interact with the blockchain.</li>
                        <li><strong>Blockchain:</strong> The decentralized ledger that stores data and executes smart contracts.</li>
                        <li><strong>Wallet:</strong> A software that allows users to interact with the blockchain, manage their keys, and sign transactions.</li>
                    </ul>
                    
                    <h3>Communication Flow</h3>
                    <p>In a Web3 application, the communication flow typically involves:</p>
                    <ol>
                        <li>The user interacts with the frontend.</li>
                        <li>The frontend sends a request to the backend.</li>
                        <li>The backend interacts with the blockchain, either by reading data or sending transactions.</li>
                        <li>The blockchain processes the request and returns a response.</li>
                        <li>The backend processes the response and sends it back to the frontend.</li>
                        <li>The frontend updates the user interface based on the response.</li>
                    </ol>
                    
                    <h3>Key Technologies</h3>
                    <ul>
                        <li><strong>Web3.js:</strong> A JavaScript library for interacting with Ethereum-compatible blockchains.</li>
                        <li><strong>MetaMask:</strong> A popular wallet for Ethereum-compatible blockchains.</li>
                        <li><strong>IPFS:</strong> A decentralized storage system for storing files off-chain.</li>
                        <li><strong>The Graph:</strong> A protocol for indexing and querying blockchain data.</li>
                    </ul>
                `
            }
        },
        {
            title: 'Connecting to Aptos',
            description: 'Learn how to connect your application to the Aptos blockchain.',
            type: 'video',
            level: 3,
            reward: '15',
            isLocked: true,
            order: 3,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Wallet Integration',
            description: 'Integrate wallets into your Web3 application.',
            type: 'text',
            level: 4,
            reward: '15',
            isLocked: true,
            order: 4,
            content: {
                textContent: `
                    <h2>Wallet Integration in Web3 Applications</h2>
                    <p>Wallets are a crucial component of Web3 applications, as they allow users to interact with the blockchain, manage their keys, and sign transactions. Integrating wallets into your application is essential for providing a seamless user experience.</p>
                    
                    <h3>Types of Wallets</h3>
                    <ul>
                        <li><strong>Browser Extensions:</strong> Wallets that are installed as browser extensions, such as MetaMask and Petra.</li>
                        <li><strong>Mobile Wallets:</strong> Wallets that are installed as mobile applications, such as Trust Wallet and Coinbase Wallet.</li>
                        <li><strong>Hardware Wallets:</strong> Physical devices that store keys offline, such as Ledger and Trezor.</li>
                        <li><strong>Web Wallets:</strong> Wallets that are accessed through a web browser, such as MyEtherWallet.</li>
                    </ul>
                    
                    <h3>Integrating Petra Wallet</h3>
                    <p>Petra is a popular wallet for the Aptos blockchain. Here's how to integrate it into your application:</p>
                    
                    <pre><code>
// Check if Petra is installed
if (window.aptos) {
    // Connect to Petra
    window.aptos.connect()
        .then(response => {
            console.log('Connected to Petra:', response);
            // Store the account address
            const accountAddress = response.address;
        })
        .catch(error => {
            console.error('Error connecting to Petra:', error);
        });
} else {
    console.error('Petra is not installed');
}
                    </code></pre>
                    
                    <h3>Signing Transactions</h3>
                    <p>Once connected to a wallet, you can sign transactions:</p>
                    
                    <pre><code>
// Create a transaction
const transaction = {
    function: '0x1::coin::transfer',
    type_arguments: ['0x1::aptos_coin::AptosCoin'],
    arguments: [recipientAddress, amount]
};

// Sign and submit the transaction
window.aptos.signAndSubmitTransaction(transaction)
    .then(response => {
        console.log('Transaction submitted:', response);
    })
    .catch(error => {
        console.error('Error submitting transaction:', error);
    });
                    </code></pre>
                `
            }
        },
        {
            title: 'Smart Contract Interaction',
            description: 'Learn how to interact with smart contracts from your Web3 application.',
            type: 'video',
            level: 5,
            reward: '15',
            isLocked: true,
            order: 5,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Event Handling',
            description: 'Handle blockchain events in your Web3 application.',
            type: 'text',
            level: 6,
            reward: '15',
            isLocked: true,
            order: 6,
            content: {
                textContent: `
                    <h2>Event Handling in Web3 Applications</h2>
                    <p>Events are a way for smart contracts to communicate with the outside world. They allow applications to react to changes in the blockchain state. Handling events is an important part of building responsive Web3 applications.</p>
                    
                    <h3>Understanding Events</h3>
                    <p>Events are emitted by smart contracts when certain actions occur. They contain data about the action that triggered them, such as the sender, recipient, and amount of a transfer.</p>
                    
                    <h3>Listening for Events</h3>
                    <p>To listen for events, you need to subscribe to them using the appropriate API. Here's how to listen for events on the Aptos blockchain:</p>
                    
                    <pre><code>
// Subscribe to events
const eventHandle = window.aptos.subscribeEvent({
    address: contractAddress,
    eventName: 'TransferEvent',
    eventHandle: eventHandle
}, (event) => {
    console.log('Event received:', event);
    // Handle the event
});
                    </code></pre>
                    
                    <h3>Filtering Events</h3>
                    <p>You can filter events to only receive those that match certain criteria:</p>
                    
                    <pre><code>
// Subscribe to filtered events
const eventHandle = window.aptos.subscribeEvent({
    address: contractAddress,
    eventName: 'TransferEvent',
    eventHandle: eventHandle,
    filter: {
        sender: senderAddress
    }
}, (event) => {
    console.log('Filtered event received:', event);
    // Handle the event
});
                    </code></pre>
                    
                    <h3>Unsubscribing from Events</h3>
                    <p>To stop listening for events, you need to unsubscribe:</p>
                    
                    <pre><code>
// Unsubscribe from events
window.aptos.unsubscribeEvent(eventHandle);
                    </code></pre>
                `
            }
        },
        {
            title: 'Building a Complete Web3 App',
            description: 'Build a complete Web3 application from scratch.',
            type: 'video',
            level: 7,
            reward: '15',
            isLocked: true,
            order: 7,
            content: {
                videoUrl: '/courcedemo.mp4'
            }
        },
        {
            title: 'Final Quiz',
            description: 'Test your knowledge of Web3 development with this comprehensive quiz.',
            type: 'quiz',
            level: 8,
            reward: '60',
            isLocked: true,
            order: 8,
            content: {
                questions: [
                    {
                        question: 'What is Web3?',
                        options: [
                            'A new version of HTML',
                            'A decentralized version of the web built on blockchain technology',
                            'A new programming language',
                            'A new web browser'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of the following is NOT a component of a Web3 application?',
                        options: [
                            'Frontend',
                            'Backend',
                            'Blockchain',
                            'Database'
                        ],
                        correctAnswer: 3
                    },
                    {
                        question: 'What is a wallet in the context of Web3?',
                        options: [
                            'A physical device for storing cryptocurrency',
                            'A software that allows users to interact with the blockchain',
                            'A type of smart contract',
                            'A decentralized storage system'
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you connect to the Petra wallet?',
                        options: [
                            'Using the connect() method',
                            'Using the login() method',
                            'Using the authorize() method',
                            'Using the authenticate() method'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'What are events in the context of smart contracts?',
                        options: [
                            'A way for smart contracts to communicate with the outside world',
                            'A type of smart contract',
                            'A way to store data on the blockchain',
                            'A way to transfer cryptocurrency'
                        ],
                        correctAnswer: 0
                    }
                ]
            }
        }
    ]
];

// Function to seed the database
async function seedDatabase() {
    try {
        // Clear existing data
        await Course.deleteMany({});
        await Module.deleteMany({});
        
        console.log('Database cleared');
        
        // Create courses
        const createdCourses = await Course.insertMany(courses);
        console.log('Courses created');
        
        // Create modules for each course
        for (let i = 0; i < createdCourses.length; i++) {
            const courseModules = modulesData[i].map(module => ({
                ...module,
                course: createdCourses[i]._id
            }));
            
            const createdModules = await Module.insertMany(courseModules);
            console.log(`Modules created for course ${i + 1}`);
            
            // Update course with module IDs
            createdCourses[i].modules = createdModules.map(module => module._id);
            await createdCourses[i].save();
        }
        
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase(); 