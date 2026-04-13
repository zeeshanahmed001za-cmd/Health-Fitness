import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Shield, FileText, Lock } from "lucide-react";
import styles from "../styles/TermsPage.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

const TermsPage = () => {
  useDocumentTitle("Terms & Conditions | Health&Fitness");

  return (
    <div className={styles.termsWrapper}>
      {/* Background Decor */}
      <div className={styles.glow} />
      
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.backButtonWrapper}
        >
          <Link to="/" className={styles.backButton}>
            <ChevronLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <header className={styles.header}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={styles.iconCircle}
          >
            <Shield size={32} className={styles.mainIcon} />
          </motion.div>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.updatedDate}>Last updated: April 13, 2026</p>
        </header>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.contentCard}
        >
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <FileText size={20} className={styles.sectionIcon} />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing or using Health&Fitness, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Lock size={20} className={styles.sectionIcon} />
              <h2>2. Privacy & Data</h2>
            </div>
            <p>
              Your privacy is important to us. We collect data such as your weight, height, nutrition logs, and workout history to provide personalized insights. All data is stored securely and is not shared with third parties without your explicit consent.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Shield size={20} className={styles.sectionIcon} />
              <h2>3. Health & Safety Disclaimer</h2>
            </div>
            <p>
              Health&Fitness is an informational tool and is not a substitute for professional medical advice. Always consult with a physician before starting any new exercise or nutrition program. You agree that any participation in physical activity is at your own risk.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <FileText size={20} className={styles.sectionIcon} />
              <h2>4. Account Responsibilities</h2>
            </div>
            <p>
              You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Shield size={20} className={styles.sectionIcon} />
              <h2>5. Limitation of Liability</h2>
            </div>
            <p>
              Health&Fitness shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or your participation in any fitness activities logged on the platform.
            </p>
          </section>

          <footer className={styles.termsFooter}>
            <p>Questions? Contact us at support@healthfitness.com</p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
