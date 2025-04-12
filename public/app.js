// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const otpForm = document.getElementById('otpForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const walletBox = document.getElementById('walletBox');

// Store email and OTP for verification
let userEmail = '';
let userOTP = '';

// Sample featured courses data - will be replaced with API data
let featuredCourses = [];

// Check if user is logged in
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // User is logged in, show wallet box and hide login button
        loginBtn.style.display = 'none';
        walletBox.style.display = 'flex';
        
        // Fetch user data to display wallet balance
        fetchUserData();
    } else {
        // User is not logged in, show login button and hide wallet box
        loginBtn.style.display = 'block';
        walletBox.style.display = 'none';
    }
}

// Fetch user data to display wallet balance
async function fetchUserData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            // Update wallet balance
            document.getElementById('walletBalance').textContent = `${userData.wallet || '0'} APT`;
        } else {
            // If token is invalid, clear it and show login button
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkLoginStatus();
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Fetch featured courses from API
async function fetchFeaturedCourses() {
    try {
        const response = await fetch('/api/courses/featured');
        if (!response.ok) throw new Error('Failed to fetch featured courses');
        
        featuredCourses = await response.json();
        displayFeaturedCourses();
    } catch (error) {
        console.error('Error fetching featured courses:', error);
        // Fallback to sample data if API fails
        featuredCourses = [
            {
                _id: 'sample1',
                title: 'Introduction to Blockchain',
                description: 'Learn the basics of blockchain technology and cryptocurrency',
                image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '100 APT'
            },
            {
                _id: 'sample2',
                title: 'Smart Contract Development',
                description: 'Master the art of writing smart contracts on Aptos',
                image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '200 APT'
            },
            {
                _id: 'sample3',
                title: 'Web3 Development',
                description: 'Build decentralized applications on the Aptos blockchain',
                image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '150 APT'
            }
        ];
        displayFeaturedCourses();
    }
}

// Display featured courses
function displayFeaturedCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    coursesContainer.innerHTML = featuredCourses.map(course => `
        <div class="col-md-4">
            <div class="card course-card">
                <img src="${course.image}" class="card-img-top" alt="${course.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Course+Image'">
                <div class="card-body">
                    <h5 class="card-title">${course.title}</h5>
                    <p class="card-text">${course.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${course.reward}</span>
                        <a href="course-details.html?id=${course._id}" class="btn btn-outline-primary">Enroll Now</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginModal.show();
});

// Wallet box click event
if (walletBox) {
    walletBox.addEventListener('click', () => {
        window.location.href = '/transactions.html';
    });
}

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.hide();
    signupModal.show();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.hide();
    loginModal.show();
});

// Handle Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', response.status, data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            // Update UI to show wallet box
            checkLoginStatus();
            loginModal.hide();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
});

// Handle Signup Form Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupForm.querySelector('input[type="text"]').value;
    const fullName = signupForm.querySelectorAll('input[type="text"]')[1].value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;

    // Store email for OTP verification
    userEmail = email;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, fullName, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Store OTP for development purposes
            userOTP = data.otp;
            signupModal.hide();
            otpModal.show();
            
            // Display OTP for development purposes
            const otpInput = otpForm.querySelector('input[type="text"]');
            otpInput.value = userOTP;
            
            // Show OTP in console for development
            console.log('Development OTP:', userOTP);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
});

// Handle OTP Form Submit
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = otpForm.querySelector('input[type="text"]').value;

    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail, otp })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            // Update UI to show wallet box
            checkLoginStatus();
            otpModal.hide();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('An error occurred during OTP verification');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedCourses();
    checkLoginStatus();
}); 