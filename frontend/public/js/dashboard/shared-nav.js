// Shared Dashboard Navigation Helper
// Renders the top bar, navbar, and sidebar for all sub-pages

const SHARED_NAV_HTML = (activePage = '') => `
<link rel="stylesheet" href="/css/dashboard/shared-layout.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Top Bar -->
<div class="top-bar">
    <a href="#"><i class="fas fa-border-style"></i> Style</a>
    <a href="#"><i class="fas fa-shopping-cart"></i> View Cart</a>
    <a href="#"><i class="fas fa-bell"></i> Notifications</a>
    <a href="#" id="userDropBtn"><i class="fas fa-user"></i> <span id="navUsername">Loading...</span> ▾</a>
</div>

<!-- Navbar -->
<nav class="main-nav">
    <div class="nav-left">
        <a href="/dashboard" class="logo">
            <span class="logo-u">U</span><span class="logo-h">H</span><span class="logo-name">hostingcompany</span>
        </a>
        <div class="nav-menu">
            <a href="/dashboard" class="${activePage === 'dashboard' ? 'active' : ''}"><i class="fas fa-th"></i> Dashboard</a>
            <a href="/dashboard/domains" class="${activePage === 'domains' ? 'active' : ''}"><i class="fas fa-globe"></i> Domains</a>
            <a href="/dashboard/services" class="${activePage === 'services' ? 'active' : ''}"><i class="fas fa-server"></i> Services</a>
            <a href="/dashboard/billing" class="${activePage === 'billing' ? 'active' : ''}"><i class="far fa-credit-card"></i> Billing</a>
            <a href="#" class="${activePage === 'security' ? 'active' : ''}"><i class="fas fa-tools"></i> Website & Security</a>
            <a href="#"><i class="fas fa-headset"></i> Support</a>
        </div>
    </div>
    <div class="nav-right">
        <div class="user-badge" id="userAvatarBadge">R</div>
    </div>
</nav>
`;

const SHARED_SIDEBAR_HTML = (activeSidebarItem = '') => `
<div class="sidebar">
    <div class="sidebar-title">Account</div>
    <a href="/dashboard/account/details" class="sidebar-item ${activeSidebarItem === 'details' ? 'active' : ''}"><i class="fas fa-info-circle"></i> Account Details</a>
    <a href="/dashboard/account/users" class="sidebar-item ${activeSidebarItem === 'users' ? 'active' : ''}"><i class="fas fa-users"></i> User Management</a>
    <a href="/dashboard/account/paymentmethods" class="sidebar-item ${activeSidebarItem === 'payment' ? 'active' : ''}"><i class="fas fa-wallet"></i> Payment Methods</a>
    <a href="/dashboard/account/contacts" class="sidebar-item ${activeSidebarItem === 'contacts' ? 'active' : ''}"><i class="fas fa-address-book"></i> Contacts</a>
    <a href="/dashboard/account/security" class="sidebar-item ${activeSidebarItem === 'security' ? 'active' : ''}"><i class="fas fa-shield-alt"></i> Account Security</a>
    <a href="/dashboard/account/emails" class="sidebar-item ${activeSidebarItem === 'emails' ? 'active' : ''}"><i class="fas fa-envelope"></i> Email History</a>
    <div class="sidebar-divider"></div>
    <div class="sidebar-title">User</div>
    <a href="/dashboard/user/profile" class="sidebar-item ${activeSidebarItem === 'profile' ? 'active' : ''}"><i class="fas fa-user"></i> Your Profile</a>
    <a href="/dashboard/user/accounts" class="sidebar-item ${activeSidebarItem === 'switch' ? 'active' : ''}"><i class="fas fa-random"></i> Switch Account</a>
    <a href="/dashboard/user/password" class="sidebar-item ${activeSidebarItem === 'password' ? 'active' : ''}"><i class="fas fa-lock"></i> Change Password</a>
    <a href="/dashboard/user/security" class="sidebar-item ${activeSidebarItem === 'usersecurity' ? 'active' : ''}"><i class="fas fa-key"></i> Security Settings</a>
    <div class="sidebar-divider"></div>
    <a href="/logout" class="sidebar-item" onclick="return confirm('Are you sure you want to logout?')"><i class="fas fa-sign-out-alt"></i> Logout</a>
</div>
`;

const SHARED_CHAT_FAB = `
<div class="chat-fab">
    <div class="chat-pill">Talk to us</div>
    <button class="chat-btn"><i class="fas fa-comments" style="font-size:19px;"></i></button>
</div>
`;

// Load user data from API
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        
        const res = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) { window.location.href = '/login'; return; }
        
        const data = await res.json();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        
        const navUserEl = document.getElementById('navUsername');
        const badgeEl = document.getElementById('userAvatarBadge');
        if (navUserEl) navUserEl.textContent = fullName || data.email;
        if (badgeEl) badgeEl.textContent = (fullName || data.email || 'U').charAt(0).toUpperCase();
        
        return data;
    } catch (err) {
        console.error('Failed to load user:', err);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});
