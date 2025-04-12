/**
 * Authentication utility functions for Earnly platform
 */

// Global variables
let currentUser = null;
let userToken = null;

// Function to check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in
        userToken = token;
        
        // Show user menu and hide auth buttons
        const authButtons = document.querySelector('.nav-auth-buttons');
        const userMenu = document.querySelector('.nav-user-menu');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Fetch user profile
        fetchUserProfile();
    } else {
        // User is not logged in
        userToken = null;
        currentUser = null;
        
        // Show auth buttons and hide user menu
        const authButtons = document.querySelector('.nav-auth-buttons');
        const userMenu = document.querySelector('.nav-user-menu');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
    
    // Add logout event listener
    const logoutBtn = document.querySelector('.nav-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Add login form submit handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    // Add signup form submit handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            signup();
        });
    }
}

// Function to fetch user profile
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        if (!response.ok) {
            // If unauthorized, clear token and reload
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to fetch user profile');
        }
        
        const userData = await response.json();
        currentUser = userData.user;
        
        // Update UI with user data
        updateUserUI();
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Function to update UI with user data
function updateUserUI() {
    if (!currentUser) return;
    
    // Update username in nav
    const usernameElement = document.querySelector('.nav-username');
    if (usernameElement) {
        usernameElement.textContent = currentUser.name || 'User';
    }
    
    // Update wallet balance
    const walletElement = document.querySelector('.nav-wallet-balance-text');
    if (walletElement) {
        walletElement.textContent = `Wallet: ${currentUser.balance || 0} tokens`;
    }
}

// Function to log in
async function login() {
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!email || !password) {
            showAlert('danger', 'Please fill in all fields');
            return;
        }
        
        // Show loading state
        const loginButton = document.querySelector('#loginForm button[type="submit"]');
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        }
        
        // Send login request
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, rememberMe })
        });
        
        // Reset button state
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
        
        if (!response.ok) {
            const error = await response.json();
            showAlert('danger', error.message || 'Login failed');
            return;
        }
        
        const data = await response.json();
        
        // Save token to local storage
        localStorage.setItem('token', data.token);
        
        // Close modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
        
        // Refresh the page
        window.location.reload();
    } catch (error) {
        console.error('Login error:', error);
        showAlert('danger', 'Login failed. Please try again.');
    }
}

// Function to sign up
async function signup() {
    try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const termsAccepted = document.getElementById('termsCheck').checked;
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            showAlert('danger', 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('danger', 'Passwords do not match');
            return;
        }
        
        if (!termsAccepted) {
            showAlert('danger', 'You must accept the Terms of Service and Privacy Policy');
            return;
        }
        
        // Show loading state
        const signupButton = document.querySelector('#signupForm button[type="submit"]');
        if (signupButton) {
            signupButton.disabled = true;
            signupButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
        }
        
        // Send signup request
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        // Reset button state
        if (signupButton) {
            signupButton.disabled = false;
            signupButton.textContent = 'Create Account';
        }
        
        if (!response.ok) {
            const error = await response.json();
            showAlert('danger', error.message || 'Signup failed');
            return;
        }
        
        const data = await response.json();
        
        // Save token to local storage
        localStorage.setItem('token', data.token);
        
        // Close modal
        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        if (signupModal) {
            signupModal.hide();
        }
        
        // Show welcome message and refresh
        showAlert('success', 'Account created successfully! Welcome to Earnly!');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (error) {
        console.error('Signup error:', error);
        showAlert('danger', 'Signup failed. Please try again.');
    }
}

// Function to log out
function logout() {
    // Clear token and user data
    localStorage.removeItem('token');
    currentUser = null;
    userToken = null;
    
    // Refresh the page
    window.location.reload();
}

// Function to show alert message
function showAlert(type, message) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find a suitable container for the alert
    let container = document.querySelector('.modal.show .modal-body');
    
    // If no modal is open, try to find the main content area
    if (!container) {
        container = document.querySelector('.container');
    }
    
    // If still no container found, use body
    if (!container) {
        container = document.body;
        alertElement.style.position = 'fixed';
        alertElement.style.top = '20px';
        alertElement.style.left = '50%';
        alertElement.style.transform = 'translateX(-50%)';
        alertElement.style.zIndex = '9999';
        alertElement.style.minWidth = '300px';
    }
    
    // Insert at the beginning of the container
    container.insertBefore(alertElement, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.parentNode.removeChild(alertElement);
        }
    }, 5000);
} 