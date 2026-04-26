import { useState } from "react";
import { Link } from "react-router-dom";

import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

import dashStyles from "../styles/Dashboard.module.css";
import pageStyles from "../styles/NutritionPage.module.css";



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

const DropletIcon = () => (
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
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
  </svg>
);

const MealIcon = () => (
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
    <path d="M12 2a10 10 0 0 0 0 20"></path>
    <path d="M12 12h.01"></path>
  </svg>
);

const TOTAL_GLASSES_GOAL = 8;
const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

const FoodItem = ({ food, onRemove }) => (
  <div className={pageStyles.foodItem}>
    <div className={pageStyles.mealIcon}>
      <MealIcon />
    </div>
    <div className={pageStyles.foodInfo}>
      <h5>{food.name}</h5>
      <p>{food.category}</p>
    </div>
    <div className={pageStyles.foodMacros}>
      <span className={pageStyles.kcalValue}>{food.calories} kcal</span>
      <span className={pageStyles.macroBreakdown}>
        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
      </span>
    </div>
    <button className={pageStyles.removeFood} onClick={() => onRemove(food.id)}>
      <TrashIcon />
    </button>
  </div>
);

function NutritionPage() {
  const { updateUserData, sidebarCollapsed, toggleSidebar } = useUser();
  const {
    foodLogs,
    todaysFoodLogs,
    addFoodLog,
    removeFoodLog,
    waterTotal,
    addWaterLog,
    removeWaterLog,
    totals,
    nutritionGoals
  } = useNutrition();

  useDocumentTitle("Nutrition Tracking");


  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncingWater, setIsSyncingWater] = useState(false);

  // Calorie Calculator state
  const [calcUnit, setCalcUnit] = useState("metric");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcHeight, setCalcHeight] = useState("");
  const [calcGoal, setCalcGoal] = useState("maintain");
  const [calcResult, setCalcResult] = useState(null);

  // BMI state
  const [bmiUnit, setBmiUnit] = useState("metric");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);


  // Handlers


  const handleAddFood = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newLog = {
      id: Date.now(),
      name: formData.get("foodName"),
      category: formData.get("mealType"),
      calories: Number(formData.get("kcal")),
      protein: Number(formData.get("protein")),
      carbs: Number(formData.get("carbs")),
      fat: Number(formData.get("fat")),
    };
    addFoodLog(newLog);
    setIsModalOpen(false);
    e.target.reset();
  };

  const handleCalorieCalc = (e) => {
    e.preventDefault();
    let weight = parseFloat(calcWeight);
    let height = parseFloat(calcHeight);
    if (!weight || !height) return;

    if (calcUnit === "metric") {
      height = height * 30.48;
    } else if (calcUnit === "imperial") {
      weight = weight * 0.453592;
    }

    let bmr = 10 * weight + 6.25 * height - 5 * 30 + 5;
    let tdee = bmr * 1.55;

    if (calcGoal === "lose") tdee -= 500;
    else if (calcGoal === "gain") tdee += 300;

    setCalcResult(Math.round(tdee));
  };

  const handleBMICalc = (e) => {
    e.preventDefault();
    let weight = parseFloat(bmiWeight);
    let height = parseFloat(bmiHeight);
    if (!weight || !height) return;

    if (bmiUnit === "metric") {
      const heightInMeters = height * 0.3048;
      const bmi = weight / (heightInMeters * heightInMeters);
      setBmiResult(bmi.toFixed(1));
    } else if (bmiUnit === "imperial") {
      const heightInInches = height / 2.54;
      const bmi = (703 * weight) / (heightInInches * heightInInches);
      setBmiResult(bmi.toFixed(1));
    }
  };


  return (
    <main className={pageStyles.dashboardContent}>
      <header className={dashStyles.topNavbar}>
        <div className={dashStyles.navLeft}>
          <h1 className={dashStyles.pageTitle}>Nutrition Tracking</h1>
        </div>
        <div className={dashStyles.navRight}>
          <Link to="/nutrition-guidance" className={pageStyles.guidanceBtn}>
            <InfoIcon />
            <span>Nutrition Guidance</span>
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
        {/* Section 1 - Daily Summary Header */}
        <section className={pageStyles.trackingHeader}>
          <div className={pageStyles.metaCard}>
            <span className={pageStyles.metaLabel}>Daily Calorie Target</span>
            <span className={pageStyles.metaValue}>
              {nutritionGoals.calories} kcal
            </span>
          </div>
          <div className={pageStyles.metaCard}>
            <span className={pageStyles.metaLabel}>Consumed Today</span>
            <span className={pageStyles.metaValue} style={{ color: "var(--accent-primary)" }}>
              {totals.calories} / {nutritionGoals.calories} kcal
            </span>
          </div>
        </section>

        {/* Section 1 - Main Functinal Area */}
        <div className={pageStyles.loggingContainer}>
          {/* Food Logger */}
          <section className={pageStyles.logSection}>
            <div className={pageStyles.panelCard}>
              <div className={pageStyles.sectionHeader}>
                <h3>Meal Log</h3>
                <button
                  className={pageStyles.primaryBtn}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Meal
                </button>
              </div>
              <div className={pageStyles.foodList}>
                {todaysFoodLogs.length > 0 ? (
                  todaysFoodLogs.map((log) => (
                    <FoodItem
                      key={log.id}
                      food={log}
                      onRemove={removeFoodLog}
                    />
                  ))
                ) : (
                  <div className={pageStyles.emptyState}>
                    No meals logged for today.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Hydration Tracker */}
          <section className={pageStyles.hydrationSection}>
            <div className={pageStyles.panelCard}>
              <div className={pageStyles.hydrationTracker}>
                <div className={pageStyles.hydrationHeader}>
                  <DropletIcon className={pageStyles.dropletIcon} />
                  <h4>Hydration</h4>
                </div>
                <div className={pageStyles.glassGrid}>
                  {Array.from({ length: TOTAL_GLASSES_GOAL }).map((_, i) => (
                    <button
                      key={i}
                      className={`${pageStyles.glass} ${i < waterTotal ? pageStyles.active : ""} ${isSyncingWater ? pageStyles.syncing : ""}`}
                      onClick={async () => {
                        if (isSyncingWater) return;
                        
                        const target = i + 1;
                        if (target === waterTotal) {
                            setIsSyncingWater(true);
                            await removeWaterLog();
                            setIsSyncingWater(false);
                        } else if (target < waterTotal) {
                            setIsSyncingWater(true);
                            const diff = waterTotal - target;
                            for(let j=0; j<diff; j++) {
                                await removeWaterLog();
                            }
                            setIsSyncingWater(false);
                        } else {
                            setIsSyncingWater(true);
                            const diff = Math.min(target - waterTotal, TOTAL_GLASSES_GOAL - waterTotal);
                            // Run sequentially to ensure the backend/context logic (like max 8 check) works
                            for(let j=0; j<diff; j++) {
                                await addWaterLog();
                            }
                            setIsSyncingWater(false);
                        }
                      }}
                    />
                  ))}
                </div>
                <p className={pageStyles.hydrationStats}>
                  {waterTotal} / {TOTAL_GLASSES_GOAL} Glasses (
                  {waterTotal * 250}ml)
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Section 2 - Tools */}
        <section id="tools">
          <h3 className={pageStyles.categoryTitle} style={{ marginBottom: "24px" }}>
            Nutrition Tools
          </h3>
          <div className={pageStyles.toolsGrid}>
            {/* Calorie Calculator */}
            <div className={pageStyles.toolCard}>
              <h4>Calorie Target Calculator</h4>
              <p className={pageStyles.toolDesc}>
                Discover your ideal daily intake based on your goals.
              </p>
              <form className={pageStyles.toolForm} onSubmit={handleCalorieCalc}>
                <div className={pageStyles.unitToggle}>
                  <button
                    type="button"
                    className={`${pageStyles.tBtn} ${calcUnit === "metric" ? pageStyles.active : ""}`}
                    onClick={() => setCalcUnit("metric")}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    className={`${pageStyles.tBtn} ${calcUnit === "imperial" ? pageStyles.active : ""}`}
                    onClick={() => setCalcUnit("imperial")}
                  >
                    Imperial
                  </button>
                </div>
                <div className={pageStyles.formGroup}>
                  <label>Weight ({calcUnit === "metric" ? "kg" : "lbs"})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    placeholder="e.g. 70"
                  />
                </div>
                <div className={pageStyles.formGroup}>
                  <label>Height ({calcUnit === "metric" ? "ft" : "cm"})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    placeholder={calcUnit === "metric" ? "e.g. 5.9" : "e.g. 175"}
                  />
                </div>
                <div className={pageStyles.formGroup}>
                  <label>My Goal</label>
                  <select
                    value={calcGoal}
                    onChange={(e) => setCalcGoal(e.target.value)}
                  >
                    <option value="lose">Weight Loss</option>
                    <option value="maintain">Maintainance</option>
                    <option value="gain">Muscle Gain</option>
                  </select>
                </div>
                <button type="submit" className={pageStyles.primaryBtn}>
                  Calculate
                </button>
              </form>
              {calcResult && (
                <div className={pageStyles.resultBox}>
                  <p className={pageStyles.resultTitle}>Your Suggested Intake</p>
                  <p className={pageStyles.resultValue}>{calcResult} kcal</p>
                  <button
                    className={pageStyles.guidanceBtn}
                    style={{ marginTop: '12px', border: 'none' }}
                    onClick={() => updateUserData({ calorieGoal: calcResult })}
                  >
                    Apply Target
                  </button>
                </div>
              )}
            </div>

            {/* BMI Calculator */}
            <div className={pageStyles.toolCard}>
              <h4>BMI Calculator</h4>
              <p className={pageStyles.toolDesc}>
                Quickly check your Body Mass Index score.
              </p>
              <form className={pageStyles.toolForm} onSubmit={handleBMICalc}>
                <div className={pageStyles.unitToggle}>
                  <button
                    type="button"
                    className={`${pageStyles.tBtn} ${bmiUnit === "metric" ? pageStyles.active : ""}`}
                    onClick={() => setBmiUnit("metric")}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    className={`${pageStyles.tBtn} ${bmiUnit === "imperial" ? pageStyles.active : ""}`}
                    onClick={() => setBmiUnit("imperial")}
                  >
                    Imperial
                  </button>
                </div>
                <div className={pageStyles.formGroup}>
                  <label>Weight ({bmiUnit === "metric" ? "kg" : "lbs"})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    placeholder={bmiUnit === "metric" ? "e.g. 70" : "e.g. 154"}
                  />
                </div>
                <div className={pageStyles.formGroup}>
                  <label>Height ({bmiUnit === "metric" ? "ft" : "cm"})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    placeholder={bmiUnit === "metric" ? "e.g. 5.9" : "e.g. 175"}
                  />
                </div>
                <button
                  type="submit"
                  className={pageStyles.primaryBtn}
                  style={{ backgroundColor: "var(--accent-cyan)", boxShadow: "0 4px 15px rgba(6, 182, 212, 0.2)" }}
                >
                  Check BMI
                </button>
              </form>
              {bmiResult && (
                <div className={pageStyles.resultBox}>
                  <p className={pageStyles.resultTitle}>Your BMI Score</p>
                  <p className={pageStyles.resultValue} style={{ color: 'var(--accent-cyan)' }}>{bmiResult}</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-secondary)' }}>
                    {bmiResult < 18.5 ? "Underweight" : bmiResult < 25 ? "Healthy Weight" : bmiResult < 30 ? "Overweight" : "Obese"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <div className={`${pageStyles.modalOverlay} ${isModalOpen ? pageStyles.active : ""}`}>
        <div className={pageStyles.modalContent}>
          <h3>Log Meal Entry</h3>
          <form onSubmit={handleAddFood}>
            <div className={pageStyles.formGroup}>
              <label>Meal/Food Name</label>
              <input name="foodName" required placeholder="e.g. Salmon and Rice" />
            </div>
            <div className={pageStyles.formGroup}>
              <label>Meal Type</label>
              <select name="mealType">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
            <div className={pageStyles.macroGrid}>
              <div className={pageStyles.formGroup}>
                <label>Kcal</label>
                <input type="number" name="kcal" required placeholder="0" />
              </div>
              <div className={pageStyles.formGroup}>
                <label>Prot (g)</label>
                <input type="number" name="protein" required placeholder="0" />
              </div>
              <div className={pageStyles.formGroup}>
                <label>Carb (g)</label>
                <input type="number" name="carbs" required placeholder="0" />
              </div>
              <div className={pageStyles.formGroup}>
                <label>Fat (g)</label>
                <input type="number" name="fat" required placeholder="0" />
              </div>
            </div>
            <div className={pageStyles.modalActions}>
              <button
                type="button"
                className={pageStyles.btnCancel}
                onClick={() => setIsModalOpen(false)}
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

export default NutritionPage;
