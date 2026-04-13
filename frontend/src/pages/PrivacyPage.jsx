import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, Shield, Eye, Database, Server, Smartphone, UserCheck } from "lucide-react";
import styles from "../styles/TermsPage.module.css"; // Reuse the same premium styles
import useDocumentTitle from "../hooks/useDocumentTitle";

const PrivacyPage = () => {
  useDocumentTitle("Privacy Policy | Health&Fitness");

  return (
    <div className={styles.termsWrapper}>
      <div className={styles.glow} />
      
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <Lock size={32} className={styles.mainIcon} />
          </motion.div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updatedDate}>Our commitment to your data security • Last updated: April 13, 2026</p>
        </header>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.contentCard}
        >
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Eye size={20} className={styles.sectionIcon} />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              To provide a personalized fitness experience, we collect biometric data (weight, height), activity logs (workouts, exercises), and nutritional data (food, water). We also collect basic account info such as your name and email.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Shield size={20} className={styles.sectionIcon} />
              <h2>2. Data Isolation (The Vault)</h2>
            </div>
            <p>
              We implement strict account-level data isolation. Your local session is protected by user-specific encryption keys. This ensures that even on shared devices, your data remains in a private "Vault" inaccessible to other accounts.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Database size={20} className={styles.sectionIcon} />
              <h2>3. Storage & Security</h2>
            </div>
            <p>
              Your data is synchronized with our secure MongoDB database. We use industry-standard SSL/TLS encryption for all data transfers between your device and our servers.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Server size={20} className={styles.sectionIcon} />
              <h2>4. How We Use Data</h2>
            </div>
            <p>
              We use your data exclusively to calculate macro targets, monitor fitness trends, and provide progress analytics. We do not sell your personal data to advertisers or third parties.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Smartphone size={20} className={styles.sectionIcon} />
              <h2>5. Local Session Management</h2>
            </div>
            <p>
              We use localStorage to keep your session fluid. When you log out, we provide options to purge this local cache while keeping your primary cloud-based account data safe.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <UserCheck size={20} className={styles.sectionIcon} />
              <h2>6. Your Rights</h2>
            </div>
            <p>
              You have the right to export your data or request complete account deletion at any time. For such requests, please contact our privacy compliance team.
            </p>
          </section>

          <footer className={styles.termsFooter}>
            <p>© 2026 Health&Fitness Privacy Team • legal@healthfitness.com</p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
