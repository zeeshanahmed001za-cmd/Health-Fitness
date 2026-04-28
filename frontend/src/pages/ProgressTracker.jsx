import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";


import useDocumentTitle from "../hooks/useDocumentTitle";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import { getProgressHistoryAPI, addProgressAPI, getWorkoutsAPI } from "../api";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/ProgressTracker.module.css";

// Icons
const WeightIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M12 7v10"/><path d="M8 12h8"/></svg>;
const BurnIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 1.5 3.5 1 5.5s-1.5 2.5-1.5 3.5c0 1.38 1.12 2.5 2.5 2.5S17 13.38 17 12c0-3.5-2.5-4-2.5-8 4.25 2.5 6.5 6 6.5 10.5a8 8 0 1 1-16 0c0-1.85.64-3.58 1.7-5-.7 1.5-1.3 3-1.6 5z"/></svg>;
const StreakIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

const AVATAR_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function ProgressTracker() {
  const { userData, updateUserData, sidebarCollapsed, toggleSidebar } = useUser();
  const { foodLogs, waterLogs, nutritionGoals } = useNutrition();
  useDocumentTitle("Progress Tracker");

  const [activeTab, setActiveTab] = useState("weight");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [progressHistory, setProgressHistory] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [timeRange, setTimeRange] = useState("1M");

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

  const userId = userData?._id || userData?.id;

  const loggedExercises = useMemo(() => {
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(`loggedExercises_grouped_${userId}`)) || [];
  }, [userId]);
  const completedToday = useMemo(() => loggedExercises.filter((ex) => ex.completed), [loggedExercises]);
  const currentWorkoutProgress = useMemo(() => {
    if (loggedExercises.length === 0) return 0;
    return Math.round((completedToday.length / loggedExercises.length) * 100);
  }, [loggedExercises, completedToday]);

  const currentWeight = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1].weight : (userData?.weightValue || "175");
  const unit = userData?.weightUnit === "metric" ? "kg" : "lbs";
  const goalWeight = parseFloat(userData?.goalWeightValue);
  const initialWeight = progressHistory.length > 0 ? progressHistory[0].weight : currentWeight;
  const distanceToGoal = goalWeight ? Math.abs(currentWeight - goalWeight).toFixed(1) : null;

  // Weight Change from last entry
  const weightDelta = useMemo(() => {
    if (progressHistory.length < 2) return null;
    const last = progressHistory[progressHistory.length - 1].weight;
    const prev = progressHistory[progressHistory.length - 2].weight;
    const diff = (last - prev).toFixed(1);
    return diff > 0 ? `+${diff}` : diff;
  }, [progressHistory]);

  // BMI Calculation - Normalized to Metric for maximum accuracy
  const bmi = useMemo(() => {
    const rawW = parseFloat(currentWeight);
    if (!rawW || isNaN(rawW)) return null;

    // 1. Normalize Weight to KG
    let kg = rawW;
    if (userData?.weightUnit === 'imperial') {
      kg = rawW / 2.20462;
    }

    // 2. Normalize Height to CM
    let cm = parseFloat(userData?.heightCm);
    if (!cm) {
      const feet = parseFloat(userData?.heightFeet);
      const inches = parseFloat(userData?.heightInches || 0);
      if (feet) {
        cm = ((feet * 12) + inches) * 2.54;
      }
    }

    if (!kg || !cm) return null;
    
    // 3. Calculate BMI using Metric Formula: kg / m^2
    const bmiVal = (kg / Math.pow(cm / 100, 2)).toFixed(1);
    return bmiVal;
  }, [userData, currentWeight]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return "N/A";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Healthy";
    return "Overweight"; 
  }, [bmi]);

  const bmiMarkerPos = useMemo(() => {
    if (!bmi) return 0;
    const val = parseFloat(bmi);
    // Scale: 10 to 45 (total range 35)
    return Math.min(Math.max(((val - 10) / 35) * 100, 0), 100);
  }, [bmi]);

  const goalKey = useMemo(() => {
    return Array.isArray(userData?.primaryGoal) ? userData.primaryGoal[0] : userData?.primaryGoal || 'lose';
  }, [userData]);

  const goalSummaryMsg = useMemo(() => {
    switch(goalKey) {
      case 'lose':
        return `Targeting ${goalWeight} ${unit}. You're on the right path.`;
      case 'build':
        return `Focusing on strength. Consistency is your best fuel.`;
      case 'maintain':
        return `Balance achieved. Let's keep this momentum steady.`;
      case 'endurance':
        return `Building stamina. Every session counts toward your peak.`;
      default:
        return `Tracking your evolution. One step at a time.`;
    }
  }, [goalKey, goalWeight, unit]);

  const weeklyActivityData = useMemo(() => {
    const days = [];
    const todayObj = new Date();
    todayObj.setHours(23, 59, 59, 999);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayObj);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const name = date.toLocaleDateString([], { weekday: 'short' });
      let workoutAdherence = i === 0 ? currentWorkoutProgress : (workoutLogs.some(l => new Date(l.date || l.createdAt).toISOString().split('T')[0] === dayStr) ? 100 : 0);
      const dayCalories = foodLogs.filter(l => l.timestamp.startsWith(dayStr)).reduce((s, l) => s + (Number(l.calories) || 0), 0);
      const dayWater = waterLogs.filter(l => l.timestamp.startsWith(dayStr)).length;
      const calPct = Math.min((dayCalories / (nutritionGoals.calories || 2100)) * 100, 100);
      const watPct = Math.min((dayWater / 8) * 100, 100);
      days.push({ name, workout: workoutAdherence, nutrition: Math.round((calPct + watPct) / 2) });
    }
    return days;
  }, [workoutLogs, foodLogs, waterLogs, nutritionGoals, currentWorkoutProgress]);

  const weeklyAverages = useMemo(() => {
    const workoutSum = weeklyActivityData.reduce((s, d) => s + (d.workout || 0), 0) / 7;
    const nutritionSum = weeklyActivityData.reduce((s, d) => s + (d.nutrition || 0), 0) / 7;
    return {
      workout: Math.round(workoutSum),
      nutrition: Math.round(nutritionSum)
    };
  }, [weeklyActivityData]);


  const weightChartData = useMemo(() => {
    if (progressHistory.length === 0) return [{ name: "Start", weight: Number(currentWeight), timestamp: Date.now() - 86400000 * 7 }];
    const grouped = progressHistory.reduce((acc, log) => {
      const dayKey = new Date(log.date || log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      acc[dayKey] = { name: dayKey, weight: log.weight, timestamp: new Date(log.date || log.createdAt).getTime() };
      return acc;
    }, {});
    const dataFiltered = Object.values(grouped).sort((a,b) => a.timestamp - b.timestamp);
    const now = Date.now();
    const cutoff = timeRange === '1M' ? now - 30*86400000 : timeRange === '3M' ? now - 90*86400000 : 0;
    return dataFiltered.filter(d => d.timestamp >= cutoff);
  }, [progressHistory, timeRange, currentWeight]);

  const handleWeightSubmit = async () => {
    if (!newWeightInput || isNaN(newWeightInput)) return;
    try {
      await addProgressAPI({ weight: Number(newWeightInput), date: new Date().toISOString() });
      updateUserData({ weightValue: newWeightInput });
      setShowUpdateModal(false);
      setNewWeightInput("");
      fetchProgress();
    } catch (err) { console.error(err); }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>{label}</p>
          {payload.map((e, i) => <p key={i} style={{ color: e.color, fontSize: "0.85rem" }}>{e.name}: {e.value}{e.unit || ""}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <main className={styles.dashboardContent}>
      <header className={dashStyles.topNavbar}>
        <div className={dashStyles.navLeft}>
          
          <h1 className={dashStyles.pageTitle}>Progress Hub</h1>
        </div>
        <div className={dashStyles.navRight}>
          <Link to="/profile" className={dashStyles.profileDropdownBtn}><div className={dashStyles.profileAvatar}><img src={AVATAR_FALLBACK} alt="User" /></div></Link>
        </div>
      </header>

      <div className={styles.contentInner}>
        <div className={styles.heroSummary}>
          <div className={styles.heroText}>
            <h2>{goalKey === 'build' ? 'Strength & Muscle Building' : goalKey === 'lose' ? 'Weight Management Plan' : goalKey === 'maintain' ? 'Optimal Maintenance Plan' : 'Endurance Training Plan'}</h2>
            <p>Weekly Progress: <strong>{weeklyAverages.workout}% Workout</strong> Consistency & <strong>{weeklyAverages.nutrition}% Nutrition</strong> Adherence</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setShowUpdateModal(true)}>Update Metrics</button>
        </div>

        <div className={styles.statsHighlightGrid}>
          {/* Card 1: Weight Overview */}
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <span className={styles.statLabel}>Performance Weight</span>
              <div className={styles.statMain}>
                <span className={styles.statValue}>{currentWeight}</span>
                <span className={styles.statUnit}>{unit}</span>
              </div>
              <span className={styles.statBadge}>
                {weightDelta ? `${weightDelta} ${unit} since last log` : (goalWeight ? `Target: ${goalWeight} ${unit}` : 'Tracking active')}
              </span>
            </div>
          </div>

          {/* Card 2: Body Mass Index */}
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <span className={styles.statLabel}>Body Mass Index</span>
              <span className={styles.statValue}>{bmi || "N/A"}</span>
              <div className={styles.bmiScale}>
                <div className={styles.scaleTrack}>
                  <div className={styles.scaleMarker} style={{ left: `${bmiMarkerPos}%` }}></div>
                </div>
                <div className={styles.scaleLabels}>
                  <span className={bmiStatus === 'Underweight' ? styles.activeLabel : ''}>Under</span>
                  <span className={bmiStatus === 'Healthy' ? styles.activeLabel : ''}>Healthy</span>
                  <span className={bmiStatus === 'Overweight' ? styles.activeLabel : ''}>Over</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Active Streak */}
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <span className={styles.statLabel}>Active Streak</span>
              <span className={styles.statValue}>{(userData?.loginStreak || 0)}<small> Days</small></span>
              <div className={styles.streakGoalInfo}>
                <div className={styles.streakDots}>
                  {[...Array(7)].map((_, i) => {
                    const streakProgress = (userData?.loginStreak > 0) ? ((userData.loginStreak - 1) % 7) + 1 : 0;
                    return (
                      <div key={i} className={`${styles.streakDot} ${streakProgress > i ? styles.active : ''}`}></div>
                    );
                  })}
                </div>
                <span className={styles.streakStatus}>
                  {`Log in daily to keep your streak!`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.visualizationHub}>
          <div className={styles.hubHeader}>
            <div className={styles.hubTabs}>
              <button className={`${styles.tabBtn} ${activeTab === 'weight' ? styles.active : ''}`} onClick={() => setActiveTab('weight')}>Weight Trend</button>
              <button className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.active : ''}`} onClick={() => setActiveTab('activity')}>Activity Progress</button>
            </div>
            {activeTab === 'weight' && (
              <div className={styles.chartFilters}>
                {['1M', '3M', '6M'].map(r => <button key={r} className={`${styles.filterBtn} ${timeRange === r ? styles.active : ''}`} onClick={() => setTimeRange(r)}>{r}</button>)}
              </div>
            )}
          </div>

          <div className={styles.mainVisualArea}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'weight' ? (
                <ComposedChart data={weightChartData} margin={{ top: 10, right: 10, left: 35, bottom: 40 }}>
                  <defs>
                    <filter id="shadow" height="150%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                      <feOffset dx="0" dy="2" result="offsetblur" />
                      <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={12}
                    minTickGap={15}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']} 
                    width={10}
                    dx={-10}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {goalWeight && <ReferenceLine y={goalWeight} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />}
                  <Line type="monotone" dataKey="weight" stroke="var(--accent-primary)" strokeWidth={4} dot={{ r: 4, fill: "var(--accent-primary)", strokeWidth: 2, stroke: "#1e293b" }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1000} filter="url(#shadow)" />
                </ComposedChart>
              ) : (
                <ComposedChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: 35, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={12}
                    minTickGap={10}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]} 
                    width={10}
                    dx={-10}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="workout" fill="#818cf8" radius={[4, 4, 0, 0]} name="Workouts (%)" barSize={20} animationDuration={1000} />
                  <Line type="monotone" dataKey="nutrition" stroke="#f59e0b" strokeWidth={3} name="Nutrition (%)" dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e293b' }} animationDuration={1000} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {showUpdateModal && (
        <div className={`${styles.modal} ${showUpdateModal ? styles.active : ""}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Log Progress</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowUpdateModal(false)}>×</button>
            </div>
            <div className={styles.formGroup}>
              <label>Current Weight ({unit})</label>
              <input 
                type="number" 
                step="0.1" 
                autoFocus 
                placeholder={currentWeight} 
                value={newWeightInput} 
                onChange={e => setNewWeightInput(e.target.value)} 
              />
            </div>
            <button className={styles.submitBtn} onClick={handleWeightSubmit}>Save Entry</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProgressTracker;
