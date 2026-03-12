document.addEventListener('DOMContentLoaded', () => {
    // --- Step Navigation Logic ---
    const steps = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progressBar');
    let currentStep = 0; // 0-indexed (Step 1 is index 0)

    // Form Data object to store user selections
    const formData = {
        firstName: '',
        lastName: '',
        gender: null,
        dob: '',
        location: '',
        primaryGoal: [], // Array to allow up to 2 selections
        fitnessLevel: null,
        activityLevel: null,
        heightUnit: 'imperial', // 'imperial' or 'metric'
        heightValue: null, // Stores total inches OR cm
        weightUnit: 'imperial', // 'imperial' or 'metric'
        weightValue: null, // Stores lbs OR kg
        goalWeightValue: null // Stores lbs OR kg
    };

    // --- Name Step Logic ---
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const nameNextBtn = document.getElementById('nameNextBtn');

    if (firstNameInput && lastNameInput && nameNextBtn) {
        const validateNames = () => {
            const first = firstNameInput.value.trim();
            const last = lastNameInput.value.trim();
            if (first !== '' && last !== '') {
                nameNextBtn.removeAttribute('disabled');
                formData.firstName = first;
                formData.lastName = last;
            } else {
                nameNextBtn.setAttribute('disabled', 'true');
            }
        };
        firstNameInput.addEventListener('input', validateNames);
        lastNameInput.addEventListener('input', validateNames);
    }

    // --- Personal Details Step Logic ---
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const dobInput = document.getElementById('dob');
    const locationInput = document.getElementById('location');
    const detailsNextBtn = document.getElementById('detailsNextBtn');

    if (detailsNextBtn) {
        const validateDetails = () => {
            const isGenderSelected = document.querySelector('input[name="gender"]:checked') !== null;
            const isDobFilled = dobInput && dobInput.value !== '';
            const isLocationFilled = locationInput && locationInput.value.trim() !== '';

            if (isGenderSelected && isDobFilled && isLocationFilled) {
                // Calculate age
                const today = new Date();
                const birthDate = new Date(dobInput.value);
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Check if under 18
                if (age < 18) {
                    alert("Sorry, you must be at least 18 years old to create an account.");
                    window.location.href = 'landingPage.html';
                    return; // Stop execution
                }

                detailsNextBtn.removeAttribute('disabled');
                formData.gender = document.querySelector('input[name="gender"]:checked').value;
                formData.dob = dobInput.value;
                formData.location = locationInput.value.trim();
            } else {
                detailsNextBtn.setAttribute('disabled', 'true');
            }
        };

        genderRadios.forEach(radio => radio.addEventListener('change', validateDetails));
        if (dobInput) dobInput.addEventListener('input', validateDetails);
        if (locationInput) locationInput.addEventListener('input', validateDetails);
    }

    // --- Body Metrics Step Logic ---
    const heightImperialContainer = document.getElementById('heightImperialContainer');
    const heightMetricContainer = document.getElementById('heightMetricContainer');
    const toggleHeightUnit = document.getElementById('toggleHeightUnit');
    const heightFeet = document.getElementById('heightFeet');
    const heightInches = document.getElementById('heightInches');
    const heightCm = document.getElementById('heightCm');
    
    const weightVal = document.getElementById('weightVal');
    const goalWeightVal = document.getElementById('goalWeightVal');
    const toggleWeightUnit = document.getElementById('toggleWeightUnit');
    const weightUnitLabels = [document.getElementById('weightUnitLabel'), document.getElementById('goalWeightUnitLabel')];
    const metricsNextBtn = document.getElementById('metricsNextBtn');

    if (metricsNextBtn) {
        // --- Height Toggle ---
        if(toggleHeightUnit) {
            toggleHeightUnit.addEventListener('click', (e) => {
                e.preventDefault();
                if (formData.heightUnit === 'imperial') {
                    formData.heightUnit = 'metric';
                    heightImperialContainer.style.display = 'none';
                    heightMetricContainer.style.display = 'flex';
                    toggleHeightUnit.textContent = 'Switch to feet/inches';
                    
                    // Convert current value if any
                    let ft = parseFloat(heightFeet.value) || 0;
                    let inc = parseFloat(heightInches.value) || 0;
                    if(ft > 0 || inc > 0) {
                        let totalInches = (ft * 12) + inc;
                        heightCm.value = (totalInches * 2.54).toFixed(1);
                    }
                } else {
                    formData.heightUnit = 'imperial';
                    heightMetricContainer.style.display = 'none';
                    heightImperialContainer.style.display = 'flex';
                    toggleHeightUnit.textContent = 'Switch to centimeters';
                    
                    // Convert current value if any
                    let cm = parseFloat(heightCm.value);
                    if(!isNaN(cm) && cm > 0) {
                        let totalInches = cm / 2.54;
                        heightFeet.value = Math.floor(totalInches / 12);
                        heightInches.value = Math.round(totalInches % 12);
                    }
                }
                validateMetrics();
            });
        }

        // --- Weight Toggle ---
        if(toggleWeightUnit) {
            toggleWeightUnit.addEventListener('click', (e) => {
                e.preventDefault();
                if (formData.weightUnit === 'imperial') {
                    formData.weightUnit = 'metric';
                    weightUnitLabels.forEach(lbl => lbl && (lbl.textContent = 'kg'));
                    weightVal.placeholder = 'kg';
                    goalWeightVal.placeholder = 'kg';
                    toggleWeightUnit.textContent = 'Switch to pounds';
                    
                    let lbs = parseFloat(weightVal.value);
                    if(!isNaN(lbs) && lbs > 0) weightVal.value = (lbs * 0.453592).toFixed(1);
                    
                    let goalLbs = parseFloat(goalWeightVal.value);
                    if(!isNaN(goalLbs) && goalLbs > 0) goalWeightVal.value = (goalLbs * 0.453592).toFixed(1);
                } else {
                    formData.weightUnit = 'imperial';
                    weightUnitLabels.forEach(lbl => lbl && (lbl.textContent = 'lbs'));
                    weightVal.placeholder = 'lbs';
                    goalWeightVal.placeholder = 'lbs';
                    toggleWeightUnit.textContent = 'Switch to kilograms';
                    
                    let kgs = parseFloat(weightVal.value);
                    if(!isNaN(kgs) && kgs > 0) weightVal.value = (kgs / 0.453592).toFixed(1);
                    
                    let goalKgs = parseFloat(goalWeightVal.value);
                    if(!isNaN(goalKgs) && goalKgs > 0) goalWeightVal.value = (goalKgs / 0.453592).toFixed(1);
                }
                validateMetrics();
            });
        }

        const validateMetrics = () => {
            let isHeightFilled = false;
            if (formData.heightUnit === 'imperial') {
                 isHeightFilled = (heightFeet.value !== '' || heightInches.value !== '');
                 if(isHeightFilled) {
                     let ft = parseFloat(heightFeet.value) || 0;
                     let inc = parseFloat(heightInches.value) || 0;
                     formData.heightValue = (ft * 12) + inc;
                 }
            } else {
                 isHeightFilled = (heightCm.value !== '' && parseFloat(heightCm.value) > 0);
                 if(isHeightFilled) formData.heightValue = parseFloat(heightCm.value);
            }

            let isWeightFilled = (weightVal.value !== '' && parseFloat(weightVal.value) > 0);
            let isGoalWeightFilled = (goalWeightVal.value !== '' && parseFloat(goalWeightVal.value) > 0);
            
            if (isHeightFilled && isWeightFilled && isGoalWeightFilled) {
                metricsNextBtn.removeAttribute('disabled');
                formData.weightValue = parseFloat(weightVal.value);
                formData.goalWeightValue = parseFloat(goalWeightVal.value);
            } else {
                metricsNextBtn.setAttribute('disabled', 'true');
            }
        };

        if (heightFeet) heightFeet.addEventListener('input', validateMetrics);
        if (heightInches) heightInches.addEventListener('input', validateMetrics);
        if (heightCm) heightCm.addEventListener('input', validateMetrics);
        if (weightVal) weightVal.addEventListener('input', validateMetrics);
        if (goalWeightVal) goalWeightVal.addEventListener('input', validateMetrics);
    }

    function updateProgress() {
        // Calculate progress percentage based on current step relative to total steps
        // Example: Step 1 (0) = 25%, Step 2 (1) = 50%, Step 3 (2) = 75%, Step 4 (3) = 100%
        const percentage = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function showStep(index) {
        // Remove active class from all steps
        steps.forEach((step, i) => {
            step.classList.remove('active');
            if (i === index) {
                step.classList.add('active');
            }
        });
        updateProgress();
        // Scroll to top of the page smoothly on step change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach Next/Back button listeners globally
    document.querySelectorAll('.nextBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Check if we are on the final step (Step 7)
            if (currentStep === steps.length - 1) {
                console.log('Final Form Data:', formData);
                // Save data to sessionStorage to carry over if needed
                sessionStorage.setItem('onboardingData', JSON.stringify(formData));
                // Redirect directly to Sign Up page instead of showing the Completion screen
                window.location.href = 'signUp.html';
                return;
            }

            if (currentStep < steps.length - 1) {
                currentStep++;
                
                // Dynamically update Step 3 (Primary Goal) greeting if we have a name
                if (currentStep === 2 && formData.firstName) {
                    const greetingEl = document.getElementById('goalGreeting');
                    if (greetingEl) {
                        greetingEl.textContent = `Welcome ${formData.firstName}, now let's know about your goals`;
                    }
                }

                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.backBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // --- Interactive Selection Cards Logic ---

    // Helper function to handle card selection within a specific step
    function handleCardSelection(stepId, dataKey, cardSelector, maxSelections = 1) {
        const stepContainer = document.getElementById(stepId);
        if (!stepContainer) return;

        const cards = stepContainer.querySelectorAll(cardSelector);
        const nextButton = stepContainer.querySelector('.nextBtn');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const value = card.getAttribute('data-value');
                const isSelected = card.classList.contains('selected');

                if (maxSelections === 1) {
                    // Single selection behavior
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    formData[dataKey] = value;
                } else {
                    // Multiple selection behavior
                    if (isSelected) {
                        // Deselect if already selected
                        card.classList.remove('selected');
                        formData[dataKey] = formData[dataKey].filter(item => item !== value);
                    } else {
                        // Select if under limit
                        if (formData[dataKey].length < maxSelections) {
                            card.classList.add('selected');
                            formData[dataKey].push(value);
                        } else {
                            // If trying to select a 3rd option, you could optionally replace one or show a warning.
                            // For a clean UX, we'll deselect the oldest selection and add the new one.
                            const oldestValue = formData[dataKey].shift();
                            cards.forEach(c => {
                                if (c.getAttribute('data-value') === oldestValue) {
                                    c.classList.remove('selected');
                                }
                            });
                            card.classList.add('selected');
                            formData[dataKey].push(value);
                        }
                    }
                }
                
                // Enable the Next button if at least one selection is made
                if (nextButton) {
                    if (maxSelections === 1 && formData[dataKey]) {
                        nextButton.removeAttribute('disabled');
                    } else if (maxSelections > 1 && formData[dataKey].length > 0) {
                        nextButton.removeAttribute('disabled');
                    } else {
                        nextButton.setAttribute('disabled', 'true');
                    }
                }
            });
        });
    }

    // Initialize Card Selection Logic
    handleCardSelection('step3', 'primaryGoal', '.optionCard', 2); // Allow up to 2 selections for goals
    handleCardSelection('step4', 'activityLevel', '.optionCard', 1); // Only 1 selection for activity level
    handleCardSelection('step5', 'fitnessLevel', '.optionCard', 1); // Only 1 selection for fitness level

    // Initialize first step progress
    updateProgress();
});
