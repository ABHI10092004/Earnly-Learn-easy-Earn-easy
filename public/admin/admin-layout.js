/**
 * Admin Layout Component
 * 
 * This file provides functions to create a consistent admin panel layout
 * with a sidebar, header, and footer.
 */

// Check if admin is logged in
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// Get admin info
function getAdminInfo() {
    const adminInfoStr = localStorage.getItem('adminInfo');
    if (!adminInfoStr) return null;
    
    try {
        return JSON.parse(adminInfoStr);
    } catch (error) {
        console.error('Error parsing admin info:', error);
        return null;
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin/login.html';
}

// Initialize admin layout
function initAdminLayout(activePage = 'dashboard') {
    // Check if admin is logged in
    if (!checkAdminAuth()) return;
    
    // Get admin info
    const adminInfo = getAdminInfo();
    if (!adminInfo) {
        adminLogout();
        return;
    }
    
    // Render sidebar
    renderSidebar(activePage);
    
    // Render header
    renderHeader(adminInfo);
    
    // Setup logout functionality
    setupLogout();
    
    // Return admin info for use in the page
    return adminInfo;
}

// Render sidebar
function renderSidebar(activePage) {
    const sidebarContainer = document.getElementById('sidebar');
    if (!sidebarContainer) return;
    
    // Get admin info for role-based menu items
    const adminInfo = getAdminInfo();
    const isSuperAdmin = adminInfo && adminInfo.role === 'super_admin';
    
    const sidebarItems = [
        { id: 'dashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard', link: '/admin/dashboard.html' },
        { id: 'users', icon: 'fas fa-users', text: 'Users', link: '/admin/users.html' },
        { id: 'quizzes', icon: 'fas fa-question-circle', text: 'Quizzes', link: '/admin/quizzes.html' },
        { id: 'courses', icon: 'fas fa-book', text: 'Courses', link: '/admin/courses.html' },
        { id: 'transactions', icon: 'fas fa-exchange-alt', text: 'Transactions', link: '/admin/transactions.html' },
    ];
    
    // Add admin management for super admins
    if (isSuperAdmin) {
        sidebarItems.push({ id: 'admins', icon: 'fas fa-user-shield', text: 'Admins', link: '/admin/admins.html' });
    }
    
    // Add settings
    sidebarItems.push({ id: 'settings', icon: 'fas fa-cog', text: 'Settings', link: '/admin/settings.html' });
    
    const sidebarHtml = `
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-shield-alt me-2"></i>Earnly
            </div>
            <button id="sidebar-toggle" class="btn sidebar-toggle d-lg-none">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="sidebar-profile">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="profile-info">
                <div class="profile-name">${adminInfo ? adminInfo.fullName : 'Admin User'}</div>
                <div class="profile-role">${adminInfo ? adminInfo.role : 'Admin'}</div>
            </div>
        </div>
        
        <div class="sidebar-menu">
            <ul class="nav flex-column">
                ${sidebarItems.map(item => `
                    <li class="nav-item">
                        <a class="nav-link ${activePage === item.id ? 'active' : ''}" href="${item.link}">
                            <i class="${item.icon} me-2"></i>
                            <span>${item.text}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    sidebarContainer.innerHTML = sidebarHtml;
    
    // Setup sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.remove('sidebar-mobile-open');
        });
    }
}

// Render header
function renderHeader(adminInfo) {
    const headerContainer = document.getElementById('header');
    if (!headerContainer) return;
    
    const pageTitleElement = document.querySelector('title');
    const pageTitle = pageTitleElement ? pageTitleElement.textContent.replace('Earnly Admin - ', '') : 'Dashboard';
    
    const headerHtml = `
        <div class="header-left">
            <button id="mobile-sidebar-toggle" class="btn mobile-sidebar-toggle d-lg-none">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="header-title">${pageTitle}</h1>
        </div>
        <div class="header-right">
            <div class="dropdown">
                <button class="btn dropdown-toggle admin-dropdown" type="button" id="adminMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle me-2"></i>
                    <span>${adminInfo ? adminInfo.username : 'Admin'}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenuDropdown">
                    <li><a class="dropdown-item" href="/admin/profile.html"><i class="fas fa-user me-2"></i>Profile</a></li>
                    <li><a class="dropdown-item" href="/admin/settings.html"><i class="fas fa-cog me-2"></i>Settings</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutButton"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        </div>
    `;
    
    headerContainer.innerHTML = headerHtml;
    
    // Setup mobile sidebar toggle
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', function() {
            document.body.classList.add('sidebar-mobile-open');
        });
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            adminLogout();
        });
    }
}

// Show alert message
function showAlert(message, type = 'info', container = 'alertContainer', autoHide = true, duration = 5000) {
    const alertContainer = document.getElementById(container);
    if (!alertContainer) return;
    
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHtml;
    
    if (autoHide) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, duration);
    }
} 