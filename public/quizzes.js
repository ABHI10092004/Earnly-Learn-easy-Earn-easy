// State
let earningQuizzes = [];
let completedQuizzes = [];

// DOM Elements
const quizzesContainer = document.getElementById('quizzesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const walletBalance = document.getElementById('walletBalance');

// Initialize
document.addEventListener('DOMContentLoaded', initializeQuizzes);

// Initialize Quizzes
async function initializeQuizzes() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            showError('You must be logged in to view and take quizzes.');
            loadingIndicator.style.display = 'none';
            return;
        }

        // Update wallet balance
        updateWalletBalance();
        
        // Fetch quizzes
        await fetchQuizzes();
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Show quizzes or empty state
        if (earningQuizzes.length > 0) {
            renderQuizzes();
            quizzesContainer.style.display = 'flex';
        } else {
            emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('Error initializing quizzes:', error);
        showError('Failed to load quizzes. Please try again later.');
        loadingIndicator.style.display = 'none';
    }
}

// Fetch quizzes from the server
async function fetchQuizzes() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/quizzes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                throw new Error('Failed to fetch quizzes.');
            }
        }

        const data = await response.json();
        earningQuizzes = data.quizzes || [];
        completedQuizzes = data.completedQuizzes || [];
        
        console.log('Quizzes loaded:', earningQuizzes);
        console.log('Completed quizzes:', completedQuizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
}

// Render quizzes
function renderQuizzes() {
    quizzesContainer.innerHTML = '';
    
    earningQuizzes.forEach(quiz => {
        const isCompleted = completedQuizzes.includes(quiz._id);
        
        const quizCard = document.createElement('div');
        quizCard.className = 'col-md-4 mb-4';
        quizCard.innerHTML = `
            <div class="position-relative">
                ${isCompleted ? '<span class="completed-badge"><i class="fas fa-check-circle me-1"></i>Completed</span>' : ''}
                <div class="quiz-card ${isCompleted ? 'completed' : ''}">
                    <div class="quiz-card-header">
                        <h3 class="quiz-title">${quiz.title}</h3>
                        <div class="quiz-stats">
                            <div class="quiz-stat-item">
                                <i class="fas fa-question-circle"></i>
                                ${quiz.questionCount || quiz.questions?.length || 0} Questions
                            </div>
                            <div class="quiz-stat-item">
                                <i class="fas fa-clock"></i>
                                ${quiz.timeLimit || 5} min
                            </div>
                        </div>
                    </div>
                    <div class="quiz-card-body">
                        <p class="quiz-description">${quiz.description}</p>
                        <div class="quiz-reward">
                            <i class="fas fa-coins"></i>
                            ${quiz.reward} tokens
                        </div>
                    </div>
                    <div class="quiz-card-footer text-center">
                        <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" 
                                onclick="startQuiz('${quiz._id}')"
                                ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? 'Completed' : 'Start Quiz'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        quizzesContainer.appendChild(quizCard);
    });
}

// Start quiz
function startQuiz(quizId) {
    const quiz = earningQuizzes.find(q => q._id === quizId);
    if (!quiz) {
        showError('Quiz not found.');
        return;
    }
    
    // Store quiz ID in local storage or session storage
    localStorage.setItem('currentEarningQuiz', quizId);
    
    // Navigate to quiz page
    window.location.href = `/earnquiz.html?quizId=${quizId}`;
}

// Update wallet balance
async function updateWalletBalance() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/user/wallet', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch wallet balance.');
        }

        const data = await response.json();
        
        // Update UI
        if (walletBalance) {
            walletBalance.textContent = `${data.balance} coins`;
        }
        
        // Update navigation bar wallet balance if exists
        const navWalletBalance = document.querySelector('.nav-wallet-balance');
        if (navWalletBalance) {
            navWalletBalance.textContent = `${data.balance} coins`;
        }
    } catch (error) {
        console.error('Error updating wallet balance:', error);
    }
}

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
} 