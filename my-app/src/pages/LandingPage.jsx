import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

import styles from '../styles/LandingPage.module.css';
import weightLossImg from '../assets/images/weightLoss.jpg';
import muscleGainImg from '../assets/images/MuscleGain.jpg';
import generalFitnessImg from '../assets/images/generalFitness.jpg';
import aboutImg from '../assets/images/about1.jpg';
import siteLogo from '../assets/images/site.png';

const ArrowIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
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
            `.${styles.programCard}, .${styles.membershipCard}, .${styles.aboutRow}, .${styles.callToActionSection}`
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
                    <Link to="/" className={styles.logoText}>
                        <img src={siteLogo} alt="Logo" className={styles.siteLogoImg} />
                        <h1>Health & Fitness</h1>
                    </Link>
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
                    <div className={styles.heroText}>
                        <span>Transform Your Life<br />Through Fitness</span>
                        <p className={styles.subText}>
                            Everything you need to build a healthy lifestyle — structured workouts, expert meal
                            guidance, and continuous habit tracking — all in one place.
                        </p>
                    </div>
                    <button
                        className={styles.heroCtaBtn}
                        onClick={(e) => scrollToSection(e, 'membership')}
                    >
                        Explore Memberships
                        <ArrowIcon size={24} />
                    </button>
                </section>

                <div className={styles.additionalSections}>

                    {/* Programs Section */}
                    <section className={styles.programsSection} id="programs">
                        <h1>Our Core Programs</h1>
                        <div className={styles.programsContainer}>
                            <div className={styles.programCard}>
                                <img src={weightLossImg} alt="Weight Loss Program" />
                                <h3>Weight Loss</h3>
                                <p>Effective, science-backed strategies and HIIT workouts to help you shed unwanted
                                    pounds and achieve a leaner body sustainably.</p>
                            </div>
                            <div className={styles.programCard}>
                                <img src={muscleGainImg} alt="Muscle Gain Program" />
                                <h3>Muscle Gain</h3>
                                <p>Structured hypertrophy workout plans and macro-nutrient guidance to help you
                                    build muscle mass and raw strength effectively.</p>
                            </div>
                            <div className={styles.programCard}>
                                <img src={generalFitnessImg} alt="General Fitness Program" />
                                <h3>General Fitness</h3>
                                <p>A balanced approach including functional cardio, mobility training, and
                                    flexibility exercises for total longevity and well-being.</p>
                            </div>
                        </div>
                    </section>

                    {/* Membership Section */}
                    <section className={styles.membershipSection} id="membership">
                        <span className={styles.memLabel}>Memberships</span>
                        <p className={styles.memSubText}>Choose your fitness journey</p>

                        <ul className={styles.membershipFeatureList}>
                            <li>Access to personalized workout plans tailored to your fitness level.</li>
                            <li>Comprehensive meal plans designed by certified nutritionists.</li>
                            <li>Advanced progress tracking tools to monitor your improvements.</li>
                            <li>Exclusive access to our supportive, private community.</li>
                        </ul>

                        <div className={styles.membershipCards}>
                            <div className={styles.membershipCard}>
                                <h3>Basic</h3>
                                <p>$9.99<span className={styles.perMonth}>/mo</span></p>
                                <ul>
                                    <li>Access to basic workout plans</li>
                                    <li>Standard meal templates</li>
                                    <li>Basic progress tracking</li>
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
                                <ul>
                                    <li>Access to ALL workout plans</li>
                                    <li>Customized weekly meal plans</li>
                                    <li>Advanced analytics tracking</li>
                                    <li>Exclusive community access</li>
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
                                <ul>
                                    <li>All Premium features</li>
                                    <li>1-on-1 coaching sessions</li>
                                    <li>Monthly live Q&A events</li>
                                    <li>Priority 24/7 support</li>
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