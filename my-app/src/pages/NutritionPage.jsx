import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import SearchBar from "../components/SearchBar";
import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/NutritionPage.module.css";
// import { useUser } from '../context/UserContext';

// --- Static Data ---
const nutrientData = [
  {
    id: "protein",
    title: "Protein",
    type: "Macronutrient",
    brief:
      "Large molecules consisting of amino acids that our bodies need to function properly.",
    importance:
      "Essential for building and repairing tissues, preserving muscle mass, and making enzymes and hormones.",
    sources: "Meat, poultry, fish, eggs, dairy, legumes, and nuts.",
  },
  {
    id: "carbs",
    title: "Carbohydrates",
    type: "Macronutrient",
    brief:
      "Sugar molecules that your body breaks down into glucose for energy.",
    importance:
      "Your body's primary and preferred source of energy. Fuels brain function and physical activity.",
    sources: "Whole grains, fruits, vegetables, beans, and oats.",
  },
  {
    id: "fats",
    title: "Fats",
    type: "Macronutrient",
    brief: "Essential lipids that provide a concentrated source of energy.",
    importance:
      "Crucial for nutrient absorption, nerve transmission, protecting organs, and hormone production.",
    sources: "Avocados, olive oil, nuts, seeds, and fatty fish.",
  },
  {
    id: "micros",
    title: "Vitamins & Minerals",
    type: "Micronutrient",
    brief:
      "Essential dietary elements needed in varying, but small quantities.",
    importance:
      "Orchestrate bone health, brain function, immune system boosting, and disease prevention.",
    sources: "A diverse diet rich in fruits, vegetables, and whole foods.",
  },
  {
    id: "water",
    title: "Water",
    type: "Essential Nutrient",
    brief:
      "The most crucial nutrient; you can only survive a few days without it.",
    importance:
      "Acts as a solvent and temperature regulator. Flushes waste, lubricates joints, aids in digestion and nutrient absorption.",
    sources: "Drinking water, water-rich fruits and vegetables, and teas.",
  },
];

const TOTAL_GLASSES = 8;

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
// const SearchIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="11" cy="11" r="8"></circle>
//         <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
//     </svg>
// );
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
const ChevronDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="18"
    height="18"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const WaterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--accent-cyan)"
    strokeWidth="2"
    width="24"
    height="24"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function NutritionPage() {
  useDocumentTitle("Nutrition");
  // const { userData } = useUser();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Accordion state
  const [expandedNutrients, setExpandedNutrients] = useState([]);

  // Calorie calculator state
  const [unit, setUnit] = useState("metric");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcGoal, setCalcGoal] = useState("maintain");
  const [calcHeightCm, setCalcHeightCm] = useState("");
  const [calcHeightFt, setCalcHeightFt] = useState("");
  const [calcHeightIn, setCalcHeightIn] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Hydration state
  const [filledGlasses, setFilledGlasses] = useState(3);

  // Cleanup for timeouts
  useEffect(() => {
    let timer;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // --- Handlers ---
  const toggleNutrient = (id) => {
    setExpandedNutrients((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  const handleCalcSubmit = (e) => {
    e.preventDefault();

    let weight = parseFloat(calcWeight);
    let height = 0;

    if (unit === "imperial") {
      const ft = parseFloat(calcHeightFt) || 0;
      const inches = parseFloat(calcHeightIn) || 0;
      if (!weight || (ft === 0 && inches === 0)) return;
      weight = weight * 0.453592;
      height = ft * 30.48 + inches * 2.54;
    } else {
      height = parseFloat(calcHeightCm);
      if (!weight || !height) return;
    }

    let bmr = 10 * weight + 6.25 * height - 5 * 30 + 1;
    let tdee = bmr * 1.55;

    if (calcGoal === "lose") tdee -= 500;
    else if (calcGoal === "gain") tdee += 300;

    setCalcResult(Math.round(tdee));
  };

  const handleApplyTarget = () => {
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 2000);
  };

  const handleGlassClick = (index) => {
    // If clicking a filled glass — unfill from that glass onward
    if (index < filledGlasses) {
      setFilledGlasses(index);
    } else {
      // Fill up to and including this glass
      setFilledGlasses(index + 1);
    }
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={dashStyles.pageWrapper}>
      <Sidebar
        activePage="nutrition"
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className={dashStyles.mainWrapper}>
        {/* Top Navbar */}
        <header className={dashStyles.topNavbar}>
          <div className={dashStyles.navLeft}>
            <button
              className={dashStyles.toggleSidebarBtn}
              onClick={handleSidebarToggle}
              aria-label="Toggle Sidebar"
            >
              <HamburgerIcon />
            </button>
            <h1 className={dashStyles.pageTitle}>Nutrition</h1>
          </div>
          <div className={dashStyles.navRight}>
            <SearchBar />
            <button className={dashStyles.iconBtn} aria-label="Notifications">
              <BellIcon />
              <span className={dashStyles.badge}>3</span>
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

        {/* Main Content */}
        <main className={styles.nutritionDashboard}>
          {/* Understanding Nutrients Section */}
          <section className={styles.understandingNutrientsSection}>
            <h2 className={styles.sectionTitle}>Understanding Nutrients</h2>
            <p className={styles.sectionIntro}>
              Nutrients are chemical compounds in food that are crucial to human
              growth, disease prevention, and overall health. They are divided
              into macros (needed in large amounts) and micros (needed in
              smaller amounts).
            </p>

            <div className={styles.nutrientsList}>
              {nutrientData.map((nutrient) => {
                const isExpanded = expandedNutrients.includes(nutrient.id);
                return (
                  <div
                    key={nutrient.id}
                    className={`${styles.nutrientRow} ${isExpanded ? styles.expanded : ""}`}
                    onClick={() => toggleNutrient(nutrient.id)}
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) =>
                      e.key === "Enter" && toggleNutrient(nutrient.id)
                    }
                  >
                    <div className={styles.nutrientHeaderRow}>
                      <div className={styles.nutrientTitleGroup}>
                        <div>
                          <h3>{nutrient.title}</h3>
                          <span className={styles.nutrientType}>
                            {nutrient.type}
                          </span>
                        </div>
                      </div>
                      <div className={styles.accordionIcon}>
                        <ChevronDown />
                      </div>
                    </div>
                    <p className={styles.nutrientBrief}>{nutrient.brief}</p>
                    {isExpanded && (
                      <div className={styles.nutrientDropdownContent}>
                        <div className={styles.nutrientDropdownInner}>
                          <p>
                            <strong>Importance & Function:</strong>{" "}
                            {nutrient.importance}
                          </p>
                          <p>
                            <strong>Food Sources:</strong> {nutrient.sources}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dashboard Grid */}
          <div className={styles.dashboardGrid}>
            <aside className={styles.sidebarColumn}>
              {/* Calorie Calculator */}
              <section
                className={`${styles.card} ${styles.interactiveCard} ${styles.calculatorSection}`}
              >
                <h2>Calculate Target</h2>
                <p className={styles.calcDesc}>
                  Enter your details to generate personalized targets.
                </p>

                <form className={styles.calcForm} onSubmit={handleCalcSubmit}>
                  {/* Unit Toggle */}
                  <div className={styles.unitToggle}>
                    <input
                      type="radio"
                      id="unit-metric"
                      name="unit-type"
                      value="metric"
                      checked={unit === "metric"}
                      onChange={() => setUnit("metric")}
                    />
                    <label htmlFor="unit-metric" className={styles.toggleBtn}>
                      Metric
                    </label>

                    <input
                      type="radio"
                      id="unit-imperial"
                      name="unit-type"
                      value="imperial"
                      checked={unit === "imperial"}
                      onChange={() => setUnit("imperial")}
                    />
                    <label htmlFor="unit-imperial" className={styles.toggleBtn}>
                      Imperial
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      {unit === "metric" ? "Weight (kg)" : "Weight (lbs)"}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      step="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Primary Goal</label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={calcGoal}
                        onChange={(e) => setCalcGoal(e.target.value)}
                        required
                      >
                        <option value="lose">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain">Build Muscle</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      {unit === "metric" ? "Height (cm)" : "Height"}
                    </label>
                    {unit === "metric" ? (
                      <input
                        type="number"
                        placeholder="e.g. 175"
                        value={calcHeightCm}
                        onChange={(e) => setCalcHeightCm(e.target.value)}
                        required
                      />
                    ) : (
                      <div className={styles.imperialHeightInputs}>
                        <input
                          type="number"
                          placeholder="ft"
                          value={calcHeightFt}
                          onChange={(e) => setCalcHeightFt(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="in"
                          value={calcHeightIn}
                          onChange={(e) => setCalcHeightIn(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <button type="submit" className={styles.btnPrimary}>
                    Calculate
                  </button>
                </form>

                {calcResult !== null && (
                  <div className={styles.calcResult}>
                    <h4>Suggested Target</h4>
                    <div className={styles.resultValue}>
                      {calcResult.toLocaleString()} kcal
                    </div>
                    <button
                      className={styles.btnSecondary}
                      onClick={handleApplyTarget}
                    >
                      {applySuccess ? "Applied!" : "Apply to Dashboard"}
                    </button>
                  </div>
                )}
              </section>

              {/* Hydration Tracker */}
              <section className={`${styles.card} ${styles.hydrationSection}`}>
                <div className={styles.hydrationHeader}>
                  <h2>Hydration</h2>
                  <WaterIcon />
                </div>
                <div className={styles.hydrationTracker}>
                  <div className={styles.glassContainer}>
                    {Array.from({ length: TOTAL_GLASSES }).map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.glass} ${index < filledGlasses ? styles.active : ""}`}
                        onClick={() => handleGlassClick(index)}
                        aria-label={`Glass ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className={styles.hydrationStatus}>
                    {filledGlasses} / {TOTAL_GLASSES} glasses (
                    {filledGlasses * 250}ml)
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NutritionPage;
