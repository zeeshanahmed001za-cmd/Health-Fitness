document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('signupForm');
    const emailInput = document.getElementById('EmailInput');
    const passwordInput = document.getElementById('PasswordInput');
    const termsCheckbox = document.getElementById('checkBoxInput');
    const togglePasswordBtn = document.querySelector('.TogglePassword');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon visual (Optional: change SVG based on state)
            if (type === 'text') {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    }

    // Validation Functions
    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const isValidPassword = (password) => {
        // At least 10 chars, no spaces. More complex rules can be added here.
        if (password.length < 10) return false;
        if (/\s/.test(password)) return false;
        return true;
    };

    const setError = (inputElement, messageElementId, isError) => {
        const inputGroup = inputElement.closest('.inputGroup') || inputElement.closest('.termsGroup');
        if (isError) {
            inputGroup.classList.add('error');
        } else {
            inputGroup.classList.remove('error');
        }
    };

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isFormValid = true;

            // Validate Email
            if (!isValidEmail(emailInput.value.trim())) {
                setError(emailInput, 'emailError', true);
                isFormValid = false;
            } else {
                setError(emailInput, 'emailError', false);
            }

            // Validate Password
            if (!isValidPassword(passwordInput.value)) {
                setError(passwordInput, 'passwordError', true);
                isFormValid = false;
            } else {
                setError(passwordInput, 'passwordError', false);
            }

            // Validate Terms Checkbox
            if (!termsCheckbox.checked) {
                setError(termsCheckbox, 'termsError', true);
                isFormValid = false;
            } else {
                setError(termsCheckbox, 'termsError', false);
            }

            if (isFormValid) {
                // In a real application, you would send this to your backend API
                console.log('Form is valid. Submitting...', {
                    email: emailInput.value.trim()
                });
                
                // Simulate success and redirect to dashboard
                const btn = document.getElementById('signupBtn');
                const originalText = btn.textContent;
                btn.textContent = 'Creating Account...';
                btn.disabled = true;

                setTimeout(() => {
                    window.location.href = 'dashBoard.html';
                }, 1500);
            }
        });

        // Real-time validation clearing on input
        if(emailInput) {
            emailInput.addEventListener('input', () => {
                if(emailInput.closest('.inputGroup').classList.contains('error')){
                   if(isValidEmail(emailInput.value.trim())) setError(emailInput, null, false);
                }
            });
        }
        
        if(passwordInput) {
            passwordInput.addEventListener('input', () => {
                if(passwordInput.closest('.inputGroup').classList.contains('error')){
                   if(isValidPassword(passwordInput.value)) setError(passwordInput, null, false);
                }
            });
        }

        if(termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                if(termsCheckbox.closest('.termsGroup').classList.contains('error')){
                   if(termsCheckbox.checked) setError(termsCheckbox, null, false);
                }
            });
        }
    }

});
