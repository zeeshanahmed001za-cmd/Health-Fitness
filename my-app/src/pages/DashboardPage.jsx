import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";

import dashStyles from "../styles/Dashboard.module.css";
import pageStyles from "../styles/DashboardPage.module.css";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSidebarShortcut from "../hooks/useSidebarShortcut";
import * as Icons from "../components/Icons";

const AVATAR_FALLBACK =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function DashboardPage() {
    const { userData, sidebarCollapsed, toggleSidebar } = useUser();
    const navigate = useNavigate();
    const { totals, groupedLogs, nutritionGoals } = useNutrition(); // Added this line
    useDocumentTitle("Dashboard");

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [notificationsClean, setNotificationsClean] = useState(false);

    useSidebarShortcut(toggleSidebar);

    const loggedExercises = useMemo(() => {
        return JSON.parse(localStorage.getItem("loggedExercises_grouped")) || [];
    }, []);

    // Use context values instead of local lookups
    const firstName = userData.firstName || "Alex";
    const completedExercises = useMemo(
        () => loggedExercises.filter((ex) => ex.completed),
        [loggedExercises],
    );

    const progress = useMemo(() => {
        if (loggedExercises.length === 0) return 70;
        return Math.round(
            (completedExercises.length / loggedExercises.length) * 100,
        );
    }, [loggedExercises, completedExercises]);

    const totalBurned = useMemo(() => { // Changed from totalCalories to totalBurned
        return completedExercises.reduce(
            (acc, curr) => acc + (parseInt(curr.calories) || 0),
            0,
        );
    }, [completedExercises]);

    const calorieGoal = nutritionGoals.calories; // Updated to use nutritionGoals
    
    // Calculate consumed calories from the food log data
    const caloriesConsumed = totals.calories; // Updated to use totals
    const caloriesRemaining = Math.max(calorieGoal - caloriesConsumed, 0); // Updated calculation
    const nutritionProgress = Math.min((caloriesConsumed / calorieGoal) * 100, 100); // Updated calculation

    const [waterGlasses, setWaterGlasses] = useState(6);
    const waterGoal = 10;

    // New Nutrition-focused metrics
    const nutritionMetrics = {
        hero: {
            title: "Calories Today",
            primary: `${caloriesConsumed.toLocaleString()}`,
            secondary: `/ ${calorieGoal.toLocaleString()} kcal`,
            footer: (
                <>
                    <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
                        {caloriesRemaining.toLocaleString()} kcal
                    </span>{" "}
                    remaining
                </>
            ),
            progress: `${nutritionProgress}%`,
        },
        macros: {
            title: "Macros",
            items: [
                { 
                    label: "Protein", 
                    consumed: `${Math.round(totals.protein)}g`, 
                    left: `${Math.max(nutritionGoals.protein - totals.protein, 0).toFixed(0)}g left`, 
                    color: "#2dd4bf", 
                    pct: Math.min((totals.protein / nutritionGoals.protein) * 100, 100) 
                },
                { 
                    label: "Carbohydrates", 
                    consumed: `${Math.round(totals.carbs)}g`, 
                    left: `${Math.max(nutritionGoals.carbs - totals.carbs, 0).toFixed(0)}g left`, 
                    color: "#f59e0b", 
                    pct: Math.min((totals.carbs / nutritionGoals.carbs) * 100, 100) 
                },
                { 
                    label: "Fats", 
                    consumed: `${Math.round(totals.fat)}g`, 
                    left: `${Math.max(nutritionGoals.fat - totals.fat, 0).toFixed(0)}g left`, 
                    color: "#818cf8", 
                    pct: Math.min((totals.fat / nutritionGoals.fat) * 100, 100) 
                },
            ]
        },




        foodLog: {
            title: "Today's Food Log",
            meals: [
                { category: "Breakfast", kcal: groupedLogs.breakfast.reduce((s, x) => s + x.calories, 0), items: groupedLogs.breakfast.length },
                { category: "Lunch", kcal: groupedLogs.lunch.reduce((s, x) => s + x.calories, 0), items: groupedLogs.lunch.length },
                { category: "Dinner", kcal: groupedLogs.dinner.reduce((s, x) => s + x.calories, 0), items: groupedLogs.dinner.length },
                { category: "Snacks", kcal: groupedLogs.snacks.reduce((s, x) => s + x.calories, 0), items: groupedLogs.snacks.length }
            ]
        },
        summary: {
            title: "Summary",
            goal: calorieGoal,
            consumed: caloriesConsumed,
            burned: totalBurned,
            net: calorieGoal - caloriesConsumed + totalBurned
        },

    };


    // Handlers
    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen((prev) => !prev);
        } else {
            toggleSidebar();
        }
    };

    const handleNotificationClick = () => {
        setNotificationsClean(true);
    };

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                activePage="dashboard"
                isCollapsed={sidebarCollapsed}
                isMobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className={dashStyles.mainWrapper}>
                <header className={dashStyles.topNavbar}>
                    <div className={dashStyles.navLeft}>
                        <button
                            className={dashStyles.toggleSidebarBtn}
                            onClick={handleSidebarToggle}
                            aria-label="Toggle Sidebar"
                        >
                            <Icons.HamburgerIcon />
                        </button>
                        <h1 className={dashStyles.pageTitle}>Overview</h1>
                    </div>
                    <div className={dashStyles.navRight}>
                        <SearchBar />
                        <button
                            className={dashStyles.iconBtn}
                            onClick={handleNotificationClick}
                            aria-label="Notifications"
                        >
                            <Icons.BellIcon />
                            {!notificationsClean && (
                                <span className={dashStyles.badge}>3</span>
                            )}
                        </button>
                        <Link to="/profile" className={dashStyles.profileDropdownBtn}>
                            <div className={dashStyles.profileAvatar}>
                                <img
                                    src="../assets/images/avatar-placeholder.png"
                                    alt="User Avatar"
                                    onError={(e) => {
                                        e.target.src = AVATAR_FALLBACK;
                                    }}
                                />
                            </div>
                        </Link>
                    </div>
                </header>

                <main className={pageStyles.dashboardContent}>
                    <section className={pageStyles.welcomeSection}>
                        <div className={pageStyles.welcomeText}>
                            <h2>Hello, {firstName}!</h2>
                            <p>
                                You've crushed {progress}% of your{" "}
                                {loggedExercises.length > 0
                                    ? "routine today"
                                    : "weekly fitness goals"}
                                . Keep it up!
                            </p>
                        </div>
                        <div className={pageStyles.welcomeAction}>
                            <button
                                className={pageStyles.primaryBtn}
                                onClick={() => navigate("/workouts")}
                            >
                                Log Workout
                            </button>
                        </div>
                    </section>

                    <section className={pageStyles.metricsGrid}>
                        {/* 1. Hero Card - Calories Today */}
                        <div className={`${pageStyles.metricCard} ${pageStyles.heroMetric}`}>
                            <div className={pageStyles.metricHeader}>
                                <span className={pageStyles.metricTitle}>{nutritionMetrics.hero.title}</span>
                            </div>

                            <div className={pageStyles.metricValue}>
                                <span className={pageStyles.heroValue}>{nutritionMetrics.hero.primary}</span>
                                <span className={pageStyles.metricSubValue}>{nutritionMetrics.hero.secondary}</span>
                            </div>
                            <div className={pageStyles.metricProgress}>
                                <div
                                    className={pageStyles.progressBar}
                                    style={{ width: nutritionMetrics.hero.progress }}
                                ></div>
                            </div>
                            <div className={pageStyles.metricFooter}>{nutritionMetrics.hero.footer}</div>
                        </div>

                        {/* 2. Macros Card - 3 Rings */}
                        <div className={`${pageStyles.metricCard} ${pageStyles.macrosCard}`}>
                            <div className={pageStyles.metricHeader}>
                                <span className={pageStyles.metricTitle}>{nutritionMetrics.macros.title}</span>
                            </div>

                            <div className={pageStyles.ringsContainer}>
                                {nutritionMetrics.macros.items.map((m, i) => {
                                    const radius = 40;
                                    const circ = 2 * Math.PI * radius;
                                    const offset = circ - (m.pct / 100) * circ;

                                    return (
                                        <div key={i} className={pageStyles.macroRingItem}>
                                            <span className={pageStyles.macroLabel} style={{ color: m.color }}>{m.label}</span>
                                            <div className={pageStyles.svgRingWrapper}>
                                                <svg width="80" height="80" viewBox="0 0 100 100">
                                                    {/* Background Track */}
                                                    <circle
                                                        cx="50" cy="50" r={radius}
                                                        fill="transparent"
                                                        stroke="rgba(255, 255, 255, 0.05)"
                                                        strokeWidth="6"
                                                    />
                                                    {/* Active Progress */}
                                                    <circle
                                                        cx="50" cy="50" r={radius}
                                                        fill="transparent"
                                                        stroke={m.color}
                                                        strokeWidth="6"
                                                        strokeDasharray={circ}
                                                        strokeDashoffset={offset}
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 50 50)"
                                                        style={{ 
                                                            transition: "stroke-dashoffset 1s ease-in-out",
                                                            filter: `drop-shadow(0 0 4px ${m.color}80)`
                                                        }}
                                                    />
                                                </svg>
                                                <div className={pageStyles.innerValueWrapper}>
                                                    <span className={pageStyles.innerValue}>{m.consumed}</span>
                                                </div>
                                            </div>
                                            <span className={pageStyles.macroValue} style={{ color: `${m.color}cc` }}>{m.left} left</span>
                                        </div>

                                    );
                                })}
                            </div>



                        </div>


                        {/* 3. Today's Food Log Panel */}
                        <div className={`${pageStyles.metricCard} ${pageStyles.foodLogPanel}`}>
                            <div className={pageStyles.metricHeader}>
                                <span className={pageStyles.metricTitle}>{nutritionMetrics.foodLog.title}</span>
                            </div>
                            <div className={pageStyles.mealList}>
                                {nutritionMetrics.foodLog.meals.map((meal, idx) => (
                                    <div 
                                        key={idx} 
                                        className={pageStyles.mealRow}
                                        onClick={() => navigate("/nutrition")}
                                    >
                                        <div className={pageStyles.mealInfo}>
                                            <span className={pageStyles.mealCategory}>{meal.category}</span>
                                            {meal.items > 0 && <span className={pageStyles.mealItemCount}>{meal.items} items</span>}
                                        </div>
                                        <div className={pageStyles.mealStats}>
                                            {meal.kcal > 0 ? (
                                                <span className={pageStyles.mealKcal}>{meal.kcal} <span className={pageStyles.unit}>kcal</span></span>
                                            ) : (
                                                <span className={pageStyles.mealLogPrompt}>+ Add Meal</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {nutritionMetrics.foodLog.meals.every(m => m.kcal === 0) && (
                                <div className={pageStyles.emptyLogState}>
                                    <p>No meals logged today.</p>
                                    <button 
                                        className={pageStyles.logMealBtn}
                                        onClick={() => navigate("/nutrition")}
                                    >
                                        Log a Meal
                                    </button>
                                </div>
                            )}
                        </div>


                        {/* 4. Summary Card */}
                        <div className={pageStyles.metricCard}>
                            <div className={pageStyles.metricHeader}>
                                <span className={pageStyles.metricTitle}>{nutritionMetrics.summary.title}</span>
                            </div>
                            <div className={pageStyles.summaryBreakdown}>
                                <div className={pageStyles.summaryRow}>
                                    <span className={pageStyles.summaryLabel}>Goal</span>
                                    <span className={pageStyles.summaryValue}>{nutritionMetrics.summary.goal}</span>
                                </div>
                                <div className={pageStyles.summaryRow}>
                                    <span className={pageStyles.summaryLabel}>Consumed</span>
                                    <span className={pageStyles.summaryValue} style={{ color: "#ef4444" }}>- {nutritionMetrics.summary.consumed}</span>
                                </div>
                                <div className={pageStyles.summaryRow}>
                                    <span className={pageStyles.summaryLabel}>Burned</span>
                                    <span className={pageStyles.summaryValue} style={{ color: "var(--accent-primary)" }}>+ {nutritionMetrics.summary.burned}</span>
                                </div>
                                <div className={pageStyles.summaryDivider} />
                                <div className={`${pageStyles.summaryRow} ${pageStyles.summaryNetRow}`}>
                                    <span className={pageStyles.summaryLabel}>Remaining</span>
                                    <span className={pageStyles.summaryValue}>{nutritionMetrics.summary.net} <span className={pageStyles.unit}>kcal</span></span>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section className={pageStyles.secondaryGrid}>


                        <div
                            className={`${pageStyles.workoutsCard} ${pageStyles.panelCard}`}
                        >
                            <div className={pageStyles.panelHeader}>
                                <h3>Recent Workouts</h3>
                                <a
                                    href="#"
                                    className={pageStyles.viewAllLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/workouts");
                                    }}
                                >
                                    View All
                                </a>
                            </div>
                            <div className={pageStyles.workoutList}>
                                {loggedExercises.length > 0 && (
                                    <div
                                        className={`${pageStyles.workoutItem} ${pageStyles.pulseOutline}`}
                                    >
                                        <div
                                            className={`${pageStyles.workoutIcon} ${pageStyles.bgBlue}`}
                                        >
                                            <Icons.RunIcon />
                                        </div>
                                        <div className={pageStyles.workoutDetails}>
                                            <h4>Active Routine</h4>
                                            <p>Latest Session</p>
                                        </div>
                                        <div className={pageStyles.workoutStats}>
                                            <span>{loggedExercises.length} Exercises</span>
                                            <span className={pageStyles.duration}>
                                                {progress}% Done
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className={pageStyles.workoutItem}>
                                    <div
                                        className={`${pageStyles.workoutIcon} ${pageStyles.bgBlue}`}
                                    >
                                        <Icons.RunIcon />
                                    </div>
                                    <div className={pageStyles.workoutDetails}>
                                        <h4>Morning Run</h4>
                                        <p>Today, 6:00 AM</p>
                                    </div>
                                    <div className={pageStyles.workoutStats}>
                                        <span>5.2 km</span>
                                        <span className={pageStyles.duration}>45 min</span>
                                    </div>
                                </div>
                                <div className={pageStyles.workoutItem}>
                                    <div
                                        className={`${pageStyles.workoutIcon} ${pageStyles.bgOrange}`}
                                    >
                                        <Icons.StrengthIcon />
                                    </div>
                                    <div className={pageStyles.workoutDetails}>
                                        <h4>Upper Body Strength</h4>
                                        <p>Yesterday, 5:30 PM</p>
                                    </div>
                                    <div className={pageStyles.workoutStats}>
                                        <span>8 exercises</span>
                                        <span className={pageStyles.duration}>1h 15m</span>
                                    </div>
                                </div>
                                <div className={pageStyles.workoutItem}>
                                    <div
                                        className={`${pageStyles.workoutIcon} ${pageStyles.bgPurple}`}
                                    >
                                        <Icons.YogaIcon />
                                    </div>
                                    <div className={pageStyles.workoutDetails}>
                                        <h4>Yoga Flow</h4>
                                        <p>Tue, 7:00 AM</p>
                                    </div>
                                    <div className={pageStyles.workoutStats}>
                                        <span>Flexibility</span>
                                        <span className={pageStyles.duration}>30 min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default DashboardPage;
