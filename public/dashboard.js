// Global variables
let currentUserData = null;

// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Fetch user data
    fetchUserData();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Profile image upload preview
    const profileImageUpload = document.getElementById('profileImageUpload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', handleProfileImageUpload);
    }
    
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
}

// Fetch user data from the server
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
            currentUserData = userData.user || userData; // Handle different API response formats
            displayUserData(currentUserData);
            populateEditForm(currentUserData);
            
            // Fetch additional data
            fetchEnrolledCourses();
            fetchUserActivity();
            fetchTransactionHistory();
        } else {
            // If token is invalid, redirect to login
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                console.error('Error fetching user data:', response.statusText);
                showAlert('danger', 'Failed to load user data. Please try again later.');
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('danger', 'Failed to load user data. Please try again later.');
    }
}

// Display user data on the dashboard
function displayUserData(userData) {
    // Set default values if some data is missing
    const defaultImageUrl = 'https://via.placeholder.com/120';
    
    // Update profile header information
    document.getElementById('userProfileImage').src = userData.profileImage || defaultImageUrl;
    document.getElementById('userFullName').textContent = userData.fullName || userData.name || 'User Name';
    document.getElementById('userEmail').textContent = userData.email || 'user@example.com';
    
    // Format and display join date
    const joinDate = userData.joinDate ? new Date(userData.joinDate) : new Date();
    const formattedJoinDate = joinDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('userJoinDate').textContent = `Member since: ${formattedJoinDate}`;
    
    // Update wallet balance
    document.getElementById('walletBalance').textContent = `${userData.walletBalance || userData.balance || 0} APT`;
    
    // Update statistics
    document.getElementById('enrolledCount').textContent = userData.enrolledCourses?.length || 0;
    document.getElementById('completedCount').textContent = userData.completedCourses?.length || 0;
    document.getElementById('certificatesCount').textContent = userData.certificates?.length || 0;
    document.getElementById('totalEarnings').textContent = `${userData.totalEarnings || 0} APT`;
    
    // Update additional information
    document.getElementById('username').textContent = userData.username || 'Not set';
    document.getElementById('phoneNumber').textContent = userData.phoneNumber || 'Not set';
    document.getElementById('location').textContent = userData.location || 'Not set';
}

// Populate edit profile form
function populateEditForm(userData) {
    document.getElementById('profileImagePreview').src = userData.profileImage || 'https://via.placeholder.com/100';
    document.getElementById('editFullName').value = userData.fullName || userData.name || '';
    document.getElementById('editUsername').value = userData.username || '';
    document.getElementById('editEmail').value = userData.email || '';
    document.getElementById('editPhone').value = userData.phoneNumber || '';
    document.getElementById('editLocation').value = userData.location || '';
    document.getElementById('editBio').value = userData.bio || '';
}

// Handle profile image upload preview
function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Save profile changes
async function saveProfileChanges() {
    try {
        // Hide any previous messages
        document.getElementById('updateSuccessMessage').classList.add('d-none');
        document.getElementById('updateErrorMessage').classList.add('d-none');
        
        // Get form data
        const fullName = document.getElementById('editFullName').value;
        const username = document.getElementById('editUsername').value;
        const email = document.getElementById('editEmail').value;
        const phoneNumber = document.getElementById('editPhone').value;
        const location = document.getElementById('editLocation').value;
        const bio = document.getElementById('editBio').value;
        
        // Basic validation
        if (!fullName || !email) {
            document.getElementById('updateErrorMessage').textContent = 'Name and email are required';
            document.getElementById('updateErrorMessage').classList.remove('d-none');
            return;
        }
        
        // Create update data object
        const updateData = {
            fullName,
            username,
            email,
            phoneNumber,
            location,
            bio
        };
        
        // Handle profile image if changed
        const profileImageUpload = document.getElementById('profileImageUpload');
        if (profileImageUpload.files.length > 0) {
            const file = profileImageUpload.files[0];
            // In a real app, you would upload the file to a server and get a URL
            // For this example, we'll just use a base64 string
            const reader = new FileReader();
            reader.onload = async function(e) {
                updateData.profileImage = e.target.result;
                await sendUpdateRequest(updateData);
            };
            reader.readAsDataURL(file);
        } else {
            await sendUpdateRequest(updateData);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        document.getElementById('updateErrorMessage').textContent = 'Failed to update profile. Please try again.';
        document.getElementById('updateErrorMessage').classList.remove('d-none');
    }
}

// Send profile update request to server
async function sendUpdateRequest(updateData) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
        // Show success message
        document.getElementById('updateSuccessMessage').classList.remove('d-none');
        
        // Update user data in UI
        const updatedUserData = { ...currentUserData, ...updateData };
        displayUserData(updatedUserData);
        currentUserData = updatedUserData;
        
        // Close modal after a short delay
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            if (modal) {
                modal.hide();
            }
        }, 1500);
    } else {
        // Show error message
        const errorData = await response.json();
        document.getElementById('updateErrorMessage').textContent = errorData.message || 'Failed to update profile. Please try again.';
        document.getElementById('updateErrorMessage').classList.remove('d-none');
    }
}

// Fetch enrolled courses
async function fetchEnrolledCourses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/enrolled-courses', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayEnrolledCourses(data.courses || []);
        } else {
            console.error('Error fetching enrolled courses:', response.statusText);
            displayEnrolledCourses([]);
        }
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        displayEnrolledCourses([]);
    }
}

// Display enrolled courses
function displayEnrolledCourses(courses) {
    const coursesContainer = document.getElementById('enrolledCourses');
    
    if (!courses || courses.length === 0) {
        coursesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    You haven't enrolled in any courses yet. <a href="/all-courses.html" class="alert-link">Browse courses</a> to get started!
                </div>
            </div>
        `;
        return;
    }
    
    let coursesHTML = '';
    
    courses.forEach(course => {
        // Calculate appropriate badge based on progress
        let statusBadge = '';
        if (course.progress === 100) {
            statusBadge = '<span class="badge bg-success">Completed</span>';
        } else if (course.progress > 0) {
            statusBadge = '<span class="badge bg-warning text-dark">In Progress</span>';
        } else {
            statusBadge = '<span class="badge bg-secondary">Not Started</span>';
        }
        
        coursesHTML += `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <img src="${course.imageUrl || 'https://via.placeholder.com/300x150?text=Course+Image'}" 
                        class="card-img-top" alt="${course.title}" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${course.title}</h5>
                            ${statusBadge}
                        </div>
                        <p class="card-text small text-muted mb-3">${course.description?.substring(0, 100) || 'No description available'}${course.description?.length > 100 ? '...' : ''}</p>
                        <div class="mb-2">
                            <small class="text-muted">Progress: ${course.progress || 0}%</small>
                            <div class="progress course-progress">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${course.progress || 0}%" 
                                    aria-valuenow="${course.progress || 0}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                        <a href="/course-details.html?id=${course._id}" class="btn btn-primary btn-sm">Continue Learning</a>
                    </div>
                </div>
            </div>
        `;
    });
    
    coursesContainer.innerHTML = coursesHTML;
}

// Fetch user activity
async function fetchUserActivity() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/activity', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUserActivity(data.activities || []);
        } else {
            console.error('Error fetching user activity:', response.statusText);
            displayUserActivity([]);
        }
    } catch (error) {
        console.error('Error fetching user activity:', error);
        displayUserActivity([]);
    }
}

// Display user activity
function displayUserActivity(activities) {
    const activityFeed = document.getElementById('activityFeed');
    
    if (!activities || activities.length === 0) {
        activityFeed.innerHTML = `
            <div class="text-center py-4">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No recent activity to show. Start learning to see your activity here!
                </div>
            </div>
        `;
        return;
    }
    
    let activitiesHTML = '';
    
    activities.forEach(activity => {
        // Format date
        const activityDate = new Date(activity.timestamp);
        const formattedDate = activityDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Choose icon based on activity type
        let icon = 'fas fa-check';
        if (activity.type === 'course_enrollment') {
            icon = 'fas fa-user-graduate';
        } else if (activity.type === 'module_completion') {
            icon = 'fas fa-check-circle';
        } else if (activity.type === 'reward_earned') {
            icon = 'fas fa-coins';
        } else if (activity.type === 'certificate_earned') {
            icon = 'fas fa-certificate';
        }
        
        activitiesHTML += `
            <div class="activity-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <i class="${icon} me-2"></i>
                        <strong>${activity.title}</strong>
                    </div>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                <p class="mb-0 mt-1 ps-4">${activity.description}</p>
            </div>
        `;
    });
    
    activityFeed.innerHTML = activitiesHTML;
}

// Fetch transaction history
async function fetchTransactionHistory() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/transactions', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayTransactionHistory(data.transactions || []);
        } else {
            console.error('Error fetching transaction history:', response.statusText);
            displayTransactionHistory([]);
        }
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        displayTransactionHistory([]);
    }
}

// Display transaction history
function displayTransactionHistory(transactions) {
    const transactionHistoryTableBody = document.getElementById('transactionHistoryTableBody');
    
    if (!transactions || transactions.length === 0) {
        transactionHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i>
                        No transactions found. Complete courses to earn rewards!
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let transactionsHTML = '';
    
    transactions.forEach(transaction => {
        // Format date
        const transactionDate = new Date(transaction.timestamp);
        const formattedDate = transactionDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        // Determine amount class
        const amountClass = transaction.type === 'credit' ? 'text-success' : 'text-danger';
        const amountPrefix = transaction.type === 'credit' ? '+' : '-';
        
        // Determine status badge
        let statusBadge = '';
        if (transaction.status === 'completed') {
            statusBadge = '<span class="badge bg-success">Completed</span>';
        } else if (transaction.status === 'pending') {
            statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
        } else if (transaction.status === 'failed') {
            statusBadge = '<span class="badge bg-danger">Failed</span>';
        } else {
            statusBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        transactionsHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td class="${amountClass}">${amountPrefix}${transaction.amount} APT</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
    
    transactionHistoryTableBody.innerHTML = transactionsHTML;
}

// Show alert message
function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert at the top of the main container
    const mainContainer = document.querySelector('.container');
    mainContainer.insertBefore(alertContainer, mainContainer.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.classList.remove('show');
        setTimeout(() => alertContainer.remove(), 150);
    }, 5000);
} 