// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Fetch user data
    fetchUserData();
    
    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

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
            displayUserData(userData);
        } else {
            // If token is invalid, redirect to login
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Display user data on the dashboard
function displayUserData(userData) {
    // Update profile information
    document.getElementById('userFullName').textContent = userData.fullName || 'User Name';
    document.getElementById('userEmail').textContent = userData.email || 'user@example.com';
    
    // Update wallet balance
    document.getElementById('walletBalance').textContent = `${userData.wallet || '0'} APT`;
    
    // Update statistics
    document.getElementById('enrolledCount').textContent = userData.enrolledCourses?.length || 0;
    document.getElementById('completedCount').textContent = userData.completedCourses?.length || 0;
    document.getElementById('totalEarnings').textContent = `${userData.totalEarnings || 0} APT`;
    
    // Display enrolled courses if any
    if (userData.enrolledCourses && userData.enrolledCourses.length > 0) {
        displayEnrolledCourses(userData.enrolledCourses);
    }
}

// Display enrolled courses
function displayEnrolledCourses(courses) {
    const coursesContainer = document.getElementById('enrolledCourses');
    
    if (courses.length === 0) {
        coursesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    You haven't enrolled in any courses yet. <a href="/courses">Browse courses</a> to get started!
                </div>
            </div>
        `;
        return;
    }
    
    coursesContainer.innerHTML = courses.map(course => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <img src="${course.image || 'https://via.placeholder.com/300x200?text=Course+Image'}" class="card-img-top" alt="${course.title}">
                <div class="card-body">
                    <h5 class="card-title">${course.title}</h5>
                    <p class="card-text">${course.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="progress flex-grow-1 me-3" style="height: 10px;">
                            <div class="progress-bar" role="progressbar" style="width: ${course.progress || 0}%;" aria-valuenow="${course.progress || 0}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <button class="btn btn-primary">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
} 