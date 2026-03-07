const form = document.getElementById('loginForm');
const emailInput = document.getElementById('EmailInput');
const passwordInput = document.getElementById('PasswordInput');
const checkInput = document.getElementById('checkBoxInput');
const passwordField = document.querySelector('.passwordInput');
const toggleBtn = document.querySelector('.TogglePassword');


// Regex policies = test() => is a regex method that checks if a string matches the given pattern
const emailPolicy = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordPolicy = password => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(password);

form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop default submission

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const checkBox = checkInput.checked;


    // Reset custom validity first; setCustomValidity is the js's method to set a custom erro message on input field
    emailInput.setCustomValidity('');
    passwordInput.setCustomValidity('');
    checkInput.setCustomValidity('');

    // Apply custom validation
    if (!emailPolicy(email)) {
        emailInput.setCustomValidity('Enter a valid email like user@example.com');
    }

    if (!passwordPolicy(password)) {
        passwordInput.setCustomValidity('Password must be 10+ chars with uppercase, lowercase, number & special char');
    }

    if (!checkBox) {
        checkInput.setCustomValidity('You must agree to the terms');
    }

    // Trigger the browser tooltip; checkValidity(checks if everything in above code has passed) + reportValidity are builtIn methods(this one displays if any one input is invalid with your custom validity messages)
    if (!form.checkValidity()) {
        form.reportValidity();
        return; // stop submission if invalid
    }

    // Form is valid
    console.log('Form submitted!', { email, password, checkBox });
});


//Password field : Eye visibility
const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>`;

const eyeClose = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
</svg>`;

toggleBtn.addEventListener('click', function () {
    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleBtn.innerHTML = eyeClose;
    } else {
        passwordField.type = "password";
        toggleBtn.innerHTML = eyeOpen;
    }
});