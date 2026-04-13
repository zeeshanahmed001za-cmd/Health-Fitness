import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Shield, FileText, Lock, AlertTriangle, 
  Globe, CreditCard, Users, Zap, RefreshCw, 
  Clock, Trash2, Mail, ExternalLink, Scale
} from "lucide-react";
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
          <h1 className={styles.title}>Legal Framework</h1>
          <p className={styles.updatedDate}>Comprehensive Terms & Conditions • Last updated: April 13, 2026</p>
        </header>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.contentCard}
        >
          {/* 1. Agreement */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <FileText size={20} className={styles.sectionIcon} />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing or using Health&Fitness, you agree to be bound by these Terms and Conditions. This agreement constitutes a legally binding contract between you and the Health&Fitness platform.
            </p>
          </section>

          {/* 2. Privacy */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Lock size={20} className={styles.sectionIcon} />
              <h2>2. Privacy & Data Integrity</h2>
            </div>
            <p>
              Your health journey is personal. We collect biometric data (weight, height) and logs solely for the purpose of personalizing your experience. We utilize user-specific encryption to ensure data isolation.
            </p>
          </section>

          {/* 3. Health & Safety */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <AlertTriangle size={20} className={styles.sectionIcon} />
              <h2>3. Medical Disclaimer</h2>
            </div>
            <p>
              Health&Fitness is not a medical organization. Our workouts and nutrition guidance are for informational purposes only. You must obtain professional medical clearance before starting a fitness regimen.
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Zap size={20} className={styles.sectionIcon} />
              <h2>4. Intellectual Property Rights</h2>
            </div>
            <p>
              All software, designs, logos, and UI elements are the exclusive property of Health&Fitness. You are granted a limited, non-transferable license to use the app for personal, non-commercial use.
            </p>
          </section>

          {/* 5. Limitation of Liability */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Scale size={20} className={styles.sectionIcon} />
              <h2>5. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted by law, Health&Fitness shall not be liable for any direct, indirect, or consequential injuries or losses arising from your use of the platform.
            </p>
          </section>

          {/* 6. Prohibited Activities */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Trash2 size={20} className={styles.sectionIcon} />
              <h2>6. Prohibited Activities</h2>
            </div>
            <p>
              You agree not to reverse-engineer the application, bypass security protocols, or use the service for any illegal or unauthorized purpose, including data scraping.
            </p>
          </section>

          {/* 7. Third-Party Integration */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <ExternalLink size={20} className={styles.sectionIcon} />
              <h2>7. Third-Party Links</h2>
            </div>
            <p>
              Our service may contain links to third-party websites or services (e.g., fitness wearables). We are not responsible for the content, privacy policies, or practices of any third parties.
            </p>
          </section>

          {/* 8. Service Modifications */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <RefreshCw size={20} className={styles.sectionIcon} />
              <h2>8. Right to Modify Service</h2>
            </div>
            <p>
              We reserve the right to withdraw or amend the service and any feature we provide without notice. We will not be liable if all or any part of the service is unavailable at any time.
            </p>
          </section>

          {/* 9. Account Security */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Users size={20} className={styles.sectionIcon} />
              <h2>9. Account Responsibility</h2>
            </div>
            <p>
              Users are responsible for safeguarding their login credentials. We are not responsible for any data loss resulting from unauthorized account access due to user negligence.
            </p>
          </section>

          {/* 10. Community Standards */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Globe size={20} className={styles.sectionIcon} />
              <h2>10. Global Community Standards</h2>
            </div>
            <p>
              Users must respect others within the Health&Fitness ecosystem. Harassment, hate speech, or inappropriate content in support or community channels is strictly prohibited.
            </p>
          </section>

          {/* 11. Termination */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Clock size={20} className={styles.sectionIcon} />
              <h2>11. Access Termination</h2>
            </div>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Scale size={20} className={styles.sectionIcon} />
              <h2>12. Governing Law</h2>
            </div>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is registered, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 13. Warranties */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <AlertTriangle size={20} className={styles.sectionIcon} />
              <h2>13. "As Is" Disclaimer</h2>
            </div>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. Health&Fitness makes no warranties, expressed or implied, regarding the accuracy or reliability of the platform.
            </p>
          </section>

          {/* 14. Subscription Terms */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <CreditCard size={20} className={styles.sectionIcon} />
              <h2>14. Subscriptions & Billing</h2>
            </div>
            <p>
              Any paid features or subscriptions are non-refundable unless stated otherwise. We reserve the right to change our pricing structures with 30 days' notice.
            </p>
          </section>

          {/* 15. Contact */}
          <section className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Mail size={20} className={styles.sectionIcon} />
              <h2>15. Contact Information</h2>
            </div>
            <p>
              For any legal inquiries regarding these terms, please reach out to us at legal@healthfitness.com.
            </p>
          </section>

          <footer className={styles.termsFooter}>
            <p>© 2026 Health&Fitness. All rights reserved.</p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
