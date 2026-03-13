/**
 * Nutrition.js - UI Interactions and Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Expandable Nutrients 'Know More' Dropdowns
    const toggleRows = document.querySelectorAll('.toggle-row');
    
    toggleRows.forEach(row => {
        row.addEventListener('click', () => {
            const targetId = row.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetId);
            const isExpanded = row.getAttribute('aria-expanded') === 'true';

            // Toggle expansion
            row.setAttribute('aria-expanded', !isExpanded);
            row.classList.toggle('expanded');
            targetContent.classList.toggle('show');
        });
    });

    // 2. Simple Calorie Calculator
    const calcForm = document.getElementById('calorie-form');
    const calcResult = document.getElementById('calc-result');
    const resultCals = document.getElementById('result-cals');
    const applyBtn = document.getElementById('apply-target-btn');
    const unitToggles = document.querySelectorAll('input[name="unit-type"]');
    const weightLabel = document.getElementById('label-weight');
    const heightLabel = document.getElementById('label-height');
    const metricHeight = document.getElementById('calc-height');
    const imperialHeights = document.querySelector('.imperial-height-inputs');
    
    let calculatedTarget = 0;
    let currentUnit = 'metric';

    // Unit Toggle Logic
    unitToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            currentUnit = e.target.value;
            
            if (currentUnit === 'imperial') {
                weightLabel.textContent = 'Weight (lbs)';
                heightLabel.textContent = 'Height';
                metricHeight.classList.add('hidden');
                imperialHeights.classList.remove('hidden');
            } else {
                weightLabel.textContent = 'Weight (kg)';
                heightLabel.textContent = 'Height (cm)';
                metricHeight.classList.remove('hidden');
                imperialHeights.classList.add('hidden');
            }
        });
    });

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let weight = parseFloat(document.getElementById('calc-weight').value);
            let height = 0;
            const goal = document.getElementById('calc-goal').value;

            if (currentUnit === 'imperial') {
                const ft = parseFloat(document.getElementById('calc-height-ft').value) || 0;
                const inches = parseFloat(document.getElementById('calc-height-in').value) || 0;
                
                // Convert to metric for formula
                if(!weight || (ft === 0 && inches === 0)) return;
                
                weight = weight * 0.453592; // lbs to kg
                height = (ft * 30.48) + (inches * 2.54); // ft/in to cm
            } else {
                height = parseFloat(document.getElementById('calc-height').value);
                if (!weight || !height) return;
            }

            // Simplified Mifflin-St Jeor Equation for BMR 
            // Average gender neutral formula: (10 * weight) + (6.25 * height) - (5 * 30) + (1) 
            // We use an assumed age of 30 for the calculation as it's not provided.
            let bmr = (10 * weight) + (6.25 * height) - (5 * 30) + 1;
            
            // Assume a standard 'Moderately Active' multiplier (1.55) since activity input is removed
            let tdee = bmr * 1.55;

            // Apply goal logic
            if (goal === 'lose') {
                tdee -= 500; // 500 cal deficit
            } else if (goal === 'gain') {
                tdee += 300; // 300 cal surplus
            }

            calculatedTarget = Math.round(tdee);
            
            // Animate number count (simple version)
            animateValue(resultCals, 0, calculatedTarget, 500);
            
            // Show result
            calcResult.classList.remove('hidden');
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const displayTarget = document.getElementById('display-target-calories');
            const displayRemaining = document.getElementById('display-remaining-calories');
            
            if (displayTarget && displayRemaining) {
                // Format with commas
                const formatted = calculatedTarget.toLocaleString('en-US');
                displayTarget.innerHTML = `${formatted} <small>kcal</small>`;
                displayRemaining.innerHTML = `${formatted} <small>kcal</small>`;
                
                // Visual feedback
                applyBtn.textContent = 'Applied!';
                applyBtn.classList.add('success');
                setTimeout(() => {
                    applyBtn.textContent = 'Apply to Dashboard';
                    applyBtn.classList.remove('success');
                }, 2000);
            }
        });
    }

    // 4. Hydration Tracker Interactive
    const glasses = document.querySelectorAll('.glass');
    const statusText = document.querySelector('.hydration-status');
    const totalGlasses = glasses.length;

    function updateHydrationStatus() {
        const activeCount = document.querySelectorAll('.glass.active').length;
        if(statusText) {
            statusText.textContent = `${activeCount} / ${totalGlasses} glasses (${activeCount * 250}ml)`;
        }
    }

    glasses.forEach((glass, index) => {
        glass.addEventListener('click', () => {
            // If clicking an active glass, turn it and subsequent ones off
            if (glass.classList.contains('active')) {
                // If it's the last active one, turn it off. Otherwise turn off everything after it.
                if (index === totalGlasses - 1 || !glasses[index + 1].classList.contains('active')) {
                    glass.classList.remove('active');
                } else {
                    for (let i = index + 1; i < totalGlasses; i++) {
                        glasses[i].classList.remove('active');
                    }
                }
            } else {
                // Turn on this and all previous
                for (let i = 0; i <= index; i++) {
                    glasses[i].classList.add('active');
                }
            }
            updateHydrationStatus();
        });
    });

    // Helper: Number animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
