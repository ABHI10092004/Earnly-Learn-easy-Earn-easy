// Learn-to-Earn Chatbot Functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatToggle = document.getElementById('chat-toggle');
    const minimizeBtn = document.getElementById('minimize-btn');

    // Initialize chat state (hidden by default on page load)
    chatContainer.classList.add('hidden');
    chatToggle.classList.remove('hidden');

    // Toggle chat window when chat button is clicked
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.remove('hidden');
        chatToggle.classList.add('hidden');
        // Focus on input field when chat is opened
        setTimeout(() => {
            userInput.focus();
        }, 400); // Wait for animation to complete
    });

    // Minimize chat when minimize button is clicked
    minimizeBtn.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
        chatToggle.classList.remove('hidden');
    });

    // Function to add a message to the chat
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to generate a bot response
    async function getBotResponse(userMessage) {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.innerHTML = '<div class="message-content"><i class="fas fa-circle typing-dot"></i><i class="fas fa-circle typing-dot"></i><i class="fas fa-circle typing-dot"></i></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Simple pattern matching responses
            let botResponse = '';
            const userMessageLower = userMessage.toLowerCase();
            
            // Learn-to-Earn Platform responses
            if (userMessageLower.includes('what is learn') || 
                userMessageLower.includes('learn to earn') || 
                userMessageLower.includes('what is this platform')) {
                botResponse = "Learn-to-Earn is an educational model where you earn Aptos tokens while learning new skills. Our platform offers courses with interactive content, and you're rewarded with cryptocurrency tokens for completing modules, quizzes, and assignments.";
            }
            else if (userMessageLower.includes('how do i start') || 
                userMessageLower.includes('begin') || 
                userMessageLower.includes('how to use')) {
                botResponse = "Just sign up, choose a course, and begin! Complete each module and quiz to earn Aptos tokens as you progress. Our platform makes learning and earning simple.";
            }
            else if ((userMessageLower.includes('earn') || userMessageLower.includes('reward')) && 
                    (userMessageLower.includes('token') || userMessageLower.includes('aptos'))) {
                botResponse = "You earn Aptos tokens by completing course modules and quizzes. Once a module is marked as complete, tokens are automatically added to your wallet.";
            }
            else if (userMessageLower.includes('wallet') || 
                    userMessageLower.includes('balance')) {
                botResponse = "Your Aptos tokens are stored in your platform-linked wallet. You can view your balance and transaction history anytime from your dashboard.";
            }
            else if (userMessageLower.includes('course') || 
                    userMessageLower.includes('learn') || 
                    userMessageLower.includes('module')) {
                botResponse = "We offer a variety of courses divided into modules. Each module contains videos, slides, and interactive content. After completing a module, you take a quiz to validate your learning and earn tokens.";
            }
            else if (userMessageLower.includes('quiz') || 
                    userMessageLower.includes('test')) {
                botResponse = "Quizzes are short assessments at the end of each module that test your understanding. You earn tokens for successfully completing quizzes, with bonus tokens for high scores.";
            }
            // Standard responses
            else if (userMessageLower.includes('hello') || 
                    userMessageLower.includes('hi')) {
                botResponse = "Hello! Welcome to our Learn-to-Earn platform. How can I help you today?";
            }
            else if (userMessageLower.includes('thank')) {
                botResponse = "You're welcome! If you have any other questions about our Learn-to-Earn platform, just ask. Happy learning and earning!";
            }
            else if (userMessageLower.includes('bye') || 
                    userMessageLower.includes('goodbye')) {
                botResponse = "Goodbye! Come back anytime you need help with your learning journey.";
            }
            else {
                botResponse = "I'm here to help with questions about our Learn-to-Earn platform. You can ask about how to start, earn tokens, track progress, available courses, or how the wallet system works.";
            }
            
            // Simulate typing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Remove typing indicator and add actual response
            chatMessages.removeChild(typingDiv);
            addMessage(botResponse, false);
            
        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(typingDiv);
            addMessage("Sorry, I encountered an error. Please try again.", false);
        }
    }

    // Send message when button is clicked
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });

    // Send message when Enter key is pressed
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to handle sending a message
    function sendMessage() {
        const message = userInput.value.trim();
        
        if (message) {
            // Add user message to chat
            addMessage(message, true);
            
            // Clear input field
            userInput.value = '';
            
            // Get and display bot response
            getBotResponse(message);
        }
    }

    // Initialize chat with welcome message
    function initializeChat() {
        const welcomeMessage = "Hi there! I'm your Learn-to-Earn assistant. How can I help you with our Aptos token reward platform today?";
        addMessage(welcomeMessage, false);
    }

    // Initialize chat with welcome message
    initializeChat();
}); 