// DOM Elements (will be populated after DOM is loaded)
let walletBalance;
let authButtons;
let userMenu;
let username;
let logoutBtn;
let loginForm;
let signupForm;
let otpForm;

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', initNavigation);

// This function can be called directly after nav.html is loaded
function initNavigation() {
    console.log("Initializing navigation...");
    
    // Get DOM elements
    walletBalance = document.querySelector('.nav-wallet-balance');
    authButtons = document.querySelector('.nav-auth-buttons');
    userMenu = document.querySelector('.nav-user-menu');
    username = document.querySelector('.nav-username');
    logoutBtn = document.querySelector('.nav-logout-btn');
    loginForm = document.getElementById('loginForm');
    signupForm = document.getElementById('signupForm');
    otpForm = document.getElementById('otpForm');
    
    // Check if elements exist (nav might not be loaded yet)
    if (!authButtons || !userMenu) {
        console.log("Navigation elements not found, will retry in 100ms");
        setTimeout(initNavigation, 100);
        return;
    }
    
    console.log("Navigation elements found, continuing initialization");
    
    // Initialize navigation
    initializeNav();
    
    // Setup event listeners
    setupEventListeners();
}

// Initialize navigation
async function initializeNav() {
    try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (token) {
            // Token exists, fetch user profile
            await fetchUserProfile();
            showUserMenu();
        } else {
            // No token, show auth buttons
            showAuthButtons();
        }
    } catch (error) {
        console.error('Error initializing navigation:', error);
        showAuthButtons();
    }
}

// Fetch user profile data
async function fetchUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token is expired or invalid
                localStorage.removeItem('token');
                showAuthButtons();
                throw new Error('Authentication failed. Please log in again.');
            }
            throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        
        const userData = await response.json();
        updateUserUI(userData);
        return userData;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Update user UI with profile data
function updateUserUI(userData) {
    console.log('Updating user UI with data:', userData);
    
    if (username && userData.username) {
        username.textContent = userData.username || 'User';
    }
    
    // Update wallet balance if it exists in the provided data
    if (userData.wallet !== undefined) {
        console.log('Updating wallet balance from updateUserUI:', userData.wallet);
        
        // Update wallet balance in nav bar
        if (walletBalance) {
            const walletText = document.querySelector('.nav-wallet-balance-text');
            if (walletText) {
                walletText.textContent = `Wallet: ${userData.wallet} tokens`;
            } else {
                walletBalance.textContent = `Wallet: ${userData.wallet} tokens`;
            }
        }
        
        // Also update any other wallet displays on the page
        const otherWalletDisplays = document.querySelectorAll('[id="walletBalance"]');
        if (otherWalletDisplays.length > 0) {
            otherWalletDisplays.forEach(display => {
                display.textContent = `${userData.wallet} coins`;
            });
            console.log('Updated other wallet displays on page');
        }
        
        // Update local storage wallet data
        try {
            let storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
            storedUserData.wallet = userData.wallet;
            localStorage.setItem('userData', JSON.stringify(storedUserData));
            console.log('Updated userData in localStorage with new wallet balance');
        } catch (e) {
            console.log('Could not update userData in localStorage', e);
        }
    } else {
        console.log('No wallet data provided to updateUserUI');
    }
}

// Show authentication buttons
function showAuthButtons() {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

// Show user menu
function showUserMenu() {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                
                localStorage.setItem('token', data.token);
                await fetchUserProfile();
                showUserMenu();
                
                // Close login modal
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) loginModal.hide();
                
                showSuccess('Login successful!');
            } catch (error) {
                console.error('Login error:', error);
                showError(error.message || 'Login failed. Please try again.');
            }
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const username = document.getElementById('signupUsername').value;
                const fullName = document.getElementById('signupFullName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                
                console.log('Signup data:', { username, fullName, email });
                
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, fullName, email, password })
                });
                
                const data = await response.json();
                console.log('Signup response:', data);
                
                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }
                
                // Close signup modal
                const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                if (signupModal) signupModal.hide();
                
                // Open OTP modal
                const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
                if (otpModal) otpModal.show();
                
                // Store email for OTP verification
                localStorage.setItem('pendingVerificationEmail', email);
                
                // If OTP is returned in development mode, show it
                if (data.otp) {
                    console.log('Development OTP:', data.otp);
                    const otpInput = document.getElementById('otpCode');
                    if (otpInput) otpInput.value = data.otp;
                }
                
                showSuccess('Signup successful! Please verify your email.');
            } catch (error) {
                console.error('Signup error:', error);
                showError(error.message || 'Signup failed. Please try again.');
            }
        });
    }
    
    // OTP verification form
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = localStorage.getItem('pendingVerificationEmail');
                const otp = document.getElementById('otpCode').value;
                
                if (!email) {
                    throw new Error('Email not found. Please try signing up again.');
                }
                
                console.log('Verifying OTP for email:', email);
                
                const response = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, otp })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'OTP verification failed');
                }
                
                // Save token
                localStorage.setItem('token', data.token);
                localStorage.removeItem('pendingVerificationEmail');
                
                // Close OTP modal
                const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
                if (otpModal) otpModal.hide();
                
                // Update user UI
                await fetchUserProfile();
                showUserMenu();
                
                showSuccess('Email verified successfully! You are now logged in.');
            } catch (error) {
                console.error('OTP verification error:', error);
                showError(error.message || 'OTP verification failed. Please try again.');
            }
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Resend OTP link
    const resendOtpLink = document.getElementById('resendOtp');
    if (resendOtpLink) {
        resendOtpLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const email = localStorage.getItem('pendingVerificationEmail');
                
                if (!email) {
                    throw new Error('Email not found. Please try signing up again.');
                }
                
                showSuccess('Requesting new OTP...');
                
                // You would need to implement a resend OTP endpoint
                const response = await fetch('/api/auth/resend-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to resend OTP');
                }
                
                // If OTP is returned in development mode, show it
                if (data.otp) {
                    console.log('Development OTP:', data.otp);
                    const otpInput = document.getElementById('otpCode');
                    if (otpInput) otpInput.value = data.otp;
                }
                
                showSuccess('New verification code sent!');
            } catch (error) {
                console.error('Resend OTP error:', error);
                showError(error.message || 'Failed to resend verification code. Please try again.');
            }
        });
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    showAuthButtons();
    showSuccess('Logged out successfully');
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