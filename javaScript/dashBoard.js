document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Selectors
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const welcomeName = document.querySelector('.welcomeText h2');
    const logWorkoutBtn = document.querySelector('.welcomeAction .primaryBtn');
    const workoutList = document.querySelector('.workoutList');
    const weeklyProgressText = document.querySelector('.welcomeText p');
    const searchInput = document.querySelector('.searchBar input');
    const notificationBtn = document.querySelector('.notificationBtn');
    const logoutBtn = document.querySelector('.logoutBtn');

    // 2. Sidebar Logic
    const toggleSidebarDesktop = () => {
        if (window.innerWidth > 768) {
            sidebar.classList.toggle('collapsed');
        } else {
            sidebar.classList.add('mobile-open');
            sidebarOverlay.classList.add('active');
        }
    };

    const closeSidebarMobile = () => {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    };

    toggleSidebarBtn.addEventListener('click', toggleSidebarDesktop);
    closeSidebarBtn.addEventListener('click', closeSidebarMobile);
    sidebarOverlay.addEventListener('click', closeSidebarMobile);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        } else {
            sidebar.classList.remove('collapsed');
        }
    });

    // 3. User Data Integration
    const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData')) || JSON.parse(localStorage.getItem('userSession')) || {};
    
    if (welcomeName) {
        const firstName = onboardingData.firstName || 'Alex';
        welcomeName.textContent = `Hello, ${firstName}!`;
    }

    // 4. Recent Workouts & Progress Logic
    const loadRecentWorkouts = () => {
        const storedExercises = JSON.parse(localStorage.getItem('loggedExercises_grouped')) || [];
        
        if (storedExercises.length > 0) {
            const completedCount = storedExercises.filter(ex => ex.completed).length;
            const progress = Math.round((completedCount / storedExercises.length) * 100);
            
            // Calculate total calories burned from completed exercises
            const totalCals = storedExercises
                .filter(ex => ex.completed)
                .reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0);
            
            const dashCals = document.getElementById('dashCalories');
            const calorieBar = document.getElementById('calorieProgress');
            
            if (dashCals) dashCals.textContent = totalCals.toLocaleString();
            if (calorieBar) {
                // Mock goal of 2000 for progress bar
                const calPercent = Math.min((totalCals / 2000) * 100, 100);
                calorieBar.style.width = `${calPercent}%`;
            }

            if (weeklyProgressText) {
                weeklyProgressText.textContent = `You've crushed ${progress}% of your routine today. Keep it up!`;
            }

            // Dynamic item for current session
            if (workoutList) {
                const currentSessionHtml = `
                    <div class="workoutItem pulse-outline">
                        <div class="workoutIcon bg-blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        </div>
                        <div class="workoutDetails">
                            <h4>Active Routine</h4>
                            <p>Latest Session</p>
                        </div>
                        <div class="workoutStats">
                            <span>${storedExercises.length} Exercises</span>
                            <span class="duration">${progress}% Done</span>
                        </div>
                    </div>
                `;

                // Prepend to list (replace first static item)
                const staticItems = workoutList.querySelectorAll('.workoutItem');
                workoutList.innerHTML = currentSessionHtml + Array.from(staticItems).slice(1).map(i => i.outerHTML).join('');
            }
        }
    };

    // 5. Interactive Features
    // - Search Logic (Mock)
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.toLowerCase();
                alert(`Searching for: "${query}"... This feature is coming soon!`);
                searchInput.value = '';
            }
        });
    }

    // - Notifications (Mock Toggle)
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            const badge = notificationBtn.querySelector('.badge');
            if (badge) badge.style.display = 'none';
            alert("You have 3 new notifications:\n1. Calorie target reached!\n2. Weekly report ready.\n3. New workout plan recommended.");
        });
    }

    // - Metric Card Interactions
    const metricCards = document.querySelectorAll('.dashboardContent .metricCard');
    metricCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const titleEl = card.querySelector('.metricTitle');
            const valueEl = card.querySelector('.metricValue');
            if (titleEl && valueEl) {
                const title = titleEl.textContent;
                const value = valueEl.firstChild.textContent;
                alert(`${title} Overview: Current value is ${value}. Tracking is live!`);
            }
        });
    });

    // - Log Out
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                sessionStorage.clear();
                window.location.href = 'landingPage.html';
            }
        });
    }

    // 6. Metrics Animation
    const animateMetrics = () => {
        const bars = document.querySelectorAll('.progressBar');
        bars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.1, 0.5, 0.2, 1)';
                bar.style.width = targetWidth;
            }, 300);
        });

        const activeBars = document.querySelectorAll('.bar');
        activeBars.forEach((bar, index) => {
            const targetHeight = bar.style.height;
            bar.style.height = '0';
            setTimeout(() => {
                bar.style.transition = 'height 1s ease-out';
                bar.style.height = targetHeight;
            }, 500 + (index * 100));
        });
    };

    // 7. Navigation
    logWorkoutBtn.addEventListener('click', () => {
        window.location.href = 'workoutPlans.html';
    });

    // Initialize
    loadRecentWorkouts();
    animateMetrics();
});
