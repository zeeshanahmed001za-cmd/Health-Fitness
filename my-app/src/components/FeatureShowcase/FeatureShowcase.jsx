import { motion } from "framer-motion";
import { Check } from "lucide-react";
import styles from "./FeatureShowcase.module.css";

// Import screenshots
import nutritionImg from "../../assets/images/nutrition-app.png";
import dashboardImg from "../../assets/images/dashboard-app.png";
import progressImg from "../../assets/images/progress-app.png";
import workoutsImg from "../../assets/images/workouts-app.png";

const featureData = [
  {
    id: 1,
    title: "Personalized Dashboard",
    description:
      "A unified view of your entire fitness journey. Access all your critical health data and daily performance metrics in one elegant interface.",
    benefits: [
      "Daily overview panels",
      "Goal-based metric cards",
      "Clean, modern analytics view",
    ],
    image: dashboardImg,
    reverse: false,
    hasAlternateBg: false,
  },
  {
    id: 2,
    title: "Smart Nutrition Tracking",
    description:
      "Take control of your diet with our intelligent food logging system. Monitor every calorie and macro with precision to reach your goals faster.",
    benefits: [
      "Real-time calorie tracking",
      "Macro-nutrient breakdown",
      "Understanding nutrient density",
    ],
    image: nutritionImg,
    reverse: true,
    hasAlternateBg: false,
  },
  {
    id: 3,
    title: "Comprehensive Workout Logs",
    description:
      "Efficiently log your daily exercises and monitor your intensity. Keep track of every set, rep, and calorie burned during your sessions.",
    benefits: [
      "Intuitive exercise logger",
      "Intensity level monitoring",
      "Pre-workout guidance integration",
    ],
    image: workoutsImg,
    reverse: false,
    hasAlternateBg: false,
  },
  {
    id: 4,
    title: "Goal-Based Progress System",
    description:
      "Set your targets and see exactly how you're tracking towards them. Whether it's muscle gain or weight loss, we visualize your path to success.",
    benefits: [
      "Weight loss or muscle gain goals",
      "Dynamic progress visualization",
      "Historical data transformation",
    ],
    image: progressImg,
    reverse: true,
    hasAlternateBg: false,
  },
];

const FeatureBlock = ({ feature }) => {
  const { title, description, benefits, image, reverse, hasAlternateBg } = feature;

  return (
    <section className={`${styles.showcaseSection} ${hasAlternateBg ? styles.alternateBg : ""}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.featureBlock}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ flexDirection: reverse ? "row-reverse" : "row" }}
        >
          <div className={styles.featureImageWrapper}>
            <div className={styles.imageContainer}>
              <img src={image} alt={title} className={styles.screenshot} />
            </div>
          </div>

          <div className={styles.featureContent}>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDescription}>{description}</p>
            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <div className={styles.checkIconWrapper}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureShowcase = () => {
  return (
    <div id="features">
      <section className={styles.showcaseSection} style={{ paddingBottom: 0 }}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Features</h2>
          </motion.div>
        </div>
      </section>

      {featureData.map((feature) => (
        <FeatureBlock key={feature.id} feature={feature} />
      ))}
    </div>
  );
};

export default FeatureShowcase;
