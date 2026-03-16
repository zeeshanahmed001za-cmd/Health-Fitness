document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Initialization
    let onboardingData = JSON.parse(sessionStorage.getItem('onboardingData')) || JSON.parse(localStorage.getItem('userSession')) || {};
    let loggedExercises = JSON.parse(localStorage.getItem('loggedExercises_grouped')) || [];
    
    // UI Selectors
    const weightVal = document.getElementById('weightLostStatus');
    const weightUnitText = document.getElementById('weightUnitText');
    const weightTrend = document.getElementById('weightTrendText');
    const bmiVal = document.getElementById('bmiValue');
    const bmiStatus = document.getElementById('bmiStatus');
    const bodyFatVal = document.getElementById('bodyFatValue');
    const goalsCompletedVal = document.querySelector('.statsHighlightGrid .statCard:last-child .statValue');
    const goalsTotalVal = document.querySelector('.statsHighlightGrid .statCard:last-child .statUnit');
    const goalsFill = document.querySelector('.miniProgressBar .fill');

    // Modal Selectors
    const metricsModal = document.getElementById('metricsModal');
    const openMetricsBtn = document.querySelector('.headerActions .primaryBtn');
    const closeMetricsBtn = document.getElementById('closeMetricsModal');
    const metricsForm = document.getElementById('metricsForm');

    // 2. Core Functions
    const calculateBMI = (weight, height, heightUnit) => {
        if (!weight || !height) return '--.-';
        
        let w = parseFloat(weight); // kg or lbs
        let h = parseFloat(height); // cm or inches
        
        // Convert to Metric (kg and meters) for standard formula
        if (onboardingData.weightUnit === 'imperial') {
            w = w * 0.453592;
        }
        
        if (heightUnit === 'imperial') {
            h = h * 0.0254; // inches to meters
        } else {
            h = h / 100; // cm to meters
        }
        
        const bmi = w / (h * h);
        return bmi.toFixed(1);
    };

    const getBMIStatus = (bmi) => {
        if (bmi === '--.-') return 'No Data';
        const b = parseFloat(bmi);
        if (b < 18.5) return 'Underweight';
        if (b < 25) return 'Healthy Range';
        if (b < 30) return 'Overweight';
        return 'Obese';
    };

    const updateUI = () => {
        // --- Weight Card ---
        const currentW = onboardingData.weightValue || 0;
        const goalW = onboardingData.goalWeightValue || 0;
        const unit = onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg';
        
        weightVal.textContent = currentW;
        weightUnitText.textContent = unit;
        
        const diff = (goalW - currentW).toFixed(1);
        if (diff === 0) {
            weightTrend.textContent = 'Goal Reached! 🏆';
            weightTrend.className = 'statTrend positive';
        } else if (diff < 0) {
            weightTrend.textContent = `${Math.abs(diff)} ${unit} to go!`;
            weightTrend.className = 'statTrend';
        } else {
            weightTrend.textContent = `${diff} ${unit} over goal`;
            weightTrend.className = 'statTrend negative';
        }

        // --- BMI Card ---
        const bmi = calculateBMI(currentW, onboardingData.heightValue, onboardingData.heightUnit);
        bmiVal.textContent = bmi;
        bmiStatus.textContent = getBMIStatus(bmi);
        bmiStatus.className = 'statTrend ' + (bmiStatus.textContent === 'Healthy Range' ? 'positive' : 'neutral');

        // --- Goals Card ---
        const totalEx = loggedExercises.length;
        const compEx = loggedExercises.filter(e => e.completed).length;
        goalsCompletedVal.textContent = compEx;
        goalsTotalVal.textContent = `/${totalEx || 15}`;
        const goalPercent = totalEx > 0 ? (compEx / totalEx) * 100 : 0;
        goalsFill.style.width = `${goalPercent}%`;

        // --- Body Fat radial ---
        const bf = onboardingData.bodyFat || 18.5;
        bodyFatVal.textContent = `${bf}%`;
        const radialMeter = document.querySelector('.radialSvg .meter');
        if (radialMeter) {
            const offset = 283 - (283 * (bf / 100));
            radialMeter.style.strokeDashoffset = offset;
        }

        // --- Measurements ---
        const waist = onboardingData.waistSize || 82;
        const waistBar = document.querySelector('.measurementItem:nth-child(2) .mBar');
        const waistVal = document.querySelector('.measurementItem:nth-child(2) .mValue');
        if (waistBar && waistVal) {
            waistVal.textContent = `${waist} cm`;
            waistBar.style.width = `${Math.min((waist / 120) * 100, 100)}%`;
        }

        // --- Consistency ---
        const consistencyVal = document.getElementById('consistencyValue');
        const consistencyTrend = document.getElementById('consistencyTrendText');
        if (consistencyVal && consistencyTrend) {
            // Mock consistency: (Completed / Weekly Goal of 10) * 100
            const consistency = Math.min(Math.round((compEx / 10) * 100), 100);
            consistencyVal.textContent = consistency;
            consistencyTrend.textContent = consistency > 50 ? "↑ On Track" : "Keep pushing!";
            consistencyTrend.className = `statTrend ${consistency > 50 ? 'positive' : 'neutral'}`;
        }

        // --- Milestone Checking ---
        if (compEx >= 7) {
            const consistencyMilestone = document.querySelector('.milestonesGrid .milestoneCard:nth-child(2)');
            if (consistencyMilestone) consistencyMilestone.classList.remove('locked');
        }
        if (totalEx >= 50) {
            const gripMilestone = document.querySelector('.milestonesGrid .milestoneCard:nth-child(3)');
            if (gripMilestone) {
                gripMilestone.classList.remove('locked');
                gripMilestone.querySelector('p').textContent = "Logged over 50 exercises!";
            }
        }
    };

    // 3. Modal Interactions
    openMetricsBtn.addEventListener('click', () => {
        metricsModal.classList.add('active');
        // Pre-fill
        document.getElementById('currentWeight').value = onboardingData.weightValue || '';
        document.getElementById('bodyFat').value = onboardingData.bodyFat || '';
    });

    closeMetricsBtn.addEventListener('click', () => {
        metricsModal.classList.remove('active');
    });

    metricsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newWeight = document.getElementById('currentWeight').value;
        const newBF = document.getElementById('bodyFat').value;
        const newWaist = document.getElementById('waistSize').value;

        // Update local object
        onboardingData.weightValue = parseFloat(newWeight);
        if (newBF) onboardingData.bodyFat = parseFloat(newBF);
        if (newWaist) onboardingData.waistSize = parseFloat(newWaist);

        // Persistent save
        sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        localStorage.setItem('userSession', JSON.stringify(onboardingData));
        
        updateUI();
        metricsModal.classList.remove('active');
        
        // Show success
        alert("Metrics updated successfully! Your progress chart is being recalibrated.");
    });

    // 4. Chart Filters Interaction
    const filterButtons = document.querySelectorAll('.filterBtn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Visual feedback: briefly fade chart
            const chart = document.querySelector('.chartSvg');
            chart.style.opacity = '0.3';
            setTimeout(() => {
                chart.style.opacity = '1';
                // Randomize chart a bit for "interactive" feel
                const path = chart.querySelector('path:not([fill])');
                const fillPath = chart.querySelector('path[fill*="Gradient"]');
                const points = [150, 140, 120, 100, 80, 70].map(p => p + (Math.random() * 20 - 10));
                const d = `M0,${points[0]} Q100,${points[1]} 200,${points[2]} T400,${points[3]} T600,${points[4]} T800,${points[5]}`;
                path.setAttribute('d', d);
                fillPath.setAttribute('d', d + ' V200 H0 Z');
            }, 300);
        });
    });

    // 5. Initial Animations & UI Load
    updateUI();
    
    // Animate Progress Bars on Load
    const progressBars = document.querySelectorAll('.mBar, .fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.transition = 'width 1.5s cubic-bezier(0.1, 0.5, 0.2, 1)';
            bar.style.width = width;
        }, 300);
    });

    // Download Report Mock
    document.querySelector('.headerActions .secondaryBtn').addEventListener('click', () => {
        alert("Generating your health report... This will be downloaded as a PDF shortly.");
    });
});
