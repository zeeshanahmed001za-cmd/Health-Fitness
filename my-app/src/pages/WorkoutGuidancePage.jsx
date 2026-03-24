import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useDocumentTitle from '../hooks/useDocumentTitle';

import dashStyles from '../styles/Dashboard.module.css';
import pageStyles from '../styles/WorkoutGuidancePage.module.css';

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
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
);
const WaterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    </svg>
);
const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
        <path d="M12 9v4"></path>
        <path d="M12 16v.01"></path>
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const DumbbellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20h2M11 4h2M5 8v8M19 8v8"></path>
    </svg>
);
const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
    </svg>
);

function WorkoutGuidancePage() {
    useDocumentTitle('Workout Guidance');
    // Sidebar state

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Handlers
    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen(prev => !prev);
        } else {
            setSidebarCollapsed(prev => !prev);
        }
    };

    const avatarFallback = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                activePage="workouts"
                isCollapsed={sidebarCollapsed}
                isMobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className={dashStyles.mainWrapper}>
                <header className={dashStyles.topNavbar}>
                    <div className={dashStyles.navLeft}>
                        <button className={dashStyles.toggleSidebarBtn} onClick={handleSidebarToggle} aria-label="Toggle Sidebar">
                            <HamburgerIcon />
                        </button>
                        <h1 className={dashStyles.pageTitle}>Workout Guidance</h1>
                    </div>
                    <div className={dashStyles.navRight}>
                        <Link to="/workouts" className={pageStyles.backBtn}>
                            <BackIcon />
                            <span>Back to Workout</span>
                        </Link>
                        <Link to="/profile" className={dashStyles.profileDropdownBtn}>
                            <div className={dashStyles.profileAvatar}>
                                <img src="../assets/images/avatar-placeholder.png" alt="User Avatar"
                                    onError={e => { e.target.src = avatarFallback; }} />
                            </div>
                        </Link>
                    </div>
                </header>

                <main className={pageStyles.dashboardContent}>
                    <section className={pageStyles.guidanceHero}>
                        <div className={pageStyles.heroContent}>
                            <h2>Master Your Routine</h2>
                            <p>Science-backed tips to maximize your performance, prevent injury, and see results faster.</p>
                        </div>
                    </section>

                    <div className={pageStyles.guidanceGrid}>
                        {/* Principles */}
                        <article className={pageStyles.guidanceCard}>
                            <div className={`${pageStyles.cardIcon} ${pageStyles.gold}`}><StarIcon /></div>
                            <h3>Core Training Principles</h3>
                            <ul>
                                <li><strong>Progressive Overload:</strong> Gradually increase weight or reps every week to keep muscles growing.</li>
                                <li><strong>Form Over Weight:</strong> Never sacrifice technique for heavier loads. Bad form leads to injuries.</li>
                                <li><strong>Consistency:</strong> Showing up is 80% of the battle. Stick to your split!</li>
                            </ul>
                        </article>

                        {/* Stretching */}
                        <article className={pageStyles.guidanceCard}>
                            <div className={`${pageStyles.cardIcon} ${pageStyles.cyan}`}><WaterIcon /></div>
                            <h3>The Art of Stretching</h3>
                            <div className={pageStyles.subSection}>
                                <h4>Pre-Workout (Dynamic)</h4>
                                <p>Focus on movement: Arm circles, leg swings, cat-cow. Goal is mobility and blood flow.</p>
                            </div>
                            <div className={pageStyles.subSection}>
                                <h4>Post-Workout (Static)</h4>
                                <p>Focus on holding: Hamstring stretch, chest opener. Hold for 30-45s to aid recovery.</p>
                            </div>
                        </article>

                        {/* Breathing */}
                        <article className={pageStyles.guidanceCard}>
                            <div className={`${pageStyles.cardIcon} ${pageStyles.purple}`}><BrainIcon /></div>
                            <h3>Breathing & Bracing</h3>
                            <p>Breath is the foundation of power. Use the <strong>Valsalva Maneuver</strong> for heavy lifts:</p>
                            <ol>
                                <li>Inhale deeply into your belly.</li>
                                <li>Exert force (the "push") while holding breath or exhaling slowly.</li>
                                <li>Never hold your breath until you feel dizzy.</li>
                            </ol>
                        </article>

                        {/* Rest */}
                        <article className={pageStyles.guidanceCard}>
                            <div className={`${pageStyles.cardIcon} ${pageStyles.green}`}><CalendarIcon /></div>
                            <h3>Recovery & Sleep</h3>
                            <p>Muscles don't grow in the gym; they grow while you sleep.</p>
                            <ul>
                                <li><strong>Sleep:</strong> Aim for 7-9 hours of quality rest.</li>
                                <li><strong>Rest Days:</strong> At least 1-2 days of active recovery per week.</li>
                                <li><strong>Hydration:</strong> Drink 3-4 liters of water daily.</li>
                            </ul>
                        </article>
                    </div>

                    <section className={pageStyles.splitIntensitySection}>
                        <div className={pageStyles.guidanceGrid}>
                            {/* Splits */}
                            <article className={pageStyles.guidanceCard}>
                                <div className={`${pageStyles.cardIcon} ${pageStyles.blue}`}><DumbbellIcon /></div>
                                <h3>Popular Workout Splits</h3>
                                <div className={pageStyles.splitItem}>
                                    <h4>Push/Pull/Legs (PPL)</h4>
                                    <p>3-6 days/week. Focuses on movement patterns. Best for muscle growth.</p>
                                </div>
                                <div className={pageStyles.splitItem}>
                                    <h4>Upper/Lower Split</h4>
                                    <p>4 days/week. Balances frequency and recovery. Great for intermediate lifters.</p>
                                </div>
                                <div className={pageStyles.splitItem}>
                                    <h4>Full Body</h4>
                                    <p>3 days/week. Hits every muscle group in every session. Perfect for beginners.</p>
                                </div>
                            </article>

                            {/* Intensity */}
                            <article className={pageStyles.guidanceCard}>
                                <div className={`${pageStyles.cardIcon} ${pageStyles.red}`}><BoltIcon /></div>
                                <h3>Choosing Your Intensity</h3>
                                <div className={pageStyles.splitItem}>
                                    <h4>Beginner</h4>
                                    <p>Focus: Learning form. RPE 6-7 (Leaving 3-4 reps in the tank). 2-3 sets per exercise.</p>
                                </div>
                                <div className={pageStyles.splitItem}>
                                    <h4>Intermediate</h4>
                                    <p>Focus: Hypertrophy. RPE 8-9 (Leaving 1-2 reps in the tank). 3-4 sets per exercise.</p>
                                </div>
                                <div className={pageStyles.splitItem}>
                                    <h4>Advanced</h4>
                                    <p>Focus: Power & Detail. RPE 9.5-10 (Training to failure). Advanced techniques like drop sets.</p>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default WorkoutGuidancePage;
