// Example Quizzes with Sample Questions
const exampleQuizzes = [
  {
    title: "Web Development Fundamentals",
    description: "Test your knowledge of HTML, CSS, and JavaScript fundamentals",
    timeLimit: 5, // minutes
    reward: 20, // tokens
    questionCount: 5,
    questions: [
      {
        text: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1 // <a>
      },
      {
        text: "Which CSS property is used to change the text color?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: 2 // color
      },
      {
        text: "Which JavaScript method is used to add an element at the end of an array?",
        options: ["append()", "push()", "add()", "insert()"],
        correctAnswer: 1 // push()
      },
      {
        text: "What does CSS stand for?",
        options: ["Counter Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets"],
        correctAnswer: 2 // Cascading Style Sheets
      },
      {
        text: "Which operator is used for strict equality in JavaScript?",
        options: ["==", "===", "=", "equals()"],
        correctAnswer: 1 // ===
      }
    ]
  },
  {
    title: "Blockchain Basics",
    description: "Learn about blockchain technology and cryptocurrency fundamentals",
    timeLimit: 7, // minutes
    reward: 20, // tokens
    questionCount: 5,
    questions: [
      {
        text: "What is the primary purpose of blockchain technology?",
        options: ["To create cryptocurrencies", "To decentralize databases", "To speed up transaction processing", "To eliminate banks"],
        correctAnswer: 1 // To decentralize databases
      },
      {
        text: "Which consensus mechanism does Bitcoin use?",
        options: ["Proof of Stake", "Proof of Work", "Proof of Authority", "Proof of History"],
        correctAnswer: 1 // Proof of Work
      },
      {
        text: "What is a smart contract?",
        options: ["A legal contract for cryptocurrency", "A self-executing contract with the terms directly written into code", "A contract managed by AI", "A hardware wallet for secure storage"],
        correctAnswer: 1 // Self-executing contract...
      },
      {
        text: "What technology is the foundation of most cryptocurrencies?",
        options: ["Cloud computing", "Artificial intelligence", "Blockchain", "Quantum computing"],
        correctAnswer: 2 // Blockchain
      },
      {
        text: "What is a block in blockchain technology?",
        options: ["A unit of cryptocurrency", "A collection of transactions", "A type of digital wallet", "A mining computer"],
        correctAnswer: 1 // A collection of transactions
      }
    ]
  },
  {
    title: "Digital Marketing Essentials",
    description: "Test your knowledge of digital marketing strategies and concepts",
    timeLimit: 6, // minutes
    reward: 20, // tokens
    questionCount: 5,
    questions: [
      {
        text: "What does SEO stand for?",
        options: ["Search Engine Optimization", "Social Engagement Outreach", "Search Experience Output", "Site Engine Optimization"],
        correctAnswer: 0 // Search Engine Optimization
      },
      {
        text: "Which metric measures the percentage of visitors who leave a website after viewing only one page?",
        options: ["Conversion rate", "Click-through rate", "Bounce rate", "Impression rate"],
        correctAnswer: 2 // Bounce rate
      },
      {
        text: "What is a call-to-action (CTA) in marketing?",
        options: ["A phone call to a customer", "A prompt encouraging an immediate response", "A marketing goal", "A social media notification"],
        correctAnswer: 1 // A prompt encouraging an immediate response
      },
      {
        text: "Which platform is primarily used for professional networking?",
        options: ["Instagram", "TikTok", "Twitter", "LinkedIn"],
        correctAnswer: 3 // LinkedIn
      },
      {
        text: "What type of marketing focuses on creating and sharing content to attract a defined audience?",
        options: ["Email marketing", "Content marketing", "Affiliate marketing", "Influencer marketing"],
        correctAnswer: 1 // Content marketing
      }
    ]
  }
];

// Function to add quizzes to the database
async function addExampleQuizzes() {
  try {
    // Check if user is logged in and has admin access
    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('You need to be logged in as an admin to add quizzes.', 'danger');
      return;
    }

    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'alert alert-info';
    loadingDiv.role = 'alert';
    loadingDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div> Adding example quizzes to database...';
    document.body.appendChild(loadingDiv);
    
    // Track success and failures
    let successes = 0;
    let failures = 0;
    
    // Process each quiz
    for (const quiz of exampleQuizzes) {
      try {
        // Call API to add quiz to database
        const response = await fetch('/api/admin/earning-quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(quiz)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`Added quiz: ${quiz.title}`, data);
          successes++;
        } else {
          console.error(`Failed to add quiz: ${quiz.title}`, data);
          failures++;
        }
      } catch (error) {
        console.error(`Error adding quiz: ${quiz.title}`, error);
        failures++;
      }
    }
    
    // Remove loading indicator
    document.body.removeChild(loadingDiv);
    
    // Show results
    if (successes > 0) {
      showMessage(`Successfully added ${successes} example quizzes to the database.`, 'success');
      
      // Ask if user wants to view quizzes
      if (confirm('Example quizzes added successfully! Would you like to go to the Quiz to Earn page to view them?')) {
        redirectToQuizzesPage();
      }
    }
    
    if (failures > 0) {
      showMessage(`Failed to add ${failures} quizzes. Check console for details.`, 'warning');
    }
    
  } catch (error) {
    console.error('Error in addExampleQuizzes:', error);
    showMessage('An error occurred while adding quizzes. Check console for details.', 'danger');
  }
}

// Function to redirect to quizzes page
function redirectToQuizzesPage() {
  window.location.href = '/quizzes';
}

// Helper function to show messages
function showMessage(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    if (document.body.contains(alertDiv)) {
      alertDiv.remove();
    }
  }, 5000);
}

// Run the function
document.addEventListener('DOMContentLoaded', function() {
  // Create a button to add quizzes
  const addQuizzesButton = document.createElement('button');
  addQuizzesButton.className = 'btn btn-primary position-fixed bottom-0 end-0 m-4';
  addQuizzesButton.innerHTML = '<i class="fas fa-plus me-2"></i>Add Example Quizzes';
  addQuizzesButton.addEventListener('click', addExampleQuizzes);
  document.body.appendChild(addQuizzesButton);
}); 