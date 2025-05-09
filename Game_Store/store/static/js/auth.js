document.addEventListener('DOMContentLoaded', function() {
    const switchers = [...document.querySelectorAll('.switcher')];
    const sectionTitle = document.querySelector('.section-title');
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = errorPopup?.querySelector('.error-message');
    
    // Form switching logic
    switchers.forEach(item => {
        item.addEventListener('click', function() {
            switchers.forEach(item => item.parentElement.classList.remove('is-active'));
            this.parentElement.classList.add('is-active');
            // Update section title
            sectionTitle.textContent = this.classList.contains('switcher-signup') ? 'PLEASE ENTER DETAILS FOR SIGNUP' : 'PLEASE ENTER USERNAME AND PASSWORD FOR LOGIN';
        });
    });

    // Show error popup
    function showError(message, duration = 5000) {
        if (errorPopup && errorMessage) {
            errorMessage.textContent = message;
            errorPopup.style.display = 'block';
            setTimeout(() => {
                errorPopup.style.display = 'none';
            }, duration);
        }
    }

    // Show Django messages if they exist
    if (typeof messages !== 'undefined' && messages.length > 0) {
        messages.forEach(message => showError(message));
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        if (!identifier || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Submit form if validation passes
        this.submit();
    });

    signupForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const firstName = document.getElementById('signup-firstname').value;
        const lastName = document.getElementById('signup-lastname').value;
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Basic validation
        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Username validation (alphanumeric and underscores only)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            showError('Username can only contain letters, numbers, and underscores');
            return;
        }

        // Password validation
        if (password.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Submit form if validation passes
        this.submit();
    });
});