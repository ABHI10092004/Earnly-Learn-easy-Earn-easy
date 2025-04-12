// Get course ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

// DOM Elements
const courseTitle = document.getElementById('courseTitle');
const courseDescription = document.getElementById('courseDescription');
const courseImage = document.getElementById('courseImage');
const totalModules = document.getElementById('totalModules');
const difficulty = document.getElementById('difficulty');
const reward = document.getElementById('reward');
const levelsGrid = document.getElementById('levelsGrid');
const moduleContent = document.getElementById('moduleContent');
const moduleTitle = document.getElementById('moduleTitle');
const videoModule = document.getElementById('videoModule');
const textModule = document.getElementById('textModule');
const quizModule = document.getElementById('quizModule');
const progressBarFill = document.getElementById('progressBarFill');
const completedModules = document.getElementById('completedModules');
const totalModulesCount = document.getElementById('totalModulesCount');
const completedModulesList = document.getElementById('completedModulesList');
const estimatedTime = document.getElementById('estimatedTime');
const courseDifficulty = document.getElementById('courseDifficulty');
const courseReward = document.getElementById('courseReward');
const enrolledUsers = document.getElementById('enrolledUsers');
const enrollButton = document.getElementById('enrollButton');
const enrollmentStatus = document.getElementById('enrollmentStatus');
const walletBalance = document.getElementById('walletBalance');

// State
let currentCourse = null;
let currentModule = null;
let userProgress = null;
let isEnrolled = false;
let isLoadingEnrollment = false;

// Fetch course details
async function fetchCourseDetails() {
    try {
        const token = localStorage.getItem('token');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            headers['Accept'] = 'application/json';
        } else {
            console.warn('No authentication token found when fetching course details');
        }
        
        console.log('Fetching course details for course ID:', courseId);
        const response = await fetch(`/api/courses/${courseId}`, {
            headers: headers
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Access forbidden. You may not be enrolled in this course or your session has expired. Please log in again.');
            } else if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (response.status === 404) {
                throw new Error(`Course not found: ${courseId}. Please check the course ID and try again.`);
            } else if (response.status === 500) {
                // Try to extract error message from response
                try {
                    const errorData = await response.json();
                    throw new Error(`Server error: ${errorData.message || 'Unknown error'}`);
                } catch (e) {
                    throw new Error(`Server error: Unable to fetch course details. Please try again later.`);
                }
            } else {
                throw new Error(`Failed to fetch course details: ${response.status}`);
            }
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response format from server');
        }
        
        const data = await response.json();
        
        if (!data || !data.course) {
            throw new Error('Invalid course data received');
        }
        
        currentCourse = data.course;
        
        // Set enrollment status from server response
        if (data.isEnrolled === true) {
            isEnrolled = true;
            console.log('Setting enrollment status to true from server response');
        }
        console.log('Enrollment status from server:', isEnrolled);
        
        // Process modules to ensure they have proper structure
        if (currentCourse && currentCourse.modules) {
            currentCourse.modules = await Promise.all(currentCourse.modules.map(async module => {
                // If module is just an ID string, fetch its details from the API
                if (typeof module === 'string') {
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            console.warn('No authentication token found when fetching module details');
                            return {
                                _id: module,
                                title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                type: 'text', // Default to text type
                                reward: '0'
                            };
                        }
                        
                        console.log('Fetching module details for module ID:', module);
                        const response = await fetch(`/api/courses/${currentCourse._id}/modules/${module}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            }
                        });
                        
                        // Check if response is JSON
                        const contentType = response.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            console.error('Invalid response format from server for module:', module);
                            return {
                                _id: module,
                                title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                type: 'text', // Default to text type
                                reward: '0'
                            };
                        }
                        
                        if (!response.ok) {
                            if (response.status === 403) {
                                console.error('Access forbidden for module:', module);
                                // This likely means user is not enrolled - update enrollment status
                                isEnrolled = false;
                                return {
                                    _id: module,
                                    title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                    type: 'text', // Default to text type
                                    reward: '0',
                                    error: 'Access forbidden'
                                };
                            } else if (response.status === 401) {
                                console.error('Authentication failed for module:', module);
                                // Clear token if authentication failed
                                localStorage.removeItem('token');
                                return {
                                    _id: module,
                                    title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                    type: 'text', // Default to text type
                                    reward: '0',
                                    error: 'Authentication failed'
                                };
                            } else {
                                console.error('Failed to fetch module details:', module, response.status);
                                return {
                                    _id: module,
                                    title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                    type: 'text', // Default to text type
                                    reward: '0'
                                };
                            }
                        }
                        
                        const data = await response.json();
                        const moduleData = data.module || data;
                        
                        if (!moduleData || !moduleData.type) {
                            console.error('Invalid module data received for module:', module);
                            return {
                                _id: module,
                                title: moduleData?.title || 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                                type: 'text', // Default to text type
                                reward: moduleData?.reward || '0'
                            };
                        }
                        
                        return moduleData;
                    } catch (error) {
                        console.error('Error fetching module details:', module, error);
                        return {
                            _id: module,
                            title: 'Module ' + (currentCourse.modules.indexOf(module) + 1),
                            type: 'text', // Default to text type
                            reward: '0'
                        };
                    }
                }
                
                return module;
            }));
        }
        
        updateCourseUI();
        
        if (token) {
            // Wait for user progress to be fetched before proceeding
            await fetchUserProgress();
            await updateWalletBalance();
        }
    } catch (error) {
        console.error('Error in fetchCourseDetails:', error);
        showError(error.message);
    }
}

// Fetch user progress
async function fetchUserProgress() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('Fetching user progress for course:', courseId);
        
        const response = await fetch(`/api/courses/${courseId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                // If forbidden, user is not enrolled
                console.warn('Access forbidden when fetching progress. User is not enrolled.');
                isEnrolled = false;
                updateCourseUI(); // Update UI to reflect enrollment status
                return;
            } else if (response.status === 401) {
                // If unauthorized, token is invalid
                console.warn('Authentication failed when fetching progress.');
                localStorage.removeItem('token');
                window.location.reload();
                return;
            }
            
            console.warn('Failed to fetch user progress:', response.status);
            return;
        }
        
        const data = await response.json();
        if (!data) {
            console.warn('Empty user progress data received');
            return;
        }
        
        console.log('User progress data received:', data);
        
        // Process the module progress data
        if (data.moduleProgress) {
            // Convert module IDs to module objects if needed
            data.moduleProgress = data.moduleProgress.map(mp => {
                if (mp.module && typeof mp.module === 'string') {
                    // Find the module in the current course
                    const module = currentCourse.modules.find(m => m._id === mp.module);
                    if (module) {
                        mp.module = module;
                    }
                }
                return mp;
            });
        }
        
        userProgress = data;
        
        // Update enrollment status from progress data
        if (data.isEnrolled === true) {
            isEnrolled = true;
            console.log('Setting enrollment status to true from progress data');
        }
        
        updateProgressUI();
    } catch (error) {
        console.error('Error fetching user progress:', error);
        showError('Failed to load user progress. Please try again.');
    }
}

// Update wallet balance
async function updateWalletBalance() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('Fetching user profile for wallet balance');
        
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // If unauthorized, token is invalid
                console.warn('Authentication failed when fetching wallet balance.');
                localStorage.removeItem('token');
                return;
            }
            
            console.warn('Failed to fetch user profile:', response.status);
            return;
        }
        
        const userData = await response.json();
        if (!userData) {
            console.warn('Empty user profile data received');
            return;
        }
        
        console.log('User profile data received:', userData);
        
        if (walletBalance) {
            walletBalance.textContent = `${userData.wallet || 0} coins`;
        }
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        // Don't show error to user, just log it
    }
}

// Update course UI
function updateCourseUI() {
    if (!currentCourse) return;
    
    if (courseTitle) courseTitle.textContent = currentCourse.title || 'Loading course...';
    if (courseDescription) courseDescription.textContent = currentCourse.description || 'Loading description...';
    if (courseImage) courseImage.src = currentCourse.image || '';
    if (totalModules) totalModules.textContent = currentCourse.totalModules || '0';
    if (difficulty) difficulty.textContent = currentCourse.difficulty || 'Loading...';
    if (reward) reward.textContent = `${currentCourse.reward || '0'} coins`;
    if (estimatedTime) estimatedTime.textContent = `${currentCourse.estimatedTime || 'Loading...'}`;
    if (courseDifficulty) courseDifficulty.textContent = `${currentCourse.difficulty || 'Loading...'}`;
    if (courseReward) courseReward.textContent = `${currentCourse.reward || '0'} coins`;
    if (enrolledUsers) enrolledUsers.textContent = `${currentCourse.enrolledUsers || '0'} enrolled`;
    
    // Update enrollment status
    if (enrollmentStatus) {
        if (isEnrolled) {
            // Check if the course is completed
            const isCourseCompleted = userProgress && userProgress.isCompleted;
            
            if (isCourseCompleted) {
                enrollmentStatus.innerHTML = '<span class="badge bg-success">Completed</span>';
                if (enrollButton) {
                    enrollButton.textContent = 'Completed';
                    enrollButton.classList.remove('btn-primary', 'btn-success');
                    enrollButton.classList.add('btn-primary');
                    
                    // Add certificate download button after the enroll button
                    if (!document.getElementById('downloadCertificateBtn')) {
                        const certificateBtn = document.createElement('button');
                        certificateBtn.id = 'downloadCertificateBtn';
                        certificateBtn.className = 'btn btn-outline-primary mt-2';
                        certificateBtn.innerHTML = '<i class="fas fa-certificate me-2"></i>Download Certificate';
                        certificateBtn.addEventListener('click', downloadCertificate);
                        
                        // Insert after enroll button
                        enrollButton.parentNode.insertBefore(certificateBtn, enrollButton.nextSibling);
                    }
                }
            } else {
                enrollmentStatus.innerHTML = '<span class="badge bg-success">Enrolled</span>';
                if (enrollButton) {
                    enrollButton.textContent = 'Continue Learning';
                    enrollButton.classList.remove('btn-primary');
                    enrollButton.classList.add('btn-success');
                }
            }
        } else {
            enrollmentStatus.innerHTML = '<span class="badge bg-secondary">Not Enrolled</span>';
            if (enrollButton) {
                enrollButton.textContent = 'Enroll Now';
                enrollButton.classList.remove('btn-success');
                enrollButton.classList.add('btn-primary');
            }
        }
    }
    
    // Log enrollment status for debugging
    console.log('Updating course UI with enrollment status:', isEnrolled);
    
    renderLevels();
}

// Render levels
function renderLevels() {
    if (!currentCourse || !currentCourse.modules || !levelsGrid) {
        console.error('Cannot render levels - missing data:', { 
            hasCourse: !!currentCourse, 
            hasModules: !!(currentCourse && currentCourse.modules),
            hasLevelsGrid: !!levelsGrid
        });
        return;
    }
    
    console.log('Rendering modules:', currentCourse.modules);
    levelsGrid.innerHTML = '';
    
    currentCourse.modules.forEach((module, index) => {
        // Skip modules without an ID
        if (!module || !module._id) {
            console.warn('Skipping module without ID:', module);
            return;
        }
        
        console.log(`Processing module ${index}:`, module);
        
        // Check if module is completed or locked
        let isCompleted = false;
        let isLocked = true;
        
        if (userProgress && userProgress.moduleProgress) {
            const moduleProgress = userProgress.moduleProgress.find(
                mp => mp.module === module._id || 
                     (mp.module && mp.module._id === module._id)
            );
            
            console.log(`Module ${module._id} progress:`, moduleProgress);
            
            if (moduleProgress) {
                isCompleted = moduleProgress.isCompleted;
                isLocked = moduleProgress.isLocked;
            }
        }
        
        // First module is always unlocked for enrolled users
        if (index === 0 && isEnrolled) {
            isLocked = false;
        }
        
        console.log(`Module ${module._id} status:`, { isCompleted, isLocked });
        
        // Determine module status class
        let statusClass = 'locked';
        let statusIcon = 'fa-lock';
        
        if (isCompleted) {
            statusClass = 'completed';
            statusIcon = 'fa-check-circle';
        } else if (!isLocked) {
            statusClass = 'unlocked';
            statusIcon = 'fa-unlock';
        }
        
        // Create module card
        const card = document.createElement('div');
        card.className = `level-card ${statusClass}`;
        card.id = `module-${module._id}`;
        
        // Get module type icon
        let typeIcon = 'fa-file-alt';
        if (module.type === 'video') {
            typeIcon = 'fa-video';
        } else if (module.type === 'quiz') {
            typeIcon = 'fa-question-circle';
        }
        
        // Create card content
        card.innerHTML = `
            <div class="card-body">
                <div class="module-status">
                    <i class="fas ${statusIcon}"></i>
                </div>
                <h5 class="card-title">${module.title || 'Module ' + (index + 1)}</h5>
                <div class="module-info">
                    <span class="badge bg-light text-dark">
                        <i class="fas ${typeIcon}"></i> ${module.type || 'Text'}
                    </span>
                    <span class="badge bg-warning text-dark">
                        <i class="fas fa-coins"></i> ${module.reward || '0'}
                    </span>
                </div>
            </div>
        `;
        
        // Add click event for unlocked or completed modules
        if (!isLocked || isCompleted) {
            console.log(`Adding click handler for accessible module ${module._id}`);
            card.addEventListener('click', () => loadModule(module));
            card.classList.add('clickable');
        } else {
            // Show lock message for locked modules
            console.log(`Adding lock message for locked module ${module._id}`);
            card.addEventListener('click', () => {
                if (!isEnrolled) {
                    showError('Please enroll in this course to access modules');
                } else {
                    showError('Complete previous modules to unlock this one');
                }
            });
        }
        
        levelsGrid.appendChild(card);
    });
}

// Load module content
async function loadModule(module) {
    try {
        // Check if module has a valid ID
        if (!module || !module._id) {
            console.error('Invalid module object:', module);
            showError('Invalid module selected');
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, cannot load module');
            showError('Please login to access course content');
            return;
        }
        
        const courseId = currentCourse._id;
        if (!courseId) {
            console.error('Course ID is missing');
            showError('Course information is missing. Please refresh the page.');
            return;
        }
        
        // Debug enrollment status
        console.log('Loading module with enrollment status:', isEnrolled);
        console.log('Current module:', module);
        console.log('Module ID type:', typeof module._id);
        console.log('User progress:', userProgress);
        
        // Check enrollment status from current state
        if (!isEnrolled) {
            console.error('User is not enrolled in this course');
            showError('Please enroll in this course to access modules');
            return;
        }
        
        // Determine the correct module page based on type
        let modulePage;
        console.log('Module type:', module.type);
        switch (module.type) {
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
                console.error('Unsupported module type:', module.type);
                showError('Unsupported module type: ' + module.type);
                return;
        }
        
        console.log(`Redirecting to ${modulePage} with moduleId=${module._id} and courseId=${courseId}`);
        
        // Redirect to the appropriate module page
        window.location.href = `/${modulePage}?moduleId=${module._id}&courseId=${courseId}`;
        
    } catch (error) {
        console.error('Error loading module:', error);
        showError('Failed to load module: ' + error.message);
    }
}

// Update progress UI
function updateProgressUI() {
    if (!userProgress) return;
    
    // Calculate progress percentage
    let completedCount = 0;
    let totalCount = 0;
    
    if (userProgress.moduleProgress) {
        totalCount = userProgress.moduleProgress.length;
        completedCount = userProgress.moduleProgress.filter(mp => mp.isCompleted).length;
    }
    
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Update progress bar
    if (progressBarFill) {
        progressBarFill.style.width = `${progressPercentage}%`;
    }
    
    // Update completed modules count
    if (completedModules && totalModulesCount) {
        completedModules.textContent = completedCount;
        totalModulesCount.textContent = totalCount;
    }
    
    // Check if course is completed and show celebration message
    if (userProgress.isCompleted && progressPercentage === 100) {
        // Show the certificate section
        const certificateSection = document.getElementById('certificateSection');
        if (certificateSection) {
            certificateSection.style.display = 'block';
        }
        
        // Only show celebration if we haven't shown it before for this course
        const celebrationShown = localStorage.getItem(`course_${courseId}_celebration_shown`);
        if (!celebrationShown) {
            // Save in localStorage so we don't show it again
            localStorage.setItem(`course_${courseId}_celebration_shown`, 'true');
            
            // Show celebration modal
            showCourseCompletionCelebration(userProgress.earnedReward || currentCourse.reward);
            
            // Update wallet balance
            updateWalletBalance();
        }
    }
    
    // Update completed modules list
    if (completedModulesList) {
        if (userProgress.moduleProgress && userProgress.moduleProgress.length > 0) {
            const completedModulesArray = userProgress.moduleProgress.filter(mp => mp.isCompleted);
            
            if (completedModulesArray.length > 0) {
                completedModulesList.innerHTML = '';
                
                completedModulesArray.forEach(mp => {
                    if (mp.module) {
                        const moduleTitle = typeof mp.module === 'object' ? mp.module.title : mp.module;
                        const li = document.createElement('li');
                        li.className = 'list-group-item d-flex justify-content-between align-items-center';
                        li.innerHTML = `
                            <span>${moduleTitle}</span>
                            <span class="badge bg-success rounded-pill">
                                <i class="fas fa-check-circle"></i>
                            </span>
                        `;
                        completedModulesList.appendChild(li);
                    }
                });
            } else {
                completedModulesList.innerHTML = '<li class="text-muted">No modules completed yet</li>';
            }
        }
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
                    <button type="button" class="btn btn-outline-primary" onclick="downloadCertificate()">
                        <i class="fas fa-certificate me-2"></i>Download Certificate
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
}

// Enroll in course
async function enrollInCourse() {
    try {
        // Prevent double clicks
        if (isLoadingEnrollment) return;
        isLoadingEnrollment = true;
        
        const token = localStorage.getItem('token');
        if (!token) {
            isLoadingEnrollment = false;
            showError('Please login to enroll in courses');
            
            // Show login modal
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            if (loginModal) loginModal.show();
            
            return;
        }
        
        if (isEnrolled) {
            // If already enrolled, just load the first module
            isLoadingEnrollment = false;
            if (currentCourse && currentCourse.modules && currentCourse.modules.length > 0) {
                loadModule(currentCourse.modules[0]);
            }
            return;
        }
        
        // Show loading state
        if (enrollButton) {
            enrollButton.disabled = true;
            enrollButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enrolling...';
        }
        
        const response = await fetch(`/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Check for token expiration
            if (response.status === 401) {
                localStorage.removeItem('token');
                isLoadingEnrollment = false;
                window.location.reload();
                return;
            }
            
            const data = await response.json();
            
            // Check if the error is "Already enrolled"
            if (data.message && data.message.includes('Already enrolled')) {
                console.log('User is already enrolled, updating UI');
                isEnrolled = true;
                
                // Fetch updated user progress to ensure we have the latest data
                await fetchUserProgress();
                
                updateCourseUI();
                showSuccess('You are already enrolled in this course!');
                
                // Reset button state
                if (enrollButton) {
                    enrollButton.disabled = false;
                    enrollButton.textContent = 'Continue Learning';
                }
                
                isLoadingEnrollment = false;
                return;
            }
            
            // Reset button state
            if (enrollButton) {
                enrollButton.disabled = false;
                enrollButton.textContent = 'Enroll Now';
            }
            
            isLoadingEnrollment = false;
            throw new Error(data.message || 'Failed to enroll in course');
        }
        
        // Update UI to show enrolled status
        isEnrolled = true;
        
        // Fetch updated user progress to ensure we have the latest data
        await fetchUserProgress();
        
        updateCourseUI();
        showSuccess('Successfully enrolled in the course!');
        
        // Reset button state
        if (enrollButton) {
            enrollButton.disabled = false;
            enrollButton.textContent = 'Continue Learning';
        }
        
        isLoadingEnrollment = false;
        
        // Auto-load the first module after enrollment
        if (currentCourse && currentCourse.modules && currentCourse.modules.length > 0) {
            setTimeout(() => {
                loadModule(currentCourse.modules[0]);
            }, 1500);
        }
    } catch (error) {
        console.error('Error enrolling in course:', error);
        showError(error.message || 'Failed to enroll in course. Please try again later.');
        
        // Reset button state
        if (enrollButton) {
            enrollButton.disabled = false;
            enrollButton.textContent = 'Enroll Now';
        }
        
        isLoadingEnrollment = false;
    }
}

// Display error message
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 5000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toast);
    });
}

// Display info message
function showInfo(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-info border-0 position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-info-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toast);
    });
}

// Display success message
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toast);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if course ID is provided
    if (!courseId) {
        showError('No course ID provided');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    // Add enrollment button click event
    if (enrollButton) {
        enrollButton.addEventListener('click', enrollInCourse);
    }
    
    // Add certificate button click event
    const certificateBtn = document.getElementById('certificateBtn');
    if (certificateBtn) {
        certificateBtn.addEventListener('click', downloadCertificate);
    }
    
    // Initialize 
    fetchCourseDetails().catch(error => {
        console.error('Failed to initialize course details:', error);
        showError('Failed to load course details. Please try again later.');
    });
});

// Function to download course completion certificate
function downloadCertificate() {
    if (!currentCourse || !userProgress || !userProgress.isCompleted) {
        showError('Course information not available or course not completed');
        return;
    }
    
    // Show loading message
    showInfo('Generating your certificate...');
    
    // Get user's name from localStorage or default to "Student"
    const userName = localStorage.getItem('userName') || 'Student';
    const completionDate = userProgress.completedAt ? 
        new Date(userProgress.completedAt).toLocaleDateString() : 
        new Date().toLocaleDateString();
    
    try {
        // Create a PDF directly without using HTML
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error("jsPDF library not available");
        }
        
        // Create PDF document in landscape mode
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties
        pdf.setProperties({
            title: `${currentCourse.title} - Certificate`,
            subject: 'Course Completion Certificate',
            author: 'Earnly',
            creator: 'Earnly Certificate Generator'
        });
        
        // Add borders
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Outer border
        pdf.setDrawColor(13, 110, 253); // #0d6efd
        pdf.setLineWidth(2);
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        // Inner border
        pdf.setLineWidth(0.5);
        pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);
        
        // Add certificate title
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(13, 110, 253); // #0d6efd
        pdf.setFontSize(28);
        pdf.text('Certificate of Completion', pageWidth / 2, 40, { align: 'center' });
        
        // Add certificate content
        pdf.setTextColor(0, 0, 0); // Black
        pdf.setFontSize(16);
        pdf.text('This is to certify that', pageWidth / 2, 60, { align: 'center' });
        
        // Add student name
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.text(userName, pageWidth / 2, 80, { align: 'center' });
        
        // Add completion text
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "normal");
        pdf.text('has successfully completed the course', pageWidth / 2, 100, { align: 'center' });
        
        // Add course title
        pdf.setFontSize(22);
        pdf.setFont("helvetica", "bold");
        pdf.text(currentCourse.title, pageWidth / 2, 120, { align: 'center' });
        
        // Add course details
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Completion Date: ${completionDate}`, pageWidth / 2, 150, { align: 'center' });
        pdf.text(`Difficulty: ${currentCourse.difficulty}`, pageWidth / 2, 160, { align: 'center' });
        pdf.text(`Course Reward: ${currentCourse.reward} tokens`, pageWidth / 2, 170, { align: 'center' });
        
        // Add signature
        pdf.setFont("helvetica", "bold");
        pdf.text('Earnly', pageWidth / 2, pageHeight - 40, { align: 'center' });
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.text('www.earnly.com', pageWidth / 2, pageHeight - 30, { align: 'center' });
        
        // Save PDF
        pdf.save(`${currentCourse.title} - Certificate.pdf`);
        
        showSuccess('Certificate downloaded successfully!');
    } catch (error) {
        console.error('Error creating certificate:', error);
        showError('Failed to generate certificate. Please try again.');
    }
} 