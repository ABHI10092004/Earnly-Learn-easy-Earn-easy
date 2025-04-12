// State management
let currentModule = null;
let currentCourse = null;
let userProgress = null;
let videoWatched = false;

// DOM Elements
const moduleTitle = document.getElementById('moduleTitle');
const courseTitle = document.getElementById('courseTitle');
const moduleReward = document.getElementById('moduleReward');
const moduleDescription = document.getElementById('moduleDescription');
const moduleVideo = document.getElementById('moduleVideo');
const completeVideoBtn = document.getElementById('completeVideoBtn');
const prevModuleBtn = document.getElementById('prevModuleBtn');
const nextModuleBtn = document.getElementById('nextModuleBtn');
const progressBarFill = document.getElementById('progressBarFill');
const completedModules = document.getElementById('completedModules');
const totalModulesCount = document.getElementById('totalModulesCount');
const completedModulesList = document.getElementById('completedModulesList');
const progressBar = document.getElementById('progressBar');

// Initialize the video module
async function initializeVideoModule() {
    try {
        // Get module ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const moduleId = urlParams.get('moduleId');
        const courseId = urlParams.get('courseId');

        if (!moduleId || !courseId) {
            throw new Error('Module ID or Course ID not provided');
        }

        // Fetch module and course details
        await Promise.all([
            fetchModuleDetails(moduleId),
            fetchCourseDetails(courseId),
            fetchUserProgress(courseId)
        ]);

        // Update UI with module and course information
        updateModuleUI();
        
        // Enable the complete button immediately
        if (completeVideoBtn) {
            completeVideoBtn.disabled = false;
            completeVideoBtn.classList.remove('btn-secondary');
            completeVideoBtn.classList.add('btn-success');
        }
        
        // Set up event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error initializing video module:', error);
        showError('Failed to load video module. Please try again later.');
    }
}

// Fetch module details from the API
async function fetchModuleDetails(moduleId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing');
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        
        if (!courseId) {
            throw new Error('Course ID is missing');
        }
        
        console.log('Fetching video module details:', { courseId, moduleId });
        
        const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('Module details API response status:', response.status);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access forbidden. You may not be enrolled in this course or your session has expired.');
            } else if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to fetch module details: ${errorData.message || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('Module data received:', data);
        
        // Check if module is nested in a 'module' property
        if (data.module && typeof data.module === 'object') {
            console.log('Found nested module object structure');
            currentModule = data.module;
        } else {
            currentModule = data;
        }
        
        console.log('Processed module data:', currentModule);
        
        if (!currentModule || !currentModule._id) {
            console.warn('Received module data may be invalid:', currentModule);
            throw new Error('Invalid module data received from server');
        }
        
        console.log('Module details loaded successfully:', currentModule);
        
        // Make sure video URL exists
        if (!currentModule.content || !currentModule.content.videoUrl) {
            console.error('Video URL is missing or invalid format');
            throw new Error('This video module has no video URL or is in an invalid format');
        }
    } catch (error) {
        console.error('Error in fetchModuleDetails:', error);
        showError(error.message || 'Failed to load video details');
        throw error;
    }
}

// Fetch course details from the API
async function fetchCourseDetails(courseId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing');
        }
        
        console.log('Fetching course details:', courseId);
        
        const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('Course details API response status:', response.status);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access forbidden. You may not have permission to view this course.');
            } else if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to fetch course details: ${errorData.message || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('Course data received:', data);
        
        // Check if course is nested in a 'course' property
        if (data.course && typeof data.course === 'object') {
            console.log('Found nested course object structure');
            // Combine course object with any additional properties at root level
            currentCourse = {
                ...data.course,
                isEnrolled: data.isEnrolled,
                userProgress: data.userProgress
            };
        } else {
            // Direct course object
            currentCourse = data;
        }
        
        console.log('Processed course data:', currentCourse);
        
        if (!currentCourse || !currentCourse._id) {
            console.warn('Received course data may be invalid:', currentCourse);
            throw new Error('Invalid course data received from server');
        }
        
        // Ensure modules array is valid
        if (!currentCourse.modules || !Array.isArray(currentCourse.modules)) {
            console.warn('Course has no modules or invalid modules format:', currentCourse);
            currentCourse.modules = [];
        }
        
        console.log('Course details loaded successfully:', currentCourse);
    } catch (error) {
        console.error('Error in fetchCourseDetails:', error);
        showError(error.message || 'Failed to load course details');
        throw error;
    }
}

// Fetch user progress for the course
async function fetchUserProgress(courseId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing');
        }
        
        console.log('Fetching user progress:', courseId);
        
        const response = await fetch(`/api/courses/${courseId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('User progress API response status:', response.status);

        if (!response.ok) {
            // If 404, user hasn't started the course yet
            if (response.status === 404) {
                console.log('User has not started this course yet');
                userProgress = {
                    progress: 0,
                    completedModules: [],
                    moduleProgress: []
                };
                return;
            } else if (response.status === 403) {
                throw new Error('Access forbidden. You may not be enrolled in this course.');
            } else if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to fetch user progress: ${errorData.message || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('User progress data received:', data);
        userProgress = data;
        
        // Check if this module is already completed
        if (currentModule && userProgress.moduleProgress) {
            const moduleProgress = userProgress.moduleProgress.find(mp => 
                mp.module && (mp.module._id === currentModule._id || mp.module === currentModule._id)
            );
            
            if (moduleProgress && moduleProgress.isCompleted) {
                console.log('Current module is already completed');
                videoWatched = true;
            }
        }
        
        console.log('User progress loaded successfully');
    } catch (error) {
        console.error('Error in fetchUserProgress:', error);
        // Don't throw error, just set default progress
        userProgress = {
            progress: 0,
            completedModules: [],
            moduleProgress: []
        };
    }
}

// Update module UI with current information
function updateModuleUI() {
    if (!currentModule) return;
    
    // Update module title and description
    if (moduleTitle) moduleTitle.textContent = currentModule.title || 'Loading...';
    if (courseTitle) courseTitle.textContent = `Course: ${currentCourse?.title || 'Loading...'}`;
    if (moduleReward) moduleReward.textContent = currentModule.reward || '0';
    if (moduleDescription) moduleDescription.textContent = currentModule.description || 'No description available';
    
    // Update progress information
    if (progressBarFill) {
        const progress = (userProgress?.progress || 0) * 100;
        progressBarFill.style.width = `${progress}%`;
    }
    
    if (completedModules) completedModules.textContent = userProgress?.completedModules?.length || '0';
    if (totalModulesCount) totalModulesCount.textContent = currentCourse?.totalModules || '0';
    
    // Update completed modules list
    if (completedModulesList) {
        if (userProgress?.completedModules?.length > 0) {
            completedModulesList.innerHTML = userProgress.completedModules
                .map(module => `<li><i class="fas fa-check-circle text-success me-2"></i>${module.title}</li>`)
                .join('');
        } else {
            completedModulesList.innerHTML = '<li class="text-muted">No modules completed yet</li>';
        }
    }

    // Check if this module is already completed
    if (userProgress && currentModule) {
        const moduleProgress = userProgress.moduleProgress.find(mp => 
            mp.module && (mp.module._id === currentModule._id || mp.module === currentModule._id)
        );
        
        if (moduleProgress && moduleProgress.isCompleted) {
            if (completeVideoBtn) {
                completeVideoBtn.disabled = true;
                completeVideoBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Completed';
            }
            videoWatched = true;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Complete video button
    if (completeVideoBtn) {
        completeVideoBtn.addEventListener('click', handleVideoCompletion);
    }
    
    // Navigation buttons
    if (prevModuleBtn) {
        prevModuleBtn.addEventListener('click', () => navigateModule('prev'));
    }
    
    if (nextModuleBtn) {
        nextModuleBtn.addEventListener('click', () => navigateModule('next'));
    }
}

// Handle video completion
async function handleVideoCompletion() {
    try {
        console.log('Handling video completion');
        
        if (videoWatched) {
            console.log('Video already marked as completed');
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            showError('Authentication required. Please log in to continue.');
            return;
        }
        
        // Show loading state
        if (completeVideoBtn) {
            completeVideoBtn.disabled = true;
            completeVideoBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Completing...';
        }
        
        // Get course and module IDs
        const courseId = currentCourse?._id;
        const moduleId = currentModule?._id;
        
        if (!courseId || !moduleId) {
            throw new Error('Course or module information is missing');
        }
        
        console.log('Submitting video completion:', { courseId, moduleId });
        
        // Submit video completion to the server
        const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                completed: true
            })
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = 'Failed to submit video completion';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If we can't parse JSON, use status text
                errorMessage = `${errorMessage}: ${response.statusText}`;
            }
            
            if (response.status === 403) {
                errorMessage = 'Access forbidden. You may not be enrolled in this course or your session has expired.';
            } else if (response.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            }
            
            throw new Error(errorMessage);
        }

        // Get the response data
        const data = await response.json();
        console.log('API success response:', data);
        
        // Update UI
        videoWatched = true;
        if (completeVideoBtn) {
            completeVideoBtn.disabled = true;
            completeVideoBtn.classList.remove('btn-success');
            completeVideoBtn.classList.add('btn-secondary');
            completeVideoBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Completed';
        }
        
        // Check if course was completed with this module
        if (data.isCourseCompleted) {
            // Show course completion celebration
            showCourseCompletionCelebration(currentCourse?.reward || '0');
        }

        // Update user progress
        console.log('Fetching updated user progress');
        await fetchUserProgress(courseId);
        updateModuleUI();
        
        // Ensure wallet balance is updated in all places with the reward
        console.log('API response received wallet value:', data.wallet);
        
        // Update main wallet display in the header
        const walletBalance = document.getElementById('walletBalance');
        if (walletBalance && data.wallet !== undefined) {
            console.log('Updating main wallet balance display:', data.wallet);
            walletBalance.textContent = `${data.wallet} coins`;
        } else {
            console.log('Main wallet balance element not found or wallet data not provided');
        }
        
        // Update navigation wallet balance (force update of text)
        const navWalletBalance = document.querySelector('.nav-wallet-balance');
        if (navWalletBalance && data.wallet !== undefined) {
            console.log('Updating nav wallet balance:', data.wallet);
            // Find text element within the wallet balance
            const walletText = document.querySelector('.nav-wallet-balance-text');
            if (walletText) {
                console.log('Updating nav wallet balance text element');
                walletText.textContent = `Wallet: ${data.wallet} tokens`;
            } else {
                console.log('Updating nav wallet balance container element');
                navWalletBalance.textContent = `Wallet: ${data.wallet} tokens`;
            }
            
            // Update localStorage user data to ensure wallet is updated across page refreshes
            try {
                let userData = JSON.parse(localStorage.getItem('userData') || '{}');
                if (userData) {
                    userData.wallet = data.wallet;
                    localStorage.setItem('userData', JSON.stringify(userData));
                    console.log('Updated userData in localStorage with new wallet balance:', data.wallet);
                }
            } catch (e) {
                console.log('Could not update userData in localStorage', e);
            }
        } else {
            console.log('Nav wallet balance element not found or wallet data not provided');
        }
        
        // Update global user data if it exists
        try {
            // Notify nav.js to update its UI with new wallet balance
            if (typeof updateUserUI === 'function' && data.wallet !== undefined) {
                console.log('Calling updateUserUI function with new wallet balance');
                updateUserUI({ wallet: data.wallet });
            }
        } catch (e) {
            console.log('Error calling updateUserUI:', e);
        }

        // Show success message with reward if available
        let successMessage = 'Video module completed successfully!';
        if (data.reward) {
            successMessage = `Module completed! You earned ${data.reward} coins.`;
        }
        console.log('Showing success message:', successMessage);
        showSuccess(successMessage);
        
        // Update course progress
        const courseProgress = document.getElementById('courseProgress');
        if (courseProgress && data.progress !== undefined) {
            const progressPercentage = Math.round(data.progress * 100);
            courseProgress.textContent = `${progressPercentage}%`;
            console.log('Updated course progress to:', progressPercentage);
        }
        
        // Unlock next module if available
        const currentIndex = currentCourse.modules.findIndex(m => 
            m._id === currentModule._id || m === currentModule._id
        );
        console.log('Current module index for unlocking next:', currentIndex);
        
        if (currentIndex >= 0 && currentIndex < currentCourse.modules.length - 1) {
            const nextModule = currentCourse.modules[currentIndex + 1];
            console.log('Next module:', nextModule);
            
            if (nextModule) {
                // Enable the next button
                if (nextModuleBtn) {
                    console.log('Enabling next module button');
                    nextModuleBtn.disabled = false;
                } else {
                    console.warn('Next module button element not found');
                }
                
                // Get next module title
                const nextModuleTitle = nextModule.title || 'Next Module';
                
                // Show success message with next module info
                console.log('Showing success message with next module info');
                showSuccess(`Module completed! Next up: "${nextModuleTitle}"`);
                
                // Automatically navigate to the next module after a short delay
                console.log('Setting timeout for automatic navigation');
                setTimeout(() => {
                    console.log('Automatically navigating to next module');
                    navigateModule('next');
                }, 2000);
            }
        } else {
            console.log('No next module to unlock');
            if (currentIndex === currentCourse.modules.length - 1) {
                showSuccess('Congratulations! You have completed all modules in this course.');
            }
        }

    } catch (error) {
        console.error('Error completing video:', error);
        showError(error.message || 'Failed to complete video module. Please try again.');
        
        // Reset button state
        if (completeVideoBtn) {
            console.log('Resetting button state after error');
            completeVideoBtn.disabled = false;
            completeVideoBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Mark as Complete';
        }
    }
}

// Navigate to previous or next module
async function navigateModule(direction) {
    try {
        if (!currentCourse || !currentModule) {
            console.error('Cannot navigate: currentCourse or currentModule is missing', { 
                currentCourse, 
                currentModule 
            });
            showError('Missing course or module information. Please try refreshing the page.');
            return;
        }
        
        const currentIndex = currentCourse.modules.findIndex(m => 
            m._id === currentModule._id || m === currentModule._id
        );
        
        console.log('Current module index for navigation:', currentIndex);
        
        let targetIndex;
        if (direction === 'prev') {
            targetIndex = currentIndex - 1;
        } else {
            targetIndex = currentIndex + 1;
        }
        
        console.log(`Attempting to navigate ${direction} to index ${targetIndex}`);
        
        if (targetIndex >= 0 && targetIndex < currentCourse.modules.length) {
            const targetModule = currentCourse.modules[targetIndex];
            if (!targetModule) {
                console.error('Target module is undefined:', { targetIndex, modules: currentCourse.modules });
                showError('Cannot navigate to the target module. Please try refreshing the page.');
                return;
            }
            
            const moduleId = targetModule._id || targetModule;
            if (!moduleId) {
                console.error('Target module ID is missing:', targetModule);
                showError('Module ID is missing. Please try refreshing the page.');
                return;
            }
            
            // Determine the correct module page based on type
            let modulePage;
            const moduleType = targetModule.type || 'text'; // Default to text if type is missing
            console.log('Target module type:', moduleType);
            
            switch (moduleType) {
                case 'video':
                    modulePage = 'video-module.html';
                    break;
                case 'text':
                    modulePage = 'text-module.html';
                    break;
                case 'quiz':
                    modulePage = 'quiz-module.html';
                    break;
                default:
                    console.warn('Unsupported module type:', moduleType);
                    modulePage = 'text-module.html'; // Default to text module
            }
            
            const url = `/${modulePage}?moduleId=${moduleId}&courseId=${currentCourse._id}`;
            console.log('Navigating to:', url);
            
            // Redirect to the appropriate module page
            window.location.href = url;
        } else {
            if (targetIndex < 0) {
                showError('You are already at the first module.');
            } else {
                showError('You are already at the last module.');
            }
            console.warn(`Cannot navigate ${direction}: Target index ${targetIndex} is out of bounds (0-${currentCourse.modules.length - 1})`);
        }
    } catch (error) {
        console.error('Error navigating modules:', error);
        showError('Failed to navigate to another module. Please try again.');
    }
}

// Show error message
function showError(message) {
    const errorHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Insert at the top of the module content
    const moduleContent = document.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.insertAdjacentHTML('afterbegin', errorHTML);
    }
}

// Show success message
function showSuccess(message) {
    const successHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Insert at the top of the module content
    const moduleContent = document.querySelector('.module-content');
    if (moduleContent) {
        moduleContent.insertAdjacentHTML('afterbegin', successHTML);
    }
}

// Show course completion celebration
function showCourseCompletionCelebration(reward) {
    // Create modal elements
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'courseCompletionModal';
    modalDiv.tabIndex = '-1';
    modalDiv.setAttribute('aria-labelledby', 'courseCompletionModalLabel');
    modalDiv.setAttribute('aria-hidden', 'true');
    
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title" id="courseCompletionModalLabel">
                        <i class="fas fa-trophy me-2"></i>Course Completed!
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center py-4">
                    <div class="mb-4">
                        <i class="fas fa-award text-warning" style="font-size: 4rem;"></i>
                    </div>
                    <h4 class="mb-3">Congratulations!</h4>
                    <p class="lead">You have successfully completed all modules in this course.</p>
                    <div class="alert alert-warning mt-3 mb-3">
                        <i class="fas fa-coins me-2"></i>
                        <strong>${reward} tokens</strong> have been added to your wallet!
                    </div>
                    <p>You can now download your certificate of completion.</p>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-outline-primary" onclick="window.location.href='/course-details.html?id=${currentCourse._id}'">
                        <i class="fas fa-certificate me-2"></i>View Certificate
                    </button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Continue Learning</button>
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the document
    document.body.appendChild(modalDiv);
    
    // Initialize and show the modal
    const modal = new bootstrap.Modal(document.getElementById('courseCompletionModal'));
    modal.show();
    
    // Event listener to remove the modal from DOM after it's hidden
    modalDiv.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalDiv);
    });
    
    // Save in localStorage so we don't show it again for this course
    if (currentCourse && currentCourse._id) {
        localStorage.setItem(`course_${currentCourse._id}_celebration_shown`, 'true');
    }
}

// Initialize the video module when the page loads
document.addEventListener('DOMContentLoaded', initializeVideoModule); 