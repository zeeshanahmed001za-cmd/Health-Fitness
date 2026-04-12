import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

import Sidebar from "../components/Sidebar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSidebarShortcut from "../hooks/useSidebarShortcut";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import { getProgressHistoryAPI, addProgressAPI, getWorkoutsAPI } from "../api";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/ProgressTracker.module.css";

// Icons
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function ProgressTracker() {
  const { userData, updateUserData, sidebarCollapsed, toggleSidebar } = useUser();
  const { foodLogs, waterLogs, nutritionGoals } = useNutrition();
  useDocumentTitle("Progress Tracker");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [progressHistory, setProgressHistory] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [timeRange, setTimeRange] = useState("1M");

  useSidebarShortcut(toggleSidebar);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [weightData, workoutData] = await Promise.all([
        getProgressHistoryAPI(),
        getWorkoutsAPI()
      ]);
      setProgressHistory(weightData);
      setWorkoutLogs(workoutData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleWeightSubmit = async () => {
    if (!newWeightInput || isNaN(newWeightInput)) return;
    try {
      await addProgressAPI({
        weight: Number(newWeightInput),
        date: new Date().toISOString()
      });
      // Optionally update User context with new current weight
      updateUserData({ weightValue: newWeightInput });
      setShowUpdateModal(false);
      setNewWeightInput("");
      fetchProgress(); // Reload chart
    } catch (err) {
      console.error("Failed to update weight:", err);
    }
  };

  const loggedExercises = useMemo(() => {
    return JSON.parse(localStorage.getItem("loggedExercises_grouped")) || [];
  }, []);

  const completedExercises = useMemo(() => loggedExercises.filter((ex) => ex.completed), [loggedExercises]);
  const currentWorkoutProgress = useMemo(() => {
    if (loggedExercises.length === 0) return 0;
    return Math.round((completedExercises.length / loggedExercises.length) * 100);
  }, [loggedExercises, completedExercises]);

  // Streak Calculation
  const activeStreak = useMemo(() => {
    if (completedExercises.length === 0) return 0;
    const sortedDates = [...completedExercises]
       .map(ex => new Date(ex.completedAt || ex.date).setHours(0,0,0,0))
       .sort((a,b) => b - a); // Descending
    
    // Remove duplicates
    const uniqueDates = [...new Set(sortedDates)];
    let streak = 0;
    const today = new Date().setHours(0,0,0,0);
    const msInDay = 86400000;

    let currentCheckDate = today;
    
    // If the latest isn't today or yesterday, streak is broken
    if (uniqueDates[0] < today - msInDay) return 0;
    
    for (const d of uniqueDates) {
      if (d === currentCheckDate || d === currentCheckDate - msInDay) {
        streak++;
        currentCheckDate = d;
      } else {
        break;
      }
    }
    return streak;
  }, [completedExercises]);

  // Derived Weight Properties
  const currentWeight = progressHistory.length > 0 
      ? progressHistory[progressHistory.length - 1].weight 
      : (userData?.weightValue || "175");
  
  const unit = userData?.weightUnit === "metric" ? "kg" : "lbs";
  const goalWeight = parseFloat(userData?.goalWeightValue);
  const primaryGoal = userData?.primaryGoal || [];

  // Trend logic
  const initialWeight = progressHistory.length > 0 ? progressHistory[0].weight : currentWeight;
  const changeAmt = Math.abs(currentWeight - initialWeight).toFixed(1);
  const isDown = currentWeight <= initialWeight;

  const trendText = isDown ? `↓ ${changeAmt} ${unit}` : `↑ ${changeAmt} ${unit}`;
  const trendClass = (isDown && primaryGoal.includes('weight_loss')) || (!isDown && primaryGoal.includes('muscle_gain')) 
                     ? styles.positive : styles.negative;
                     
  const distanceToGoal = goalWeight ? Math.abs(currentWeight - goalWeight).toFixed(1) : null;

  // Chart Formatting
  const weightChartData = useMemo(() => {
    if (progressHistory.length === 0) {
      return [
        { name: "Start", weight: currentWeight ? Number(currentWeight) : 175, timestamp: Date.now() - 86400000 * 7 }
      ];
    }

    // 1. Group by Date to avoid duplicates on X-Axis
    const grouped = progressHistory.reduce((acc, log) => {
      const dateObj = new Date(log.date || log.createdAt);
      const dayKey = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      // If multiple logs on same day, take the latest one
      acc[dayKey] = {
        name: dayKey,
        weight: log.weight,
        timestamp: dateObj.getTime()
      };
      return acc;
    }, {});

    let data = Object.values(grouped).sort((a,b) => a.timestamp - b.timestamp);
    
    // 2. Filter by Time Range
    const now = Date.now();
    const cutoff = timeRange === '1M' ? now - 30*86400000 
                  : timeRange === '3M' ? now - 90*86400000
                  : 0; // 6M or All
                  
    return data.filter(d => d.timestamp >= cutoff);
  }, [progressHistory, timeRange, currentWeight]);

  // Weekly Activity Logic
  const weeklyActivityData = useMemo(() => {
    const days = [];
    const todayObj = new Date();
    todayObj.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayObj);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const name = date.toLocaleDateString([], { weekday: 'short' });

      // Calculate Workout Adherence
      let workoutAdherence = 0;
      if (i === 0) {
        // Today's data from live state
        workoutAdherence = currentWorkoutProgress;
      } else {
        // Historical from workoutLogs (binary or check completion if available)
        const dayWorkouts = workoutLogs.filter(log => {
          const logDate = new Date(log.date || log.createdAt).toISOString().split('T')[0];
          return logDate === dayStr;
        });
        workoutAdherence = dayWorkouts.length > 0 ? 100 : 0;
      }

      // Calculate Nutrition Adherence (Calories + Water)
      const dayCalories = foodLogs
        .filter(log => log.timestamp.startsWith(dayStr))
        .reduce((sum, log) => sum + (Number(log.calories) || 0), 0);
      
      const dayWater = waterLogs
        .filter(log => log.timestamp.startsWith(dayStr))
        .length;

      const calorieGoal = nutritionGoals.calories || 2100;
      const waterGoal = 8; // 8 glasses

      const calorieAdherence = dayCalories === 0 ? 0 : Math.min((dayCalories / calorieGoal) * 100, 100);
      const waterAdherence = dayWater === 0 ? 0 : Math.min((dayWater / waterGoal) * 100, 100);

      const nutritionOverall = Math.round((calorieAdherence + waterAdherence) / 2);

      days.push({
        name,
        workout: workoutAdherence,
        nutrition: nutritionOverall
      });
    }
    return days;
  }, [workoutLogs, foodLogs, waterLogs, nutritionGoals, currentWorkoutProgress]);

  // Milestones Logic
  const unlockedFirstWorkout = completedExercises.length >= 1;
  const unlocked7DayStreak = activeStreak >= 7;
  const unlockedGoalAchieved = goalWeight && distanceToGoal <= 0.5; // Within 0.5 lbs/kg

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebar();
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>{label}</p>
          {payload.map((entry, index) => (
             <p key={index} style={{ color: entry.color, fontSize: "0.85rem" }}>
                {entry.name}: {entry.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={dashStyles.pageWrapper}>
      <Sidebar
        activePage="progress"
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
              <HamburgerIcon />
            </button>
            <h1 className={dashStyles.pageTitle}>Progress Tracker</h1>
          </div>
          <div className={dashStyles.navRight}>
            <button
              className={dashStyles.iconBtn}
              aria-label="Notifications"
              onClick={() => setNotificationsRead(true)}
            >
              <BellIcon />
              {!notificationsRead && <span className={dashStyles.badge}>2</span>}
            </button>
            <Link to="/profile" className={dashStyles.profileDropdownBtn}>
              <div className={dashStyles.profileAvatar}>
                <img src={AVATAR_FALLBACK} alt="User Avatar" />
              </div>
            </Link>
          </div>
        </header>

        <main className={styles.dashboardContent}>
          <div className={styles.progressHeader}>
            <div className={styles.headerInfo}>
              <h2>Your Progress</h2>
              <p>Visualizing your dedication through real data metrics.</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.primaryBtn} onClick={() => setShowUpdateModal(true)}>
                Update Weight
              </button>
            </div>
          </div>

          <div className={styles.statsHighlightGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Current Weight</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{currentWeight}</span>
                <span className={styles.statUnit}>{unit}</span>
              </div>
              <span className={`${styles.statTrend} ${trendClass}`}>
                {trendText} overall {distanceToGoal && `• ${distanceToGoal} ${unit} to goal`}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Workouts Completed</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{completedExercises.length}</span>
              </div>
              <span className={`${styles.statTrend} ${styles.positive}`}>Consistent focus</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Streak</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{activeStreak}</span>
                <span className={styles.statUnit}>Days</span>
              </div>
              <span className={`${styles.statTrend} ${activeStreak > 0 ? styles.positive : styles.neutral}`}>
                {activeStreak > 0 ? "You're on fire!" : "Time to get started!"}
              </span>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <div className={styles.chartHeader}>
                <h3>Weight Trend</h3>
                <div className={styles.chartFilters}>
                  <button className={`${styles.filterBtn} ${timeRange === '1M' ? styles.active : ''}`} onClick={() => setTimeRange('1M')}>1M</button>
                  <button className={`${styles.filterBtn} ${timeRange === '3M' ? styles.active : ''}`} onClick={() => setTimeRange('3M')}>3M</button>
                  <button className={`${styles.filterBtn} ${timeRange === '6M' ? styles.active : ''}`} onClick={() => setTimeRange('6M')}>6M</button>
                </div>
              </div>
              <div className={styles.visualChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#cbd5e1" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      padding={{ left: 20, right: 20 }}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis 
                      stroke="#cbd5e1" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                      padding={{ top: 20, bottom: 20 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {goalWeight && !isNaN(goalWeight) && (
                      <ReferenceLine y={goalWeight} stroke="#f59e0b" strokeDasharray="5 5" label={{ position: 'top', value: 'Goal', fill: '#f59e0b', fontSize: 12 }} />
                    )}

                    <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard} style={{ flex: '1 1 35%' }}>
              <div className={styles.chartHeader}>
                <h3>Weekly Activity Progress</h3>
              </div>
              <div className={styles.visualChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyActivityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                    <Bar dataKey="workout" fill="#818cf8" radius={[4, 4, 0, 0]} name="Workout Routine (%)" barSize={20} />
                    <Line type="monotone" dataKey="nutrition" stroke="#f59e0b" strokeWidth={3} name="Nutrition Logged (%)" dot={{ r: 4, fill: '#f59e0b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.sectionTitle}>
             <h3>Milestones</h3>
             <span className={styles.subtitle}>Unlock achievements</span>
          </div>
          <div className={styles.milestonesGrid}>
             <div className={`${styles.milestoneCard} ${!unlockedFirstWorkout ? styles.locked : ''}`}>
                <div className={styles.milestoneIcon}>🎉</div>
                <div className={styles.milestoneText}>
                   <h4>First Workout</h4>
                   <p>{unlockedFirstWorkout ? "Completed your very first routine." : "Logs an exercise."}</p>
                </div>
             </div>
             <div className={`${styles.milestoneCard} ${!unlocked7DayStreak ? styles.locked : ''}`}>
                <div className={styles.milestoneIcon}>🔥</div>
                <div className={styles.milestoneText}>
                   <h4>7-Day Streak</h4>
                   <p>{unlocked7DayStreak ? "Logged activity for a full week." : "Keep a 7 day streak."}</p>
                </div>
             </div>
             <div className={`${styles.milestoneCard} ${!unlockedGoalAchieved ? styles.locked : ''}`}>
                <div className={styles.milestoneIcon}>🏆</div>
                <div className={styles.milestoneText}>
                   <h4>Goal Achieved</h4>
                   <p>{unlockedGoalAchieved ? "Reached your target weight." : "Hit your target weight goal."}</p>
                </div>
             </div>
          </div>
        </main>
      </div>

      {showUpdateModal && (
        <div className={`${styles.modal} ${showUpdateModal ? styles.active : ""}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Update Metrics</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowUpdateModal(false)}>×</button>
            </div>
            <div className={styles.formGroup}>
              <label>Current Weight ({unit})</label>
              <input 
                type="number" 
                placeholder={`e.g. ${currentWeight}`} 
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
              />
            </div>
            <button className={styles.submitBtn} onClick={handleWeightSubmit}>
              Save Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressTracker;
