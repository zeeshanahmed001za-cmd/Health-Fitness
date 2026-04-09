import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSidebarShortcut from "../hooks/useSidebarShortcut";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import { getProgressHistoryAPI, addProgressAPI, updateUserProfileAPI } from "../api";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/ProgressTracker.module.css";

console.log("ProgressTracker rendering...");

// Icons
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function ProgressTracker() {
  const { userData, sidebarCollapsed, toggleSidebar } = useUser();
  const { foodLogs } = useNutrition();
  useDocumentTitle("Progress Tracker");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  useSidebarShortcut(toggleSidebar);

  // Data state
  const [onboardingData, setOnboardingData] = useState(() => {
    const sessionData = JSON.parse(sessionStorage.getItem("onboardingData")) ||
      JSON.parse(localStorage.getItem("userSession")) ||
      {};
    return { ...sessionData, ...userData };
  });

  // Keep onboardingData in sync with context
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setOnboardingData(prev => ({ ...prev, ...userData }));
    }
  }, [userData]);
  const [loggedExercises] = useState(() => {
    return JSON.parse(localStorage.getItem("loggedExercises_grouped")) || [];
  });
  const [weightHistory, setWeightHistory] = useState([]);
  
  // Fetch weight history from backend
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    getProgressHistoryAPI()
      .then(data => {
        if (data && data.length > 0) {
          const mapToWH = data.map(entry => ({
            date: new Date(entry.createdAt || entry.date).toISOString().split('T')[0],
            weight: entry.weight
          }));
          setWeightHistory(mapToWH);
        } else if (onboardingData.weightValue) {
          const todayStr = new Date().toISOString().split('T')[0];
          setWeightHistory([{ date: todayStr, weight: parseFloat(onboardingData.weightValue) }]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch progress history", err);
        // fallback
        if (onboardingData.weightValue && weightHistory.length === 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          setWeightHistory([{ date: todayStr, weight: parseFloat(onboardingData.weightValue) }]);
        }
      });
  }, [onboardingData.weightValue]);

  const [dailyCalorieLogs, setDailyCalorieLogs] = useState([]);
  const [dailyMacroLogs, setDailyMacroLogs] = useState([]);

  // Generate daily history from foodLogs
  useEffect(() => {
    if (!foodLogs) return;
    
    const grouped = foodLogs.reduce((acc, log) => {
      const date = log.timestamp?.split('T')[0];
      if (!date) return acc;
      if (!acc[date]) acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      acc[date].calories += Number(log.calories) || 0;
      acc[date].protein += Number(log.protein) || 0;
      acc[date].carbs += Number(log.carbs) || 0;
      acc[date].fat += Number(log.fat) || 0;
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();
    
    setDailyCalorieLogs(sortedDates.map(date => ({
      date,
      calories: grouped[date].calories
    })));
    
    setDailyMacroLogs(sortedDates.map(date => ({
      date,
      protein: grouped[date].protein,
      carbs: grouped[date].carbs,
      fat: grouped[date].fat,
      proteinGoal: 150 
    })));
  }, [foodLogs]);

  // Chart filter state
  const [chartFilter, setChartFilter] = useState("3M");
  const [chartOpacity, setChartOpacity] = useState(1);

  // Modal state
  const [isModalActive, setIsModalActive] = useState(false);
  const [formData, setFormData] = useState({
    currentWeight: onboardingData.weightValue || "",
    bodyFat: onboardingData.bodyFat || "",
    displayUnit: userData.weightUnit || 'metric'
  });

  // Global Esc key listener for modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalActive(false);
    };
    if (isModalActive) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalActive]);

  // Cleanup for timeouts
  useEffect(() => {
    let timer;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Calculations
  const bmi = useMemo(() => {
    console.log("BMI Calc - onboardingData:", onboardingData);
    const { weightValue, heightFeet, heightInches, heightCm, weightUnit, heightUnit } = onboardingData;

    if (!weightValue || (!heightFeet && !heightCm)) {
      console.log("BMI Calc - Missing data:", { weightValue, heightFeet, heightCm });
      return "--.-";
    }

    let w = parseFloat(weightValue);
    let h;

    if (heightUnit === 'imperial') {
      const totalInches = (parseFloat(heightFeet) || 0) * 12 + (parseFloat(heightInches) || 0);
      h = totalInches * 0.0254;
      console.log("BMI Calc - Imperial:", { totalInches, h });
    } else {
      h = (parseFloat(heightCm) || 0) / 100;
      console.log("BMI Calc - Metric:", { heightCm, h });
    }

    if (h === 0) {
      console.log("BMI Calc - Height is 0");
      return "--.-";
    }

    if (weightUnit === "imperial") w *= 0.453592;

    const b = w / (h * h);
    console.log("BMI Calc - Result:", { w, h, b });
    return b.toFixed(1);
  }, [onboardingData]);

  const bmiStatus = useMemo(() => {
    if (bmi === "--.-") return "No Data";
    const b = parseFloat(bmi);
    if (b < 18.5) return "Underweight";
    if (b < 25) return "Healthy Range";
    if (b < 30) return "Overweight";
    return "Obese";
  }, [bmi]);

  const compEx = useMemo(
    () => loggedExercises.filter((e) => e.completed).length,
    [loggedExercises]
  );
  const totalEx = loggedExercises.length;
  const goalPercent = totalEx > 0 ? (compEx / totalEx) * 100 : 0;

  const bodyFatValue = onboardingData.bodyFat;
  const radialOffset = bodyFatValue !== undefined ? 283 - 283 * (bodyFatValue / 100) : 283;

  const bodyFatStatus = useMemo(() => {
    if (bodyFatValue === undefined || bodyFatValue === "") return null;
    const bf = parseFloat(bodyFatValue);
    // Generic ranges (can be refined by gender if available)
    if (bf < 6) return "Very Low";
    if (bf < 14) return "Athletic";
    if (bf < 18) return "Fitness";
    if (bf < 25) return "Healthy Range";
    return "Above Average";
  }, [bodyFatValue]);



  const consistency = Math.min(Math.round((compEx / 10) * 100), 100);

  // Nutrition Calculations
  const avgDailyCalories = useMemo(() => {
    if (dailyCalorieLogs.length === 0) return null;
    const last7Days = dailyCalorieLogs.slice(-7);
    const sum = last7Days.reduce((acc, log) => acc + (log.calories || 0), 0);
    return Math.round(sum / last7Days.length);
  }, [dailyCalorieLogs]);

  const proteinGoalHit = useMemo(() => {
    if (dailyMacroLogs.length === 0) return null;
    const last7Days = dailyMacroLogs.slice(-7);
    const hitDays = last7Days.filter(log => log.protein >= (log.proteinGoal || 150)).length;
    return Math.round((hitDays / last7Days.length) * 100);
  }, [dailyMacroLogs]);

  const bestCalorieStreak = useMemo(() => {
    if (dailyCalorieLogs.length === 0) return 0;
    let maxStreak = 0;
    let currentStreak = 0;

    // Assuming a generic goal of 2000 if not specified
    const target = onboardingData.calorieGoal || 2000;
    const threshold = target * 0.1;

    dailyCalorieLogs.forEach(log => {
      const isWithinRange = Math.abs(log.calories - target) <= threshold;
      if (isWithinRange) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    return maxStreak;
  }, [dailyCalorieLogs, onboardingData.calorieGoal]);


  // Chart Handlers & Calculations
  const filteredWeightHistory = useMemo(() => {
    if (!weightHistory || weightHistory.length === 0) return [];

    const now = new Date();
    let cutoffDate = new Date();

    switch (chartFilter) {
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "All":
      default:
        cutoffDate = new Date(0); // very old date
        break;
    }

    return weightHistory.filter(w => new Date(w.date) >= cutoffDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightHistory, chartFilter]);

  const chartData = useMemo(() => {
    if (filteredWeightHistory.length === 0) return null;

    const weights = filteredWeightHistory.map(w => parseFloat(w.weight));
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);

    // If only one point, create a small range for visibility
    const padding = (maxW - minW) * 0.2 || 5;
    const yMin = minW - padding;
    const yMax = maxW + padding;

    if (filteredWeightHistory.length === 1) {
      // Single point: no path needed, just the point
      return {
        path: `M400,100`,
        points: [{ x: 400, y: 100, ...filteredWeightHistory[0] }]
      };
    }

    const wSpan = filteredWeightHistory.length - 1;
    const xStep = 800 / wSpan;

    const points = filteredWeightHistory.map((entry, idx) => {
      const x = idx * xStep;
      // prevent division by zero if yMax === yMin
      const y = yMax === yMin ? 100 : 200 - ((parseFloat(entry.weight) - yMin) / (yMax - yMin)) * 200;
      return { x, y, ...entry };
    });

    // Create a smooth bezier curve path
    let d = `M${points[0].x},${points[0].y}`;
    if (points.length === 2) {
      d += ` L${points[1].x},${points[1].y}`;
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const cPointX = (p1.x + p2.x) / 2;
        d += ` C${cPointX},${p1.y} ${cPointX},${p2.y} ${p2.x},${p2.y}`;
      }
    }

    return { path: d, points };
  }, [filteredWeightHistory]);

  // Handlers
  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebar();
    }
  };

  const handleNotificationsClick = () => {
    setNotificationsRead(true);
    alert("Notification drawer placeholder - To be replaced with a real drawer");
  };

  const handleFilterChange = (filter) => {
    setChartFilter(filter);
    setChartOpacity(0.3);
    setTimeout(() => {
      setChartOpacity(1);
    }, 300);
  };

  const handleUpdateMetrics = () => {
    setFormData({
      currentWeight: onboardingData.weightValue || "",
      bodyFat: onboardingData.bodyFat || "",
      displayUnit: userData.weightUnit || 'metric'
    });
    setIsModalActive(true);
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    let newWeight = parseFloat(formData.currentWeight);
    
    // If user logged in a unit different from system base, convert it
    if (formData.displayUnit !== userData.weightUnit) {
      if (userData.weightUnit === 'metric') {
        newWeight = newWeight / 2.20462;
      } else {
        newWeight = newWeight * 2.20462;
      }
      newWeight = parseFloat(newWeight.toFixed(1));
    }

    const updatedData = {
      ...onboardingData,
      weightValue: newWeight,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : "",
    };

    try {
      if (!isNaN(newWeight)) {
        await addProgressAPI({
          weight: newWeight,
          bodyFatPercentage: updatedData.bodyFat,
          notes: "Updated from Progress Tracker"
        });
        
        const todayStr = new Date().toISOString().split('T')[0];
        setWeightHistory(prev => {
          const newWH = [...prev];
          const todayIdx = newWH.findIndex(w => w.date === todayStr);
          if (todayIdx >= 0) {
            newWH[todayIdx].weight = newWeight;
          } else {
            newWH.push({ date: todayStr, weight: newWeight });
          }
          return newWH;
        });
      }
      await updateUserProfileAPI(updatedData);
      
      setOnboardingData(updatedData);
      setIsModalActive(false);
    } catch(err) {
      console.error("Failed to save progress", err);
      alert("Failed to save metrics to cloud!");
    } finally {
      setIsUpdating(false);
    }
  };

  // Milestone Conditions
  const isWeightMaster = onboardingData.goalWeightValue && parseFloat(onboardingData.weightValue) === parseFloat(onboardingData.goalWeightValue);
  const isConsistencyKing = compEx >= 7;
  const isIronGrip = totalEx >= 50;

  const unlockedCount = [isWeightMaster, isConsistencyKing, isIronGrip].filter(Boolean).length;

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
              onClick={handleNotificationsClick}
            >
              <BellIcon />
              {!notificationsRead && <span className={dashStyles.badge}>2</span>}
            </button>
            <Link to="/profile" className={dashStyles.profileDropdownBtn}>
              <div className={dashStyles.profileAvatar}>
                <img
                  src={AVATAR_FALLBACK}
                  alt="User Avatar"
                />
              </div>
            </Link>
          </div>
        </header>

        <main className={styles.dashboardContent}>
          <section className={styles.progressHeader}>
            <div className={styles.headerInfo}>
              <h2>Track Your Journey</h2>
              <p>Visualizing your achievements and health metrics over time.</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.secondaryBtn}
                disabled
                title="Coming soon"
              >
                Download Report
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleUpdateMetrics}
              >
                Update Metrics
              </button>
            </div>
          </section>

          <section className={styles.statsHighlightGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Weight Goal</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>
                  {onboardingData.weightValue || "0.0"}
                </span>
                <span className={styles.statUnit}>
                  {onboardingData.weightUnit === "imperial" ? "lbs" : "kg"}
                </span>
              </div>
              <span
                className={`${styles.statTrend} ${onboardingData.goalWeightValue && parseFloat(onboardingData.weightValue) === parseFloat(onboardingData.goalWeightValue) ? styles.positive : styles.neutral}`}
              >
                {onboardingData.goalWeightValue
                  ? parseFloat(onboardingData.weightValue) ===
                    parseFloat(onboardingData.goalWeightValue)
                    ? "Goal Reached! 🏆"
                    : parseFloat(onboardingData.goalWeightValue) <
                      parseFloat(onboardingData.weightValue)
                      ? `${(parseFloat(onboardingData.weightValue) - parseFloat(onboardingData.goalWeightValue)).toFixed(1)} ${onboardingData.weightUnit === "imperial" ? "lbs" : "kg"} over goal`
                      : `${(parseFloat(onboardingData.goalWeightValue) - parseFloat(onboardingData.weightValue)).toFixed(1)} ${onboardingData.weightUnit === "imperial" ? "lbs" : "kg"} to go!`
                  : "Set a goal!"}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Workout Consistency</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{consistency}</span>
                <span className={styles.statUnit}>%</span>
              </div>
              <span
                className={`${styles.statTrend} ${consistency > 50 ? styles.positive : styles.neutral}`}
              >
                {consistency > 50 ? "↑ On Track" : "Keep pushing!"}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Current BMI</span>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{bmi}</span>
              </div>
              <span
                className={`${styles.statTrend} ${bmiStatus === "Healthy Range" ? styles.positive : styles.neutral}`}
              >
                {bmiStatus}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Exercises Logged</span>
              <div className={styles.statValueContainer}>
                {totalEx === 0 ? (
                  <span className={styles.statValue} style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>No exercises logged yet</span>
                ) : (
                  <>
                    <span className={styles.statValue}>{compEx}</span>
                    <span className={styles.statUnit}>/{totalEx}</span>
                  </>
                )}
              </div>
              {totalEx > 0 && (
                <div className={styles.miniProgressBar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${goalPercent}%` }}
                  ></div>
                </div>
              )}
            </div>
          </section>

          <section className={styles.chartsGrid}>
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <div className={styles.chartHeader}>
                <h3>Weight Transformation</h3>
                <div className={styles.chartFilters}>
                  {["3M", "6M", "1Y", "All"].map((f) => (
                    <button
                      key={f}
                      className={`${styles.filterBtn} ${chartFilter === f ? styles.active : ""}`}
                      onClick={() => handleFilterChange(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.visualChart}>
                {!chartData ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📉</span>
                    <p>
                      {weightHistory.length === 0
                        ? "No weight history yet. Update your metrics to start tracking."
                        : `No data for the last ${chartFilter}.`}
                    </p>
                    {weightHistory.length === 0 && (
                      <button className={styles.primaryBtn} onClick={handleUpdateMetrics}>Update Metrics</button>
                    )}
                  </div>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 800 200"
                      className={styles.chartSvg}
                      style={{ opacity: chartOpacity }}
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--accent-primary)"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--accent-primary)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d={chartData.path}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="3"
                      />
                      <path
                        d={`${chartData.path} V200 H0 Z`}
                        fill="url(#chartGradient)"
                      />
                      {chartData.points.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="var(--accent-primary)"
                          className={styles.pulse}
                        />
                      ))}
                    </svg>
                    <div className={styles.chartLabels}>
                      {chartData.points.map((pt, i) => {
                        // Show max 6 labels evenly distributed
                        if (chartData.points.length > 6 && i % Math.ceil(chartData.points.length / 5) !== 0 && i !== chartData.points.length - 1) return <span key={i} style={{ opacity: 0 }}></span>;
                        const d = new Date(pt.date);
                        return <span key={i} style={{ position: 'absolute', left: `${pt.x / 8}%`, bottom: '-20px' }}>{d.toLocaleString('default', { month: 'short' })} {d.getDate()}</span>
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Body Fat %</h3>
              </div>
              <div className={styles.radialProgressContainer}>
                {bodyFatValue === undefined || bodyFatValue === "" ? (
                  <div className={`${styles.emptyState} ${styles.muted}`}>
                    <span>Not logged</span>
                    <button className={styles.emptyStateLink} onClick={handleUpdateMetrics}>Add in Update Metrics</button>
                  </div>
                ) : (
                  <div className={styles.radialContent}>
                    <span className={styles.value}>{bodyFatValue}%</span>
                    <span className={styles.label}>{bodyFatStatus}</span>
                  </div>
                )}

                <svg viewBox="0 0 100 100" className={styles.radialSvg}>
                  <circle cx="50" cy="50" r="45" className={styles.bg} />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={styles.meter}
                    style={{
                      strokeDasharray: 283,
                      strokeDashoffset: radialOffset,
                      stroke: bodyFatValue === undefined || bodyFatValue === "" ? "transparent" : "var(--accent-primary)"
                    }}
                  />
                </svg>
              </div>
            </div>

          </section>

          <section className={styles.statsHighlightGrid} style={{ marginTop: '32px' }}>
            <div className={styles.sectionTitle} style={{ gridColumn: '1 / -1', marginBottom: '0' }}>
              <h3>Nutrition Overview</h3>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg Daily Calories (7d)</span>
              <div className={styles.statValueContainer}>
                {avgDailyCalories === null ? (
                  <span className={styles.statValue} style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>No data yet</span>
                ) : (
                  <>
                    <span className={styles.statValue}>{avgDailyCalories}</span>
                    <span className={styles.statUnit}>kcal</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Protein Goal Hit (7d)</span>
              <div className={styles.statValueContainer}>
                {proteinGoalHit === null ? (
                  <span className={styles.statValue} style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>No data yet</span>
                ) : (
                  <>
                    <span className={styles.statValue}>{proteinGoalHit}</span>
                    <span className={styles.statUnit}>%</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Best Calorie Streak</span>
              <div className={styles.statValueContainer}>
                {bestCalorieStreak === 0 ? (
                  <span className={styles.statValue} style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>0 days</span>
                ) : (
                  <>
                    <span className={styles.statValue}>{bestCalorieStreak}</span>
                    <span className={styles.statUnit}>days</span>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className={styles.milestonesSection} style={{ marginTop: '32px' }}>
            <div className={styles.sectionTitle}>
              <h3>Recent Milestones</h3>
              <span className={styles.subtitle}>{unlockedCount} of 3 unlocked</span>
            </div>
            <div className={styles.milestonesGrid}>

              <div className={`${styles.milestoneCard} ${!isWeightMaster ? styles.locked : ""}`}>
                <div className={styles.milestoneIcon}>🏆</div>
                <div className={styles.milestoneText}>
                  <h4>Weight Master</h4>
                  <p>
                    {isWeightMaster
                      ? "Reached target weight!"
                      : onboardingData.goalWeightValue
                        ? `${Math.abs(parseFloat(onboardingData.weightValue) - parseFloat(onboardingData.goalWeightValue)).toFixed(1)} ${onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg'} to go`
                        : "Set a goal to unlock"
                    }
                  </p>
                </div>
              </div>

              <div className={`${styles.milestoneCard} ${!isConsistencyKing ? styles.locked : ""}`}>
                <div className={styles.milestoneIcon}>🔥</div>
                <div className={styles.milestoneText}>
                  <h4>Consistency King</h4>
                  <p>{isConsistencyKing ? "Active for 7+ days" : `Log ${7 - compEx} more workouts to unlock`}</p>
                </div>
              </div>

              <div className={`${styles.milestoneCard} ${!isIronGrip ? styles.locked : ""}`}>
                <div className={styles.milestoneIcon}>💪</div>
                <div className={styles.milestoneText}>
                  <h4>Iron Grip</h4>
                  <p>
                    {isIronGrip
                      ? "Logged over 50 exercises!"
                      : `Log ${50 - totalEx} more exercises to unlock`
                    }
                  </p>
                </div>
              </div>

            </div>
          </section>
        </main>
      </div>

      {/* Metrics Modal */}
      <div className={`${styles.modal} ${isModalActive ? styles.active : ""}`}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Update Metrics</h2>
            <button
              className={styles.closeModalBtn}
              onClick={() => setIsModalActive(false)}
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label>
                Current Weight ({formData.displayUnit === "imperial" ? "lbs" : "kg"})
                <button 
                  type="button"
                  className={styles.inlineToggleBtn}
                  onClick={() => {
                    const isNowImperial = formData.displayUnit === 'metric';
                    const currentVal = parseFloat(formData.currentWeight);
                    setFormData({
                      ...formData,
                      displayUnit: isNowImperial ? 'imperial' : 'metric',
                      currentWeight: isNaN(currentVal) 
                        ? "" 
                        : (isNowImperial ? currentVal * 2.20462 : currentVal / 2.20462).toFixed(1)
                    });
                  }}
                >
                  Switch to {formData.displayUnit === 'metric' ? 'lbs' : 'kg'}
                </button>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) =>
                  setFormData({ ...formData, currentWeight: e.target.value })
                }
                onWheel={(e) => e.target.blur()} 
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) =>
                  setFormData({ ...formData, bodyFat: e.target.value })
                }
                onWheel={(e) => e.target.blur()}
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Update Journey
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProgressTracker;
