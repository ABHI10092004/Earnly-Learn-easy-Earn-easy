// Global variables
let featuredCourses = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Fix preloader issue immediately
    handlePreloader();
    
    // Initialize after nav is loaded
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Function to handle preloader and ensure it's removed
function handlePreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    
    // Method 1: On DOMContentLoaded (already triggered)
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1000);
    
    // Method 2: On window load
    window.addEventListener('load', () => {
        preloader.classList.add('preloader-hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });
    
    // Method 3: Failsafe - force remove after 5 seconds no matter what
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        preloader.style.display = 'none';
    }, 5000);
}

// Main initialization function
function initializeApp() {
    // Set up event listeners for homepage-specific elements
    setupEventListeners();
    
    // Fetch featured courses for homepage
    fetchFeaturedCourses();
}

// Set up event listeners
function setupEventListeners() {
    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // If logged in, go to dashboard, otherwise show login modal
            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '/dashboard';
            } else {
                // Open login modal if available
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                if (loginModal) {
                    loginModal.show();
                }
            }
        });
    }

    // Learn More button
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            // Scroll to How It Works section
            document.getElementById('how-it-works').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Wallet box click event (after nav is loaded)
    setTimeout(() => {
        const walletBox = document.querySelector('.wallet-box');
        if (walletBox) {
            walletBox.addEventListener('click', () => {
                window.location.href = '/transactions.html';
            });
        }
    }, 200);
}

// Fetch featured courses from API
async function fetchFeaturedCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return; // Only run on homepage
    
    try {
        // Change from featured endpoint to get all courses
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        // Handle the response format which might be different
        const data = await response.json();
        featuredCourses = data.courses || data; // Handle both array or {courses: [...]} formats
        displayFeaturedCourses();
    } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to sample data if API fails
        featuredCourses = [
            {
                _id: 'sample1',
                title: 'Introduction to Blockchain',
                description: 'Learn the basics of blockchain technology and cryptocurrency',
                image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '100 tokens'
            },
            {
                _id: 'sample2',
                title: 'Smart Contract Development',
                description: 'Master the art of writing smart contracts',
                image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '200 tokens'
            },
            {
                _id: 'sample3',
                title: 'Web3 Development',
                description: 'Build decentralized applications',
                image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
                reward: '150 tokens'
            }
        ];
        displayFeaturedCourses();
    }
}

// Display featured courses
function displayFeaturedCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;
    
    coursesContainer.innerHTML = featuredCourses.map(course => `
        <div class="col-md-4 mb-4">
            <div class="card course-card h-100">
                <img src="${course.image}" class="card-img-top" alt="${course.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Course+Image'">
                <div class="card-body">
                    <h5 class="card-title">${course.title}</h5>
                    <p class="card-text">${course.description}</p>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">
                        <i class="fas fa-coins me-1"></i>${course.reward}
                    </span>
                    <a href="course-details.html?id=${course._id}" class="btn btn-outline-primary">Enroll Now</a>
                </div>
            </div>
        </div>
    `).join('');
} 