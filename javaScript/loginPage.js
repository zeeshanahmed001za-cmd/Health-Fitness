/**
 * loginPage.js
 * Handles live regex validation, error state toggling, and dashboard redirection on success.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('EmailInput');
    const passwordInput = document.getElementById('PasswordInput');
    const checkInput = document.getElementById('checkBoxInput');
    const toggleBtn = document.querySelector('.TogglePassword');

    // Groups for error classes handling
    const emailGroup = emailInput.closest('.inputGroup');
    const passwordGroup = passwordInput.closest('.inputGroup');
    const termsGroup = checkInput.closest('.termsGroup');

    // Strict regex policies
    // Standard email policy
    const emailPolicy = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // Password must be 10+ chars, uppercase, lowercase, number, and special char
    const passwordPolicy = password => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(password);

    // Live validation function
    const validateField = (inputElement, groupElement, policyFunc) => {
        const val = inputElement.value.trim();
        // If empty, remove classes but maybe show error if required. Let's do live valid/invalid
        if (val === '') {
            groupElement.classList.remove('success');
            groupElement.classList.remove('error');
            return false;
        }

        if (policyFunc(val)) {
            groupElement.classList.remove('error');
            groupElement.classList.add('success');
            return true;
        } else {
            groupElement.classList.remove('success');
            groupElement.classList.add('error');
            return false;
        }
    };

    // Attach listeners for live feedback blur/input
    emailInput.addEventListener('input', () => {
        if(emailGroup.classList.contains('error')) {
            validateField(emailInput, emailGroup, emailPolicy);
        }
    });
    emailInput.addEventListener('blur', () => validateField(emailInput, emailGroup, emailPolicy));

    passwordInput.addEventListener('input', () => {
        if(passwordGroup.classList.contains('error')) {
            validateField(passwordInput, passwordGroup, passwordPolicy);
        }
    });
    passwordInput.addEventListener('blur', () => validateField(passwordInput, passwordGroup, passwordPolicy));

    checkInput.addEventListener('change', () => {
        if (checkInput.checked) {
            termsGroup.classList.remove('error');
        } else {
            termsGroup.classList.add('error');
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop default navigation

        // Validate all on submit
        const isEmailValid = validateField(emailInput, emailGroup, emailPolicy);
        const isPasswordValid = validateField(passwordInput, passwordGroup, passwordPolicy);
        const isTermsValid = checkInput.checked;

        if (!isEmailValid) emailGroup.classList.add('error');
        if (!isPasswordValid) passwordGroup.classList.add('error');
        if (!isTermsValid) termsGroup.classList.add('error');

        // Check if overall forms passes
        if (isEmailValid && isPasswordValid && isTermsValid) {
            console.log('Validation passed. Redirecting to dashboard...');
            // Redirect to dashboard
            window.location.href = 'dashBoard.html';
        } else {
            console.log('Validation failed. Please correct the errors.');
        }
    });

    // Password field : Eye visibility
    const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>`;

    const eyeClose = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>`;

    toggleBtn.addEventListener('click', function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.innerHTML = eyeClose;
        } else {
            passwordInput.type = "password";
            toggleBtn.innerHTML = eyeOpen;
        }
    });
});