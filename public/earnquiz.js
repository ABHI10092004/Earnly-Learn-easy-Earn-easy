// State
let currentQuiz = null;
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let quizTimeLimit = 0;
let quizTimeRemaining = 0;
let timerInterval = null;
let quizStartTime = null;
let isQuizCompleted = false;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const quizTitle = document.getElementById('quizTitle');
const quizTitle2 = document.getElementById('quizTitle2');
const quizDescription = document.getElementById('quizDescription');
const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const questionCount = document.getElementById('questionCount');
const passingScore = document.getElementById('passingScore');
const rewardAmount = document.getElementById('rewardAmount');
const rewardAmount2 = document.getElementById('rewardAmount2');
const timerDisplay = document.getElementById('timerDisplay');
const quizTimeLimitElement = document.getElementById('quizTimeLimit');
const progressBar = document.getElementById('progressBar');
const currentQuestionNumber = document.getElementById('currentQuestionNumber');
const totalQuestions = document.getElementById('totalQuestions');
const totalQuestions2 = document.getElementById('totalQuestions2');
const answeredQuestions = document.getElementById('answeredQuestions');
const prevQuestionBtn = document.getElementById('prevQuestionBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const submitQuizBtn = document.getElementById('submitQuizBtn');
const quitQuizBtn = document.getElementById('quitQuizBtn');
const scoreValue = document.getElementById('scoreValue');
const resultMessage = document.getElementById('resultMessage');
const rewardEarned = document.getElementById('rewardEarned');
const resultQuizTitle = document.getElementById('resultQuizTitle');
const retakeQuizBtn = document.getElementById('retakeQuizBtn');
const backToQuizzesBtn = document.getElementById('backToQuizzesBtn');

// Initialize
document.addEventListener('DOMContentLoaded', initializeQuiz);

// Initialize Quiz
async function initializeQuiz() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            showError('You must be logged in to take quizzes.');
            loadingState.style.display = 'none';
            return;
        }

        // Get quiz ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('quizId') || localStorage.getItem('currentEarningQuiz');

        if (!quizId) {
            showError('Quiz ID not provided. Please go back to the quizzes page and select a quiz.');
            loadingState.style.display = 'none';
            return;
        }

        // Fetch quiz details and questions
        await fetchQuiz(quizId);
        
        // Check if the quiz is already completed
        if (currentQuiz.isCompleted) {
            showError('You have already completed this quiz.');
            loadingState.style.display = 'none';
            setTimeout(() => {
                window.location.href = '/quizzes.html';
            }, 3000);
            return;
        }
        
        // Set up the quiz
        setupQuiz();
        
        // Hide loading state and show quiz
        loadingState.style.display = 'none';
        quizContainer.style.display = 'block';
        
        // Start the timer
        startQuizTimer();
        
        // Set up navigation buttons
        setupNavigationButtons();
    } catch (error) {
        console.error('Error initializing quiz:', error);
        showError('Failed to load quiz. Please try again later.');
        loadingState.style.display = 'none';
    }
}

// Fetch quiz from the server
async function fetchQuiz(quizId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/quizzes/${quizId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (response.status === 404) {
                throw new Error('Quiz not found.');
            } else {
                throw new Error('Failed to fetch quiz.');
            }
        }

        const data = await response.json();
        currentQuiz = data.quiz;
        questions = currentQuiz.questions || [];
        
        // Set up time limit
        quizTimeLimit = (currentQuiz.timeLimit || 5) * 60; // Convert minutes to seconds
        quizTimeRemaining = quizTimeLimit;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
}

// Set up quiz
function setupQuiz() {
    // Set quiz title and description
    quizTitle.textContent = currentQuiz.title;
    quizTitle2.textContent = currentQuiz.title;
    quizDescription.textContent = currentQuiz.description;
    
    // Set quiz metadata
    questionCount.textContent = questions.length;
    passingScore.textContent = currentQuiz.passingScore;
    rewardAmount.textContent = currentQuiz.reward;
    rewardAmount2.textContent = currentQuiz.reward;
    quizTimeLimitElement.textContent = currentQuiz.timeLimit;
    
    // Set total questions
    totalQuestions.textContent = questions.length;
    totalQuestions2.textContent = questions.length;
    
    // Display first question
    displayCurrentQuestion();
}

// Display current question
function displayCurrentQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update question number
    currentQuestionNumber.textContent = currentQuestionIndex + 1;
    
    // Update question text
    questionText.textContent = question.question;
    
    // Clear options
    optionsList.innerHTML = '';
    
    // Add options
    question.options.forEach((option, index) => {
        const optionItem = document.createElement('li');
        optionItem.className = 'option-item';
        
        const isSelected = selectedAnswers[currentQuestionIndex] === index;
        
        optionItem.innerHTML = `
            <input type="radio" class="option-input" id="option${index}" name="question${currentQuestionIndex}" value="${index}" ${isSelected ? 'checked' : ''}>
            <label class="option-label" for="option${index}">${option}</label>
        `;
        
        optionsList.appendChild(optionItem);
        
        // Add event listener
        const radioInput = optionItem.querySelector(`#option${index}`);
        radioInput.addEventListener('change', () => {
            selectedAnswers[currentQuestionIndex] = index;
            updateQuizProgress();
            updateNavigationButtons();
        });
    });
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Update navigation buttons
function updateNavigationButtons() {
    // Previous button
    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    
    // Next button
    nextQuestionBtn.disabled = currentQuestionIndex === questions.length - 1;
    
    // Submit button
    const answeredCount = Object.keys(selectedAnswers).length;
    submitQuizBtn.disabled = answeredCount < questions.length;
}

// Set up navigation buttons
function setupNavigationButtons() {
    // Previous button
    prevQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayCurrentQuestion();
        }
    });
    
    // Next button
    nextQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }
    });
    
    // Submit button
    submitQuizBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit your quiz?')) {
            clearInterval(timerInterval);
            calculateAndShowResults();
        }
    });
    
    // Quit button
    quitQuizBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
            window.location.href = '/quizzes.html';
        }
    });
    
    // Retake button
    retakeQuizBtn.addEventListener('click', () => {
        location.reload();
    });
    
    // Back to quizzes button
    backToQuizzesBtn.addEventListener('click', () => {
        window.location.href = '/quizzes.html';
    });
}

// Start quiz timer
function startQuizTimer() {
    quizStartTime = new Date();
    
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - quizStartTime) / 1000);
        quizTimeRemaining = Math.max(0, quizTimeLimit - elapsedSeconds);
        
        updateTimerDisplay();
        
        if (quizTimeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Your quiz will be submitted now.');
            calculateAndShowResults();
        }
    }, 1000);
    
    updateTimerDisplay();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(quizTimeRemaining / 60);
    const seconds = quizTimeRemaining % 60;
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (quizTimeRemaining <= 60) {
        timerDisplay.style.color = '#dc3545';
    } else if (quizTimeRemaining <= 120) {
        timerDisplay.style.color = '#ffc107';
    } else {
        timerDisplay.style.color = '#28a745';
    }
}

// Update quiz progress
function updateQuizProgress() {
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercentage = Math.round((answeredCount / questions.length) * 100);
    
    progressBar.style.width = `${progressPercentage}%`;
    answeredQuestions.textContent = answeredCount;
    
    // Enable submit button if all questions are answered
    submitQuizBtn.disabled = answeredCount < questions.length;
}

// Calculate and show results
async function calculateAndShowResults() {
    try {
        // Calculate score
        let correctAnswers = 0;
        
        questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        const isPassed = score >= currentQuiz.passingScore;
        
        // Submit to server
        await submitQuizToServer(score);
        
        // Show results
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Update result elements
        resultQuizTitle.textContent = currentQuiz.title;
        scoreValue.textContent = `${score}%`;
        
        if (isPassed) {
            resultMessage.textContent = 'Great job! You passed the quiz.';
            resultMessage.className = 'results-message passed-message';
            rewardEarned.textContent = currentQuiz.reward;
        } else {
            resultMessage.textContent = 'Better luck next time. You did not pass the quiz.';
            resultMessage.className = 'results-message failed-message';
            rewardEarned.textContent = '0';
        }
    } catch (error) {
        console.error('Error calculating results:', error);
        showError('Failed to submit quiz results. Please try again.');
    }
}

// Submit quiz to server
async function submitQuizToServer(score) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/quizzes/${currentQuiz._id}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                score,
                answers: selectedAnswers
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit quiz results.');
        }

        const data = await response.json();
        console.log('Quiz submission response:', data);
        
        // Update the wallet balance if it's returned
        if (data.wallet) {
            updateWalletBalance(data.wallet);
        }
    } catch (error) {
        console.error('Error submitting quiz to server:', error);
        throw error;
    }
}

// Update wallet balance
function updateWalletBalance(balance) {
    const walletBalance = document.querySelector('#walletBalance');
    if (walletBalance) {
        walletBalance.textContent = `${balance} coins`;
    }
    
    const navWalletBalance = document.querySelector('.nav-wallet-balance');
    if (navWalletBalance) {
        navWalletBalance.textContent = `${balance} coins`;
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