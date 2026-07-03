document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to admin
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        window.location.href = '/admin.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Hardcoded credentials for simple auth
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = '/admin.html';
        } else {
            errorMessage.style.display = 'block';
            document.getElementById('password').value = ''; // clear password
        }
    });
});
