import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";


import dashStyles from "../styles/Dashboard.module.css";
import pageStyles from "../styles/DashboardPage.module.css";
import { isToday } from "../utils/nutritionUtils";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import * as Icons from "../components/Icons";
import QuickLogModal from "../components/QuickLogModal";

const GOAL_CONTENT = {
    weight_loss: {
        title: "Weight Loss Focus",
        insight: "Maintain a caloric deficit and track your protein to preserve muscle mass while losing fat.",
        metricLabel: "Calorie Deficit",
        metricValue: "Tracked",
        color: "#fbbf24", // Amber
        icon: <Icons.CaloriesIcon />,
        tip: "Try drinking water before meals to help control appetite."
    },
    muscle_gain: {
        title: "Muscle Building Phase",
        insight: "Ensure you're hitting your protein targets and getting enough sleep for muscle recovery.",
        metricLabel: "Muscle Growth",
        metricValue: "Active",
        color: "#818cf8", // Indigo
        icon: <Icons.StrengthIcon />,
        tip: "Progressive overload is key—try to increase your weights slightly each week."
    },
    general_fitness: {
        title: "General Fitness",
        insight: "Consistency is your superpower. Keep showing up every day for long-term health benefits.",
        metricLabel: "Active Streak",
        metricValue: "Consistent",
        color: "#10b981", // Emerald
        icon: <Icons.ActiveIcon />,
        tip: "Mixing cardio and strength training provides the best overall health benefits."
    },
    maintain_weight: {
        title: "Maintenance Mode",
        insight: "Focus on balancing your calorie intake with your energy expenditure to stay at your current weight.",
        metricLabel: "Net Calories",
        metricValue: "Balanced",
        color: "#06b6d4", // Cyan
        icon: <Icons.MacroIcon />,
        tip: "Listen to your hunger cues; maintenance is about finding your body's equilibrium."
    },
    manage_stress: {
        title: "Mind & Body Balance",
        insight: "Incorporate low-intensity movement or meditation today to help manage your cortisol levels.",
        metricLabel: "Stress Management",
        metricValue: "Prioritized",
        color: "#a78bfa", // Violet
        icon: <Icons.YogaIcon />,
        tip: "A 10-minute walk in nature is one of the fastest ways to lower stress levels."
    },
    improve_flexibility: {
        title: "Mobility & Posture",
        insight: "Daily dynamic stretching and mobility work will help improve your range of motion and reduce stiffness.",
        metricLabel: "Mobility Focus",
        metricValue: "Enhanced",
        color: "#2dd4bf", // Teal
        icon: <Icons.YogaIcon />,
        tip: "Consistency beats intensity for flexibility. 10 minutes every day is better than an hour once a week."
    },
    build_endurance: {
        title: "Stamina Builder",
        insight: "Progressive cardio volume is the key to building an unshakeable aerobic base.",
        metricLabel: "Endurance Volume",
        metricValue: "Building",
        color: "#f87171", // Red
        icon: <Icons.RunIcon />,
        tip: "Focus on your breathing rhythm during cardio to improve efficiency."
    },
    increase_energy: {
        title: "Energy Optimization",
        insight: "A consistent sleep schedule and staying hydrated are the foundations of all-day energy.",
        metricLabel: "Energy Baseline",
        metricValue: "Optimized",
        color: "#3b82f6", // Blue
        icon: <Icons.WaterIcon />,
        tip: "Limit caffeine in the afternoon to improve your sleep quality and next-day energy."
    }
};

// A Data URL SVG is an image encoded as text and embedded directly inside JavaScript or HTML.
const AVATAR_FALLBACK =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function DashboardPage() {
    const { userData, sidebarCollapsed, toggleSidebar } = useUser();
    const navigate = useNavigate();
    const { totals, groupedLogs, nutritionGoals, foodLogs, waterLogs, refreshLogs, toggleQuickLog, isQuickLogOpen, dbWorkouts, refreshWorkouts } = useNutrition();
    useDocumentTitle("Dashboard");

    const [notificationsClean, setNotificationsClean] = useState(false);



    const userId = userData?._id || userData?.id;
    // Get primary goal content
    const userGoal = useMemo(() => {
        return Array.isArray(userData?.primaryGoal) ? userData.primaryGoal[0] : userData?.primaryGoal;
    }, [userData?.primaryGoal]);
    const goalInfo = GOAL_CONTENT[userGoal] || GOAL_CONTENT.general_fitness;

    const loggedExercises = useMemo(() => {
        if (!userId) return [];
        return JSON.parse(localStorage.getItem(`loggedExercises_grouped_${userId}`)) || [];
    }, [userId]);

    // Use context values
    const firstName = userData?.firstName || userData?.name || "User";
    const completedExercises = useMemo(
        () => loggedExercises.filter((ex) => ex.completed),
        [loggedExercises],
    );

    const progress = useMemo(() => {
        if (loggedExercises.length === 0) return 0;
        return Math.round(
            (completedExercises.length / loggedExercises.length) * 100,
        );
    }, [loggedExercises, completedExercises]);

    // Fetch Workouts from backend via context
    useEffect(() => {
        if (refreshWorkouts) {
            refreshWorkouts();
        }
    }, [refreshWorkouts]);

    const totalBurned = useMemo(() => {
        const localBurned = completedExercises.reduce(
            (acc, curr) => acc + (parseInt(curr.calories) || 0),
            0,
        );
        const dbBurned = (dbWorkouts || []).reduce((acc, curr) => {
            const timestamp = curr.date || curr.createdAt;
            if (isToday(timestamp)) {
                return acc + (Number(curr.caloriesBurned) || 0);
            }
            return acc;
        }, 0);
        return localBurned + dbBurned;
    }, [completedExercises, dbWorkouts]);

    const calorieGoal = nutritionGoals.calories;
    const caloriesConsumed = totals.calories;
    const caloriesRemaining = Math.max(calorieGoal - caloriesConsumed, 0);
    const nutritionProgress = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

    const nutritionMetrics = {
        hero: {
            title: "Calories Today",
            primary: `${(caloriesConsumed || 0).toLocaleString()}`,
            secondary: `/ ${(calorieGoal || 2000).toLocaleString()} kcal`,
            footer: (
                <>
                    <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
                        {(caloriesRemaining || 0).toLocaleString()} kcal
                    </span>{" "}
                    remaining
                </>
            ),
            progress: `${nutritionProgress || 0}%`,
        },
        macros: {
            title: "Macros",
            items: [
                {
                    label: "Protein",
                    consumed: `${Math.round(totals.protein)}g`,
                    left: `${Math.max(nutritionGoals.protein - totals.protein, 0).toFixed(0)}g left`,
                    color: "#2dd4bf",
                    pct: Math.min((totals.protein / nutritionGoals.protein) * 100, 100),
                    isPriority: userGoal === 'muscle_gain'
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
                }
            ].sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0))
        },

        foodLog: {
            title: "Today's Food Log",
            meals: [
                { category: "Breakfast", kcal: groupedLogs.breakfast.reduce((s, x) => s + (Number(x.calories) || 0), 0), items: groupedLogs.breakfast.length },
                { category: "Lunch", kcal: groupedLogs.lunch.reduce((s, x) => s + (Number(x.calories) || 0), 0), items: groupedLogs.lunch.length },
                { category: "Dinner", kcal: groupedLogs.dinner.reduce((s, x) => s + (Number(x.calories) || 0), 0), items: groupedLogs.dinner.length },
                { category: "Snacks", kcal: groupedLogs.snacks.reduce((s, x) => s + (Number(x.calories) || 0), 0), items: groupedLogs.snacks.length }
            ]
        },
        summary: {
            title: "Summary",
            goal: calorieGoal,
            consumed: caloriesConsumed,
            burned: totalBurned,
            net: calorieGoal - caloriesConsumed + totalBurned,
            showDeficit: userGoal === 'weight_loss'
        },

    };


    const recentActivities = useMemo(() => {
        const activities = [];

        // Add Food Logs
        (foodLogs || []).forEach(log => {
            if (log && log.timestamp) {
                activities.push({
                    id: log.id,
                    title: log.name,
                    subtitle: log.category,
                    timestamp: log.timestamp,
                    type: 'food',
                    value: `${log.calories || 0} kcal`,
                    icon: <Icons.MacroIcon />,
                    colorClass: pageStyles['bg-orange']
                });
            }
        });

        // Add Water Logs
        (waterLogs || []).forEach(log => {
            if (log && log.timestamp) {
                activities.push({
                    id: log.id,
                    title: 'Hydration',
                    subtitle: 'Water intake',
                    timestamp: log.timestamp,
                    type: 'water',
                    value: `${log.amount || 250} ml`,
                    icon: <Icons.WaterIcon />,
                    colorClass: pageStyles['bg-blue']
                });
            }
        });

        // Add Local Workout Logs
        (loggedExercises || []).forEach(ex => {
            if (ex && ex.completed && ex.completedAt) {
                activities.push({
                    id: ex.id,
                    title: ex.name,
                    subtitle: ex.muscleGroup,
                    timestamp: ex.completedAt,
                    type: 'workout',
                    value: `${ex.calories || 0} kcal`,
                    icon: <Icons.RunIcon />,
                    colorClass: pageStyles['bg-purple']
                });
            }
        });

        // Add Backend Workout Logs
        (dbWorkouts || []).forEach(ex => {
            if (ex && ex._id) {
                activities.push({
                    id: ex._id,
                    title: ex.exercises?.[0]?.name || 'Workout',
                    subtitle: ex.type || 'Exercise',
                    timestamp: ex.date || ex.createdAt,
                    type: 'workout',
                    value: `${ex.caloriesBurned || 0} kcal`,
                    icon: <Icons.RunIcon />,
                    colorClass: pageStyles['bg-purple']
                });
            }
        });

        return activities
            .filter(act => act.timestamp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
    }, [foodLogs, waterLogs, loggedExercises, dbWorkouts]);

    // Handlers


    const handleNotificationClick = () => {
        setNotificationsClean(true);
    };

    const getWelcomeMessage = () => {
        const goalMessages = {
            weight_loss: "Burn fat, keep muscle. Let's make every calorie count!",
            muscle_gain: "Time to grow! Focus on your form and your fuel.",
            general_fitness: "Consistency is key. Let's move your body today!",
            maintain_weight: "Balance is everything. Stay on track today.",
            manage_stress: "Breathe and move. Let's find your center today.",
            improve_flexibility: "Reach further today. Your body will thank you.",
            build_endurance: "Go the distance. One step at a time.",
            increase_energy: "Power through your day with healthy choices."
        };

        const baseMsg = goalMessages[userGoal] || "Ready to conquer the day?";

        if (loggedExercises.length === 0 || progress === 0) {
            return baseMsg;
        } else if (progress < 100) {
            return `You're ${progress}% through your routine! ${baseMsg}`;
        } else {
            return "Amazing job! You have completed today's goal.";
        }
    };


    return (
        <main className={pageStyles.dashboardContent}>
            <header className={dashStyles.topNavbar}>
                <div className={dashStyles.navLeft}>
                    <h1 className={dashStyles.pageTitle}>Overview</h1>
                </div>
                <div className={dashStyles.navRight}>
                    <button
                        className={dashStyles.iconBtn}
                        onClick={() => toggleQuickLog(true)}
                        aria-label="Quick Log"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
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

            <div className={pageStyles.contentInner}>
                <section className={pageStyles.welcomeSection}>
                    <div className={pageStyles.welcomeText}>
                        <h2>Hello, {firstName}!</h2>
                        <p>{getWelcomeMessage()}</p>
                    </div>
                    <div className={pageStyles.welcomeAction}>
                        <button className={pageStyles.primaryBtn} onClick={() => toggleQuickLog(true)}>
                            Quick Log
                        </button>
                    </div>
                </section>

                <section className={pageStyles.goalSection} style={{ borderLeft: `4px solid ${goalInfo.color}` }}>
                    <div className={pageStyles.goalIcon} style={{ backgroundColor: `${goalInfo.color}15`, color: goalInfo.color }}>
                        {goalInfo.icon}
                    </div>
                    <div className={pageStyles.goalTextContent}>
                        <div className={pageStyles.goalHeader}>
                            <span className={pageStyles.goalLabel}>{goalInfo.title}</span>
                            <span className={pageStyles.goalStatusTag} style={{ backgroundColor: `${goalInfo.color}20`, color: goalInfo.color }}>
                                {goalInfo.metricValue}
                            </span>
                        </div>
                        <p className={pageStyles.goalInsight}>{goalInfo.insight}</p>
                        <div className={pageStyles.goalTipWrapper}>
                            <span className={pageStyles.tipLabel}>PRO TIP:</span>
                            <span className={pageStyles.tipText}>{goalInfo.tip}</span>
                        </div>
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
                                                    stroke="var(--track-bg)"
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
                                <span className={pageStyles.summaryLabel}>{nutritionMetrics.summary.showDeficit ? 'Target Deficit' : 'Remaining'}</span>
                                <span className={pageStyles.summaryValue}>{nutritionMetrics.summary.net} <span className={pageStyles.unit}>kcal</span></span>
                            </div>
                        </div>
                    </div>
                </section>


                <section className={pageStyles.secondaryGrid}>
                    <div className={pageStyles.panelCard}>
                        <div className={pageStyles.panelHeader}>
                            <h3>Recent Logs</h3>
                            <div className={pageStyles.panelHeaderRight}>
                                <button
                                    className={pageStyles.viewAllLink}
                                    onClick={() => navigate("/nutrition")}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Nutrition
                                </button>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <button
                                    className={pageStyles.viewAllLink}
                                    onClick={() => navigate("/workouts")}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Workouts
                                </button>
                            </div>
                        </div>
                        <div className={pageStyles.workoutList}>
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <div key={activity.id} className={pageStyles.workoutItem}>
                                        <div className={`${pageStyles.workoutIcon} ${activity.colorClass}`}>
                                            {activity.icon}
                                        </div>
                                        <div className={pageStyles.workoutDetails}>
                                            <h4>{activity.title}</h4>
                                            <p>{activity.subtitle}</p>
                                        </div>
                                        <div className={pageStyles.workoutStats}>
                                            <span>{activity.value}</span>
                                            <span className={pageStyles.duration}>
                                                {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={pageStyles.emptyLogState} style={{ padding: '2rem 0' }}>
                                    <p>No recent activity items found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default DashboardPage;
