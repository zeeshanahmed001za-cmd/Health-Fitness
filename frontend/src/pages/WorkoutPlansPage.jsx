import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import useDocumentTitle from "../hooks/useDocumentTitle";

import { useUser } from "../context/UserContext";

import dashStyles from "../styles/Dashboard.module.css";
import pageStyles from "../styles/WorkoutPlansPage.module.css";


const InfoIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const defaultExercises = [];

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
const ExerciseItem = ({ ex, onToggle, onRemove }) => (
  <div
    className={`${pageStyles.exerciseItem} ${ex.completed ? pageStyles.completed : ""}`}
  >
    <input
      type="checkbox"
      className={pageStyles.exCheckbox}
      checked={ex.completed}
      onChange={() => onToggle(ex.id)}
    />
    <div className={pageStyles.exBody}>
      <h4>{ex.name}</h4>
      <p>
        {ex.sets} Sets | {ex.reps}{" "}
        {ex.calories ? (
          <>
            | <span className={pageStyles.exStats}>{ex.calories} kcal</span>
          </>
        ) : (
          ""
        )}
      </p>
    </div>
    <button className={pageStyles.exRemove} onClick={() => onRemove(ex.id)}>
      <TrashIcon />
    </button>
  </div>
);

function WorkoutPlansPage() {
  const { userData, sidebarCollapsed, toggleSidebar } = useUser();
  const userId = userData?._id || userData?.id;
  useDocumentTitle("Workout Log");

  // Data state
  const [exercises, setExercises] = useState(defaultExercises);

  // Load user-specific data when userId changes
  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`loggedExercises_grouped_${userId}`);
      if (saved) {
        try {
          setExercises(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading user-specific workout data", e);
        }
      } else {
        setExercises(defaultExercises);
      }
    } else {
      setExercises(defaultExercises);
    }
  }, [userId]);

  // Modal state
  const [isModalActive, setIsModalActive] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "main",
    muscleGroup: "",
    sets: "",
    reps: "",
    calories: "",
  });

  // Persist data - User Specific
  useEffect(() => {
    if (userId && exercises !== defaultExercises) {
      localStorage.setItem(`loggedExercises_grouped_${userId}`, JSON.stringify(exercises));
    }
  }, [exercises, userId]);


  const completionPercent = useMemo(() => {
    if (exercises.length === 0) return 0;
    return Math.round(
      (exercises.filter((e) => e.completed).length / exercises.length) * 100,
    );
  }, [exercises]);

  const workoutSummary = useMemo(() => {
    const total = exercises.length;
    const completed = exercises.filter((e) => e.completed).length;
    const totalCals = exercises
      .filter((e) => e.completed)
      .reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0);
    return { total, completed, totalCals };
  }, [exercises]);

  // Grouping main exercises
  const mainGroups = useMemo(() => {
    const mainExs = exercises.filter((e) => e.category === "main");
    return mainExs.reduce((acc, ex) => {
      const mg = ex.muscleGroup || "Other";
      if (!acc[mg]) acc[mg] = [];
      acc[mg].push(ex);
      return acc;
    }, {});
  }, [exercises]);

  // Handlers


  const toggleExercise = (id) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          const isCompleting = !ex.completed;
          return { 
            ...ex, 
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : null
          };
        }
        return ex;
      }),
    );
  };

  const removeExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newEx = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      muscleGroup: formData.muscleGroup || "Recovery",
      sets: formData.sets,
      reps: formData.reps,
      calories: formData.calories || 0,
      completed: false,
    };
    setExercises((prev) => [...prev, newEx]);
    setIsModalActive(false);
    setFormData({
      name: "",
      category: "main",
      muscleGroup: "",
      sets: "",
      reps: "",
      calories: "",
    });
  };



  return (
    <main className={pageStyles.dashboardContent}>
      <header className={dashStyles.topNavbar}>
        <div className={dashStyles.navLeft}>
          <h1 className={dashStyles.pageTitle}>Workout Log</h1>
        </div>
        <div className={dashStyles.navRight}>
          <Link to="/workout-guidance" className={pageStyles.guidanceBtn}>
            <InfoIcon />
            <span>Workout Guidance</span>
          </Link>
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
        {/* Pre-Workout */}
        <section className={pageStyles.logSection}>
          <div className={pageStyles.sectionHeader}>
            <h3>Pre-Workout Stretching</h3>
            <p className={pageStyles.sectionGoal}>Goal: 5-10 mins mobility</p>
          </div>
          <div className={pageStyles.exerciseList}>
            {exercises.filter((e) => e.category === "pre").length > 0 ? (
              exercises
                .filter((e) => e.category === "pre")
                .map((ex) => (
                  <ExerciseItem
                    key={ex.id}
                    ex={ex}
                    onToggle={toggleExercise}
                    onRemove={removeExercise}
                  />
                ))
            ) : (
              <div className={pageStyles.emptyState}>
                No pending stretches.
              </div>
            )}
          </div>
        </section>

        {/* Main Exercises */}
        <section className={pageStyles.logSection}>
          <div className={pageStyles.logHeader}>
            <h3>Main Exercises</h3>
            <button
              className={pageStyles.primaryBtn}
              onClick={() => setIsModalActive(true)}
            >
              Add Exercise
            </button>
          </div>
          <div className={pageStyles.muscleGroups}>
            {Object.keys(mainGroups).length > 0 ? (
              Object.keys(mainGroups).map((mg) => (
                <div key={mg} className={pageStyles.muscleGroupContainer}>
                  <h4 className={pageStyles.muscleGroupTitle}>{mg}</h4>
                  <div className={pageStyles.exerciseList}>
                    {mainGroups[mg].map((ex) => (
                      <ExerciseItem
                        key={ex.id}
                        ex={ex}
                        onToggle={toggleExercise}
                        onRemove={removeExercise}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={pageStyles.emptyState}>
                No pending main exercises.
              </div>
            )}
          </div>
        </section>

        {/* Post-Workout */}
        <section className={pageStyles.logSection}>
          <div className={pageStyles.sectionHeader}>
            <h3>Post-Workout Recovery</h3>
            <p className={pageStyles.sectionGoal}>
              Goal: 5-10 mins static stretching
            </p>
          </div>
          <div className={pageStyles.exerciseList}>
            {exercises.filter((e) => e.category === "post").length > 0 ? (
              exercises
                .filter((e) => e.category === "post")
                .map((ex) => (
                  <ExerciseItem
                    key={ex.id}
                    ex={ex}
                    onToggle={toggleExercise}
                    onRemove={removeExercise}
                  />
                ))
            ) : (
              <div className={pageStyles.emptyState}>
                No pending recovery exercises.
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className={pageStyles.workoutSummary}>
          <div className={pageStyles.summaryCard}>
            <span className={pageStyles.label}>Total Routine</span>
            <span className={pageStyles.value}>
              {workoutSummary.total} Tasks
            </span>
          </div>
          <div
            className={`${pageStyles.summaryCard} ${pageStyles.highlight}`}
          >
            <span className={pageStyles.label}>Completed</span>
            <span className={pageStyles.value}>
              {workoutSummary.completed} Done
            </span>
          </div>
          <div className={pageStyles.summaryCard}>
            <span className={pageStyles.label}>Energy Burned</span>
            <span className={pageStyles.value} style={{ color: "#f59e0b" }}>
              {workoutSummary.totalCals} <small>kcal</small>
            </span>
          </div>
        </section>

        {/* Progress */}
        <section className={pageStyles.workoutProgress}>
          <div className={pageStyles.progressHeader}>
            <span>Workout Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className={pageStyles.progressBar}>
            <div
              className={pageStyles.progressFill}
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <div
        className={`${pageStyles.modalOverlay} ${isModalActive ? pageStyles.active : ""}`}
      >
        <div className={pageStyles.modalContent}>
          <h3>Log New Exercise</h3>
          <form onSubmit={handleFormSubmit}>
            <div className={pageStyles.formGroup}>
              <label>Exercise Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g. Pushups"
              />
            </div>
            <div className={pageStyles.formGroup}>
              <label>Category</label>
              <select
                className={pageStyles.customSelect}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="main">Main Exercise</option>
                <option value="pre">Pre-Workout Stretch</option>
                <option value="post">Post-Workout Stretch</option>
              </select>
            </div>
            {formData.category === "main" && (
              <div className={pageStyles.formGroup}>
                <label>Muscle Group</label>
                <input
                  type="text"
                  value={formData.muscleGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, muscleGroup: e.target.value })
                  }
                  required
                  placeholder="e.g. Chest, Legs"
                />
              </div>
            )}
            <div className={pageStyles.formRow}>
              <div className={pageStyles.formGroup}>
                <label>Sets</label>
                <input
                  type="number"
                  value={formData.sets}
                  onChange={(e) =>
                    setFormData({ ...formData, sets: e.target.value })
                  }
                  required
                  placeholder="0"
                />
              </div>
              <div className={pageStyles.formGroup}>
                <label>Reps / Duration</label>
                <input
                  type="text"
                  value={formData.reps}
                  onChange={(e) =>
                    setFormData({ ...formData, reps: e.target.value })
                  }
                  required
                  placeholder="e.g. 10 or 30s"
                />
              </div>
              <div className={pageStyles.formGroup}>
                <label>Calories</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: e.target.value })
                  }
                  placeholder="e.g. 50"
                />
              </div>
            </div>
            <div className={pageStyles.modalActions}>
              <button
                type="button"
                className={pageStyles.btnCancel}
                onClick={() => setIsModalActive(false)}
              >
                Cancel
              </button>
              <button type="submit" className={pageStyles.primaryBtn}>
                Add to Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default WorkoutPlansPage;
