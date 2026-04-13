import { useState } from "react";
import { Link } from "react-router-dom";

import useDocumentTitle from "../hooks/useDocumentTitle";
import { useUser } from "../context/UserContext";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/NutritionGuidancePage.module.css";

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
      "Acts as a solvent and temperature regulator. Flushes waste, lubricates joints, aids in digestion.",
    sources: "Drinking water, water-rich fruits and vegetables, and teas.",
  },
];

// Icons
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function NutritionGuidancePage() {
  const { sidebarCollapsed, toggleSidebar } = useUser();
  useDocumentTitle("Nutrition Guidance");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedNutrients, setExpandedNutrients] = useState([]);



  const toggleNutrient = (id) => {
    setExpandedNutrients((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebar();
    }
  };

  const avatarFallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  return (
    <main className={styles.dashboardContent}>
      <header className={dashStyles.topNavbar}>
        <div className={dashStyles.navLeft}>
          <button
            className={dashStyles.toggleSidebarBtn}
            onClick={handleSidebarToggle}
            aria-label="Toggle Sidebar"
          >
            <HamburgerIcon />
          </button>
          <h1 className={dashStyles.pageTitle}>Nutrition Guidance</h1>
        </div>
        <div className={dashStyles.navRight}>
          <Link to="/nutrition" className={styles.backBtn}>
            <BackIcon />
            <span>Back to Nutrition</span>
          </Link>
          <Link to="/profile" className={dashStyles.profileDropdownBtn}>
            <div className={dashStyles.profileAvatar}>
              <img
                src="../assets/images/avatar-placeholder.png"
                alt="User Avatar"
                onError={(e) => {
                  e.target.src = avatarFallback;
                }}
              />
            </div>
          </Link>
        </div>
      </header>

      <div className={styles.contentInner}>
        <section className={styles.guidanceHero}>
          <div className={styles.heroContent}>
            <h2>Understanding Nutrients</h2>
            <p>
              Nutrients are chemical compounds in food that are crucial to human growth, 
              disease prevention, and overall health.
            </p>
          </div>
        </section>

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
              >
                <div className={styles.nutrientHeaderRow}>
                  <div className={styles.nutrientTitleGroup}>
                    <div>
                      <h3>{nutrient.title}</h3>
                      <span className={styles.nutrientType}>{nutrient.type}</span>
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
                        <strong>Importance & Function:</strong> {nutrient.importance}
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

        <section className={styles.tipsSection}>
          <h3 className={styles.categoryTitle}>Eating Guidelines</h3>
          <div className={styles.minimalGrid}>
            <div className={styles.miniCard}>
              <h4>Quality First</h4>
              <p>Prioritize whole foods over processed alternatives for better micronutrient density.</p>
            </div>
            <div className={styles.miniCard}>
              <h4>Timing</h4>
              <p>Distribute macro intake evenly throughout the day to support energy levels.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default NutritionGuidancePage;
