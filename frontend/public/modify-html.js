const fs = require('fs');
const glob = require('glob'); // Note: no glob module. I will just loop over files.

const pages = [
  { file: 'services-static.html', title: 'My Services', icon: 'fa-server', tableHeaders: ['Product/Service', 'Pricing', 'Next Due Date', 'Status'], emptyText: 'No Services Found' },
  { file: 'domains-static.html', title: 'My Domains', icon: 'fa-network-wired', tableHeaders: ['Domain', 'Registration Date', 'Next Due Date', 'Status'], emptyText: 'No Domains Found' },
  { file: 'payment-methods-static.html', title: 'Payment Methods', icon: 'fa-credit-card', tableHeaders: ['Card Type', 'Card Number', 'Expiry Date', 'Status'], emptyText: 'No Payment Methods Found' },
  { file: 'support-static.html', title: 'Support Tickets', icon: 'fa-ticket-alt', tableHeaders: ['Department', 'Subject', 'Status', 'Last Updated'], emptyText: 'No Support Tickets Found' },
  { file: 'cart-static.html', title: 'Shopping Cart', icon: 'fa-shopping-cart', tableHeaders: ['Item', 'Price'], emptyText: 'Your Cart is Empty' },
  { file: 'account-details-static.html', title: 'Account Details', icon: 'fa-user', content: '<div class="alert alert-info">Manage your personal information here.</div>' },
  { file: 'account-security-static.html', title: 'Account Security', icon: 'fa-shield-alt', content: '<div class="alert alert-info">Manage your security settings and two-factor authentication here.</div>' },
  { file: 'change-password-static.html', title: 'Change Password', icon: 'fa-key', content: '<div class="alert alert-info">Update your account password here.</div>' },
  { file: 'contacts-static.html', title: 'Contacts / Sub-Accounts', icon: 'fa-users', tableHeaders: ['Name', 'Email', 'Company'], emptyText: 'No Contacts Found' },
  { file: 'email-history-static.html', title: 'Email History', icon: 'fa-envelope', tableHeaders: ['Date', 'Message Subject'], emptyText: 'No Emails Found' },
  { file: 'user-management-static.html', title: 'User Management', icon: 'fa-users-cog', tableHeaders: ['User', 'Role', 'Status'], emptyText: 'No Users Found' },
  { file: 'announcements-static.html', title: 'Announcements', icon: 'fa-bullhorn', content: '<div class="alert alert-info">No announcements at this time.</div>' },
  { file: 'downloads-static.html', title: 'Downloads', icon: 'fa-download', content: '<div class="alert alert-info">No downloads available.</div>' },
  { file: 'server-status-static.html', title: 'Server Status', icon: 'fa-signal', tableHeaders: ['Server', 'Status', 'Uptime'], emptyText: 'All systems operational.' },
  { file: 'support-kb-static.html', title: 'Knowledge Base', icon: 'fa-book', content: '<div class="alert alert-info">Search our knowledge base for answers to common questions.</div>' },
];

pages.forEach(page => {
  const filePath = `c:/Users/azureuser/Desktop/Hosting site/frontend/public/${page.file}`;
  if (!fs.existsSync(filePath)) return;
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Replace the title
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title} - Hosting Company</title>`);
  
  // Replace "My Dashboard" text if present
  html = html.replace(/>\\s*My Dashboard\\s*</g, `>${page.title}<`);
  
  let mainContent = `<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title"><i class="fas ${page.icon}"></i> ${page.title}</h3>
    </div>
    <div class="panel-body">`;
    
  if (page.content) {
    mainContent += page.content;
  } else {
    mainContent += `<table class="table table-striped dataTable no-footer dtr-inline">
        <thead>
            <tr>`;
    page.tableHeaders.forEach(header => {
        mainContent += `<th>${header}</th>`;
    });
    mainContent += `</tr>
        </thead>
        <tbody>
            <tr><td colspan="${page.tableHeaders.length}" class="text-center">${page.emptyText}</td></tr>
        </tbody>
    </table>`;
  }
  
  mainContent += `</div></div>`;
  
  // Find the place to inject this content. 
  // We'll replace the `.client-home-panels` div and the preceding swiper tiles,
  // or everything inside the main content container.
  // The main wrapper is usually `<div class="main-content">` or we can just replace everything from `<div class="tiles` to `<script type="text/javascript">` (before it).
  
  // A safer regex: find `<div class="tiles` and replace until we hit the first `<script`
  html = html.replace(/<div class="tiles.*?<script/s, mainContent + '\n<script');
  
  fs.writeFileSync(filePath, html);
  console.log(`Updated ${page.file}`);
});
