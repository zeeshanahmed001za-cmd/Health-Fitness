document.addEventListener('DOMContentLoaded', () => {
    // Edit Profile Functionality
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    const personalInfoForm = document.getElementById('personalInfoForm');
    const physicalDetailsForm = document.getElementById('physicalDetailsForm');

    // Get all inputs within forms
    const allInputs = [
        ...personalInfoForm.querySelectorAll('input, select'),
        ...physicalDetailsForm.querySelectorAll('input, select')
    ];

    // Store original values just in case they cancel
    const storeOriginalValues = () => {
        allInputs.forEach(input => {
            input.dataset.originalValue = input.value;
        });
    };

    // Restore original values
    const restoreOriginalValues = () => {
        allInputs.forEach(input => {
            if(input.dataset.originalValue !== undefined) {
                input.value = input.dataset.originalValue;
            }
        });
    };

    const toggleEditMode = (isEditing) => {
        allInputs.forEach(input => {
            // we don't disable email usually in profile pages, but keeping it simple here
            input.disabled = !isEditing;
        });

        if (isEditing) {
            editProfileBtn.classList.add('hidden');
            saveProfileBtn.classList.remove('hidden');
            cancelEditBtn.classList.remove('hidden');
            storeOriginalValues();
            
            // Focus on the first input
            const firstInput = document.getElementById('firstName');
            if(firstInput) firstInput.focus();
        } else {
            editProfileBtn.classList.remove('hidden');
            saveProfileBtn.classList.add('hidden');
            cancelEditBtn.classList.add('hidden');
        }
    };

    editProfileBtn.addEventListener('click', () => {
        toggleEditMode(true);
    });

    cancelEditBtn.addEventListener('click', () => {
        restoreOriginalValues();
        toggleEditMode(false);
    });

    saveProfileBtn.addEventListener('click', () => {
        // Here you would typically send data to a backend API
        console.log("Saving changes...");
        // Mock save complete
        toggleEditMode(false);
    });

});
