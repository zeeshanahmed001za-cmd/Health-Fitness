document.addEventListener('DOMContentLoaded', () => {
    // 1. Core State
    let exercises = JSON.parse(localStorage.getItem('loggedExercises_grouped')) || [
        // Pre-loaded sample to demonstrate the structure if empty
        { name: 'Cat-Cow', category: 'pre', muscleGroup: 'Mobility', sets: 1, reps: '1 min', completed: false, id: 1 },
        { name: 'Arm Circles', category: 'pre', muscleGroup: 'Shoulders', sets: 1, reps: '30s', completed: false, id: 2 },
        { name: 'Leg Swings', category: 'pre', muscleGroup: 'Legs', sets: 1, reps: '15 reps/ea', completed: false, id: 3 },
        
        { name: 'Bench Press', category: 'main', muscleGroup: 'Chest', sets: 3, reps: '10', completed: false, id: 4 },
        { name: 'Incline Dumbbell Fly', category: 'main', muscleGroup: 'Chest', sets: 3, reps: '12', completed: false, id: 5 },
        { name: 'Chest Dips', category: 'main', muscleGroup: 'Chest', sets: 3, reps: 'Max', completed: false, id: 6 },
        
        { name: 'Cobra Stretch', category: 'post', muscleGroup: 'Recovery', sets: 1, reps: '45s', completed: false, id: 7 },
        { name: 'Childs Pose', category: 'post', muscleGroup: 'Recovery', sets: 1, reps: '1 min', completed: false, id: 8 }
    ];

    const workoutMeta = {
        split: 'Push / Chest Focus',
        intensity: 'Intermediate'
    };

    // 2. Selectors
    const preList = document.getElementById('preWorkoutList');
    const mainList = document.getElementById('muscleGroupContainers');
    const postList = document.getElementById('postWorkoutList');
    const summaryContainer = document.getElementById('workoutSummary');
    const progressContainer = document.getElementById('workoutProgress');
    
    // Header Selectors
    document.getElementById('splitDisplay').textContent = workoutMeta.split;
    document.getElementById('intensityDisplay').textContent = workoutMeta.intensity;
    
    // Modal Selectors
    const logModal = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openLogModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const logForm = document.getElementById('logExerciseForm');
    const categorySelect = document.getElementById('exCategory');
    const muscleGroupField = document.getElementById('muscleGroupField');

    // 3. Rendering Logic

    const renderExerciseItem = (ex, index) => `
        <div class="exerciseItem ${ex.completed ? 'completed' : ''}">
            <div class="exCheck" onclick="toggleExercise(${ex.id})"></div>
            <div class="exBody">
                <h4>${ex.name}</h4>
                <p>${ex.sets} Sets | ${ex.reps}</p>
            </div>
            <button class="exRemove" onclick="removeExercise(${ex.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    const renderSummary = () => {
        const total = exercises.length;
        const completed = exercises.filter(e => e.completed).length;
        summaryContainer.innerHTML = `
            <div class="summaryCard">
                <span class="label">Total Routine</span>
                <span class="value">${total} Tasks</span>
            </div>
            <div class="summaryCard highlight">
                <span class="label">Completed</span>
                <span class="value">${completed} Done</span>
            </div>
        `;
    };

    const renderMainExercises = () => {
        const mainExs = exercises.filter(e => e.category === 'main');
        
        // Group by muscle group
        const groups = mainExs.reduce((acc, ex) => {
            const mg = ex.muscleGroup || 'Other';
            if (!acc[mg]) acc[mg] = [];
            acc[mg].push(ex);
            return acc;
        }, {});

        mainList.innerHTML = Object.keys(groups).map(mg => `
            <div class="muscleGroupContainer">
                <h4 class="muscleGroupTitle">${mg}</h4>
                <div class="exerciseList">
                    ${groups[mg].map(ex => renderExerciseItem(ex)).join('')}
                </div>
            </div>
        `).join('') || '<div class="emptyState">No main exercises logged.</div>';
    };

    const renderAll = () => {
        // Pre-Workout
        const preExs = exercises.filter(e => e.category === 'pre');
        preList.innerHTML = preExs.map(ex => renderExerciseItem(ex)).join('') || '<div class="emptyState">None</div>';

        // Main
        renderMainExercises();

        // Post-Workout
        const postExs = exercises.filter(e => e.category === 'post');
        postList.innerHTML = postExs.map(ex => renderExerciseItem(ex)).join('') || '<div class="emptyState">None</div>';

        // Summary & Progress
        renderSummary();
        const percent = exercises.length > 0 ? Math.round((exercises.filter(e => e.completed).length / exercises.length) * 100) : 0;
        progressContainer.innerHTML = `
            <div class="progressHeader">
                <span>Workout Completion</span>
                <span>${percent}%</span>
            </div>
            <div class="progressBar">
                <div class="progressFill" style="width: ${percent}%"></div>
            </div>
        `;

        localStorage.setItem('loggedExercises_grouped', JSON.stringify(exercises));
    };

    // 4. Global Actions
    window.toggleExercise = (id) => {
        const ex = exercises.find(e => e.id === id);
        if (ex) {
            ex.completed = !ex.completed;
            renderAll();
        }
    };

    window.removeExercise = (id) => {
        exercises = exercises.filter(e => e.id !== id);
        renderAll();
    };

    // Date
    const now = new Date();
    document.getElementById('currentDateDisplay').textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Modal
    openModalBtn.addEventListener('click', () => {
        logModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        logModal.classList.remove('active');
        logForm.reset();
    });

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value !== 'main') {
            muscleGroupField.style.display = 'none';
            document.getElementById('exMuscleGroup').removeAttribute('required');
        } else {
            muscleGroupField.style.display = 'block';
            document.getElementById('exMuscleGroup').setAttribute('required', 'true');
        }
    });

    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEx = {
            id: Date.now(),
            name: document.getElementById('exName').value,
            category: categorySelect.value,
            muscleGroup: document.getElementById('exMuscleGroup').value || 'Recovery',
            sets: document.getElementById('exSets').value,
            reps: document.getElementById('exReps').value,
            completed: false
        };
        exercises.push(newEx);
        renderAll();
        logModal.classList.remove('active');
        logForm.reset();
    });

    renderAll();
});
