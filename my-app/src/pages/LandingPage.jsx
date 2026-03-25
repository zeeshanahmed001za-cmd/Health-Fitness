import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

import styles from '../styles/LandingPage.module.css';

import aboutImg from '../assets/images/about1.jpg';
import siteLogo from '../assets/images/site.png';

const ArrowIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TargetIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);

const UtensilsIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
        <path d="M7 2v20"></path>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
    </svg>
);

const CalendarIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const CheckIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

function LandingPage() {
    const [scrolled, setScrolled] = useState(false);


    // Navbar scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for fade-in animations
    useEffect(() => {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease forwards';
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(
            `.${styles.programPathCard}, .${styles.membershipCard}, .${styles.aboutRow}, .${styles.callToActionSection}`
        );
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Smooth scroll handler
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (target) {
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.pageBody}>
            {/* Navbar */}
            <header>
                <nav className={`${styles.navBar} ${scrolled ? styles.scrolled : ''}`}>
                    <Link to="/" className={styles.logoText}><h1>Health & Fitness</h1></Link>
                    <ul className={styles.navBarOptions}>
                        <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a></li>
                        <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Programs</a></li>
                        <li><a href="#membership" onClick={(e) => scrollToSection(e, 'membership')}>Membership</a></li>
                        <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a></li>
                        <li><Link to="/onboarding" className={styles.navCta}>Get Started</Link></li>
                    </ul>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className={styles.heroSection} id="home">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroHeadline}>
                            Master Your Health with <br/> 
                            <span className={styles.highlightText}>All-in-One Tracking</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            The ultimate platform to track your macros, follow expert workout plans, and analyze your progress—all built to help you reach your goals faster.
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
                            <a href="#membership" onClick={(e) => scrollToSection(e, 'membership')} className={styles.secondaryCta}>
                                View Memberships <ArrowIcon size={20} />
                            </a>
                        </div>
                    </div>
                </section>

                <div className={styles.additionalSections}>

                    {/* Programs Section */}
                    <section className={styles.programsSection} id="programs">
                        <div className={styles.sectionHeader}>
                            <h2>Core Capabilities</h2>
                            <p>Everything you need to track, plan, and optimize your fitness journey.</p>
                        </div>
                        <div className={styles.programsContainer}>
                            <div className={styles.programPathCard}>
                                <div className={styles.programIconWrapper}>
                                    <TargetIcon size={28} />
                                </div>
                                <h3>Strength Training</h3>
                                <p className={styles.programDesc}>Build muscle effectively with guided workouts and advanced progress tracking.</p>
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
                                <p className={styles.programDesc}>Take control of your diet with precise calorie and macro monitoring.</p>
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
                                <p className={styles.programDesc}>Design structured routines aligned with your goals and performance insights.</p>
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

                    {/* Membership Section */}
                    <section className={styles.membershipSection} id="membership">
                        <div className={styles.sectionHeader}>
                            <h2>Flexible Memberships</h2>
                            <p>Choose the plan that fits your goals and get immediate access to our ecosystem.</p>
                        </div>

                        <div className={styles.membershipSummaryBox}>
                            <div className={styles.summaryContent}>
                                <h3>Unlock your full potential</h3>
                                <p>Get the guidance you need to succeed with science-backed routines, verified nutrition experts, and a community that supports your journey.</p>
                            </div>
                            <div className={styles.summaryStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>10k+</span>
                                    <span className={styles.statLabel}>Active Members</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>95%</span>
                                    <span className={styles.statLabel}>Success Rate</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.membershipCards}>
                            <div className={styles.membershipCard}>
                                <h3>Basic</h3>
                                <p>$9.99<span className={styles.perMonth}>/mo</span></p>
                                <ul className={styles.cardFeatureList}>
                                    <li><CheckIcon size={16} /> Basic workout plans</li>
                                    <li><CheckIcon size={16} /> Standard meal templates</li>
                                    <li><CheckIcon size={16} /> Progress tracking</li>
                                </ul>
                                <Link to="/onboarding" className={styles.membershipCtaLink}>
                                    <button className={styles.membershipCtaBtn}>
                                        Get Basic <ArrowIcon size={20} />
                                    </button>
                                </Link>
                            </div>

                            <div className={styles.membershipCard}>
                                <h3>Premium</h3>
                                <p>$19.99<span className={styles.perMonth}>/mo</span></p>
                                <ul className={styles.cardFeatureList}>
                                    <li><CheckIcon size={16} /> All workout plans</li>
                                    <li><CheckIcon size={16} /> Custom meal plans</li>
                                    <li><CheckIcon size={16} /> Advanced analytics</li>
                                    <li><CheckIcon size={16} /> Community access</li>
                                </ul>
                                <Link to="/onboarding" className={styles.membershipCtaLink}>
                                    <button className={styles.membershipCtaBtn}>
                                        Go Premium <ArrowIcon size={20} />
                                    </button>
                                </Link>
                            </div>

                            <div className={styles.membershipCard}>
                                <h3>Elite</h3>
                                <p>$39.99<span className={styles.perMonth}>/mo</span></p>
                                <ul className={styles.cardFeatureList}>
                                    <li><CheckIcon size={16} /> All Premium features</li>
                                    <li><CheckIcon size={16} /> 1-on-1 coaching</li>
                                    <li><CheckIcon size={16} /> Monthly live Q&A</li>
                                    <li><CheckIcon size={16} /> Priority 24/7 support</li>
                                </ul>
                                <Link to="/onboarding" className={styles.membershipCtaLink}>
                                    <button className={styles.membershipCtaBtn}>
                                        Get Elite <ArrowIcon size={20} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section className={styles.aboutSection} id="about">
                        <h1>Our Mission</h1>
                        <p>At Health & Fitness, we are dedicated to helping individuals of all fitness levels
                            achieve their health goals. Our mission is to provide accessible, scientifically-backed,
                            and effective fitness solutions.</p>

                        <div className={styles.aboutRow}>
                            <img src={aboutImg} alt="About Us Team" />
                            <div className={styles.aboutPara}>
                                <p>Our team of experienced fitness professionals is passionate about creating
                                    personalized workout plans and meal guidance that cater to your unique needs.</p>
                                <br />
                                <p>We believe that fitness should be sustainable and empowering. That's why we focus
                                    on building healthy, long-term habits and fostering a supportive community where
                                    everyone can thrive.</p>
                            </div>
                        </div>
                    </section>

                    {/* Call To Action Section */}
                    <section className={styles.callToActionSection} id="getStarted">
                        <h1>Ready to Transform Your Health?</h1>
                        <p>Join our community today. With our expert guidance and comprehensive programs,
                            achieving your dream physique and mental clarity is entirely within reach.</p>
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
                    <div className={styles.innerContainer}>
                        <div className={styles.footerLogo}>
                            <Link to="/"><img src={siteLogo} alt="Health & Fitness Logo" /></Link>
                            <span>Health & Fitness</span>
                        </div>
                        <div className={styles.quickLinks}>
                            <h2>Quick Links</h2>
                            <ul>
                                <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a></li>
                                <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Programs</a></li>
                                <li><a href="#membership" onClick={(e) => scrollToSection(e, 'membership')}>Pricing</a></li>
                                <li><Link to="/login">Member Login</Link></li>
                            </ul>
                        </div>
                        <div className={styles.programs}>
                            <h2>Our Focus</h2>
                            <ul>
                                <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Weight Loss</a></li>
                                <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Muscle Gain</a></li>
                                <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Functional Fitness</a></li>
                                <li><a href="#programs" onClick={(e) => scrollToSection(e, 'programs')}>Mobility</a></li>
                            </ul>
                        </div>
                        <div className={styles.contacts}>
                            <h2>Contact Us</h2>
                            <p>contact@healthfitness.com</p>
                            <p>Phone: +1 (555) 123-4567</p>
                            <p>Location: New York, USA</p>
                        </div>
                    </div>
                    <div className={styles.copyrights}>
                        <p>&copy; 2026 Health & Fitness. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;