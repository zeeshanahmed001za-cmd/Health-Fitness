import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/LandingPage.module.css";

import siteLogo from "../assets/images/site.png";
import FeatureShowcase from "../components/FeatureShowcase/FeatureShowcase";

const ArrowIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TargetIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const UtensilsIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
    <path d="M7 2v20"></path>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
  </svg>
);

const CalendarIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const GridIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ActivityIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const RouteIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="19" r="3"></circle>
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path>
    <circle cx="18" cy="5" r="3"></circle>
  </svg>
);

const TrendingUpIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const UsersIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const WatchIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7"></circle>
    <polyline points="12 9 12 12 13.5 13.5"></polyline>
    <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path>
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GithubIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeInUp 1s ease forwards";
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      `.${styles.programPathCard}, .${styles.valueBlock}, .${styles.callToActionSection}`,
    );
    animatedElements.forEach((el) => {
      el.style.opacity = "0";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll handler
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const offsetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.pageBody}>
      {/* Navbar */}
      <header>
        <nav className={`${styles.navBar} ${scrolled ? styles.scrolled : ""}`}>
          <Link to="/" className={styles.logoText}>
            <h1>Health & Fitness</h1>
          </Link>
          <ul className={styles.navBarOptions}>
            <li>
              <a href="#home" onClick={(e) => scrollToSection(e, "home")}>
                Home
              </a>
            </li>
            <li>
              <a
                href="#programs"
                onClick={(e) => scrollToSection(e, "programs")}
              >
                Programs
              </a>
            </li>
            <li>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
              >
                Features
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
                About
              </a>
            </li>
            <li>
              <Link to="/onboarding" className={styles.navCta}>
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className={styles.heroSection} id="home">
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeadline}>
              Stop guessing. <br />
              <span className={styles.highlightText}>Start tracking.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Take complete control of your fitness journey. Log your workouts,
              hit your macro targets, and let precise data drive your real-world
              results.
            </p>

            <div className={styles.featureBadges}>
              <span className={styles.badge}>Calorie Tracking</span>
              <span className={styles.badge}>Macro Logging</span>
              <span className={styles.badge}>Workout Plans</span>
              <span className={styles.badge}>Progress Analytics</span>
            </div>

            <div className={styles.heroActions}>
              <Link to="/onboarding" className={styles.primaryCta}>
                Start Tracking Free
              </Link>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
                className={styles.secondaryCta}
              >
                Learn Features <ArrowIcon size={20} />
              </a>
            </div>
          </div>
        </section>

        <div className={styles.additionalSections}>
          {/* Programs Section */}
          <section className={styles.programsSection} id="programs">
            <div className={styles.sectionHeader}>
              <h2>Core Capabilities</h2>
              <p>
                Transform your ambition into tangible results with science-backed
                protocols designed for your unique evolution.
              </p>
            </div>
            <div className={styles.programsContainer}>
              <div className={styles.programPathCard}>
                <div className={styles.programIconWrapper}>
                  <TargetIcon size={28} />
                </div>
                <h3>Strength Training</h3>
                <p className={styles.programDesc}>
                  Build muscle effectively with guided workouts and advanced
                  progress tracking.
                </p>
                <ul className={styles.programFeatures}>
                  <li>Interactive workout logger</li>
                  <li>Exercise technique library</li>
                  <li>Volume & progressive overload metrics</li>
                </ul>
                <Link to="/onboarding" className={styles.programAction}>
                  Start Program <ArrowIcon size={16} />
                </Link>
              </div>

              <div className={styles.programPathCard}>
                <div className={styles.programIconWrapper}>
                  <UtensilsIcon size={28} />
                </div>
                <h3>Nutrition Tracking</h3>
                <p className={styles.programDesc}>
                  Take control of your diet with precise calorie and macro
                  monitoring.
                </p>
                <ul className={styles.programFeatures}>
                  <li>Daily macro breakdown</li>
                  <li>Extensive food database</li>
                  <li>Personalized calorie goals</li>
                </ul>
                <Link to="/onboarding" className={styles.programAction}>
                  Start Program <ArrowIcon size={16} />
                </Link>
              </div>

              <div className={styles.programPathCard}>
                <div className={styles.programIconWrapper}>
                  <CalendarIcon size={28} />
                </div>
                <h3>Workout Planning</h3>
                <p className={styles.programDesc}>
                  Design structured routines aligned with your goals and
                  performance insights.
                </p>
                <ul className={styles.programFeatures}>
                  <li>Custom routine builder</li>
                  <li>Calendar scheduling</li>
                  <li>Performance analytics dashboard</li>
                </ul>
                <Link to="/onboarding" className={styles.programAction}>
                  Start Program <ArrowIcon size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Feature Showcase Section */}
          <FeatureShowcase />

          {/* Why Choose Us Section */}
          <section className={styles.whySection} id="about">
            <div className={styles.whyHeader}>
              <h2>Why Health & Fitness?</h2>
              <p>
                Most fitness apps give you a single piece of the puzzle. We give
                you the entire ecosystem—unifying your diet, workouts, and
                progress in one place.
              </p>
            </div>

            <div className={styles.valueBlocksContainer}>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <GridIcon />
                </div>
                <h4>Unified Platform</h4>
                <p>
                  Manage your workouts, nutrition, and metrics within a single,
                  seamless application.
                </p>
              </div>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <ActivityIcon />
                </div>
                <h4>Smart Tracking</h4>
                <p>
                  Log calories, track macros, and monitor daily performance
                  without friction.
                </p>
              </div>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <RouteIcon />
                </div>
                <h4>Structured Programs</h4>
                <p>
                  Follow guided, science-backed paths instead of guessing your
                  next workout.
                </p>
              </div>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <TrendingUpIcon />
                </div>
                <h4>Real Progress</h4>
                <p>
                  Visualize your continuous improvement over time with detailed,
                  clear analytics.
                </p>
              </div>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <UsersIcon />
                </div>
                <h4>Active Community</h4>
                <p>
                  Surround yourself with a supportive network sharing tips,
                  routines, and motivation.
                </p>
              </div>
              <div className={styles.valueBlock}>
                <div className={styles.valueIcon}>
                  <WatchIcon />
                </div>
                <h4>Device Syncing</h4>
                <p>
                  Seamlessly connect with your favorite wearables to import
                  activity data automatically.
                </p>
              </div>
            </div>
          </section>

          {/* Call To Action Section */}
          <section className={styles.callToActionSection} id="getStarted">
            <h1>Ready to Transform Your Health?</h1>
            <p>
              Join our community today. With our expert guidance and
              comprehensive programs, achieving your dream physique and mental
              clarity is entirely within reach.
            </p>
            <Link to="/onboarding" className={styles.ctaBtn}>
              Start Your Journey
              <ArrowIcon size={24} />
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            {/* Brand Area */}
            <div className={styles.footerBrand}>
              <Link to="/" className={styles.footerLogo}>
                <img src={siteLogo} alt="Health & Fitness Logo" />
                <span>Health & Fitness</span>
              </Link>
              <p className={styles.footerDescription}>
                All-in-one fitness tracking and program management platform.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">
                  <FacebookIcon size={20} />
                </a>
                <a href="#" aria-label="Instagram">
                  <InstagramIcon size={20} />
                </a>
                <a href="#" aria-label="GitHub">
                  <GithubIcon size={20} />
                </a>
              </div>
            </div>

            {/* Navigation Groups */}
            <div className={styles.footerNav}>
              <div className={styles.navColumn}>
                <h3>Product</h3>
                <ul>
                  <li>
                    <a
                      href="#programs"
                      onClick={(e) => scrollToSection(e, "programs")}
                    >
                      Programs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#features"
                      onClick={(e) => scrollToSection(e, "features")}
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <Link to="/onboarding">Nutrition Tracking</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.navColumn}>
                <h3>Company</h3>
                <ul>
                  <li>
                    <a
                      href="#about"
                      onClick={(e) => scrollToSection(e, "about")}
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <Link to="#">Contact</Link>
                  </li>
                  <li>
                    <Link to="#">FAQ</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.navColumn}>
                <h3>Resources</h3>
                <ul>
                  <li>
                    <Link to="#">Guides</Link>
                  </li>
                  <li>
                    <Link to="#">Support</Link>
                  </li>
                  <li>
                    <Link to="#">Community</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Area */}
          <div className={styles.footerBottomUnified}>
            <p>
              &copy; 2026 Health & Fitness. All rights reserved.
              <span className={styles.legalSeparator}>|</span>
              <Link to="/terms">Privacy Policy</Link>
              <span className={styles.legalSeparator}>|</span>
              <Link to="/terms">Terms and Conditions</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
