import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import dashStyles from '../styles/Dashboard.module.css';
import styles from '../styles/ProgressTracker.module.css';

// Icons
const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

function ProgressTracker() {
    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Data state
    const [onboardingData, setOnboardingData] = useState(() => {
        return JSON.parse(sessionStorage.getItem('onboardingData')) || 
               JSON.parse(localStorage.getItem('userSession')) || {};
    });
    const [loggedExercises] = useState(() => {
        return JSON.parse(localStorage.getItem('loggedExercises_grouped')) || [];
    });

    // Chart filter state
    const [chartFilter, setChartFilter] = useState('3M');
    const [chartOpacity, setChartOpacity] = useState(1);
    const [chartPath, setChartPath] = useState("M0,150 Q100,140 200,120 T400,100 T600,80 T800,70");

    // Modal state
    const [isModalActive, setIsModalActive] = useState(false);
    const [formData, setFormData] = useState({
        currentWeight: onboardingData.weightValue || '',
        bodyFat: onboardingData.bodyFat || '',
        waistSize: onboardingData.waistSize || ''
    });

    // Calculations
    const bmi = useMemo(() => {
        const { weightValue, heightValue, weightUnit, heightUnit } = onboardingData;
        if (!weightValue || !heightValue) return '--.-';
        
        let w = parseFloat(weightValue);
        let h = parseFloat(heightValue);
        
        if (weightUnit === 'imperial') w *= 0.453592;
        if (heightUnit === 'imperial') h *= 0.0254;
        else h /= 100;
        
        const b = w / (h * h);
        return b.toFixed(1);
    }, [onboardingData]);

    const bmiStatus = useMemo(() => {
        if (bmi === '--.-') return 'No Data';
        const b = parseFloat(bmi);
        if (b < 18.5) return 'Underweight';
        if (b < 25) return 'Healthy Range';
        if (b < 30) return 'Overweight';
        return 'Obese';
    }, [bmi]);

    const compEx = useMemo(() => loggedExercises.filter(e => e.completed).length, [loggedExercises]);
    const totalEx = loggedExercises.length || 15;
    const goalPercent = (compEx / totalEx) * 100;

    const bodyFat = onboardingData.bodyFat || 18.5;
    const radialOffset = 283 - (283 * (bodyFat / 100));

    const waistSize = onboardingData.waistSize || 82;
    const waistBarWidth = Math.min((waistSize / 120) * 100, 100);

    const consistency = Math.min(Math.round((compEx / 10) * 100), 100);

    // Handlers
    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen(prev => !prev);
        } else {
            setSidebarCollapsed(prev => !prev);
        }
    };

    const handleFilterChange = (filter) => {
        setChartFilter(filter);
        setChartOpacity(0.3);
        setTimeout(() => {
            setChartOpacity(1);
            const points = [150, 140, 120, 100, 80, 70].map(p => p + (Math.random() * 20 - 10));
            const d = `M0,${points[0]} Q100,${points[1]} 200,${points[2]} T400,${points[3]} T600,${points[4]} T800,${points[5]}`;
            setChartPath(d);
        }, 300);
    };

    const handleUpdateMetrics = () => {
        setFormData({
            currentWeight: onboardingData.weightValue || '',
            bodyFat: onboardingData.bodyFat || '',
            waistSize: onboardingData.waistSize || ''
        });
        setIsModalActive(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            ...onboardingData,
            weightValue: parseFloat(formData.currentWeight),
            bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : onboardingData.bodyFat,
            waistSize: formData.waistSize ? parseFloat(formData.waistSize) : onboardingData.waistSize
        };
        setOnboardingData(updatedData);
        sessionStorage.setItem('onboardingData', JSON.stringify(updatedData));
        localStorage.setItem('userSession', JSON.stringify(updatedData));
        setIsModalActive(false);
        alert("Metrics updated successfully! Your progress chart is being recalibrated.");
    };

    const avatarFallback = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                activePage="progress"
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
                        <h1 className={dashStyles.pageTitle}>Progress Tracker</h1>
                    </div>
                    <div className={dashStyles.navRight}>
                        <div className={dashStyles.searchBar}>
                            <SearchIcon />
                            <input type="text" placeholder="Search progress..." />
                        </div>
                        <button className={dashStyles.iconBtn} aria-label="Notifications">
                            <BellIcon />
                            <span className={dashStyles.badge}>2</span>
                        </button>
                        <a href="#" className={dashStyles.profileDropdownBtn}>
                            <div className={dashStyles.profileAvatar}>
                                <img src="/images/avatar-placeholder.png" alt="User Avatar"
                                    onError={e => { e.target.src = avatarFallback; }} />
                            </div>
                        </a>
                    </div>
                </header>

                <main className={styles.dashboardContent}>
                    <section className={styles.progressHeader}>
                        <div className={styles.headerInfo}>
                            <h2>Track Your Journey</h2>
                            <p>Visualizing your achievements and health metrics over time.</p>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.secondaryBtn} onClick={() => alert("Generating your health report... This will be downloaded as a PDF shortly.")}>Download Report</button>
                            <button className={styles.primaryBtn} onClick={handleUpdateMetrics}>Update Metrics</button>
                        </div>
                    </section>

                    <section className={styles.statsHighlightGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Weight Goal</span>
                            <div className={styles.statValueContainer}>
                                <span className={styles.statValue}>{onboardingData.weightValue || '0.0'}</span>
                                <span className={styles.statUnit}>{onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg'}</span>
                            </div>
                            <span className={`${styles.statTrend} ${onboardingData.goalWeightValue && onboardingData.weightValue === onboardingData.goalWeightValue ? styles.positive : styles.negative}`}>
                                {onboardingData.goalWeightValue ? (
                                    onboardingData.weightValue === onboardingData.goalWeightValue ? 'Goal Reached! 🏆' :
                                    onboardingData.goalWeightValue < onboardingData.weightValue ? `${(onboardingData.weightValue - onboardingData.goalWeightValue).toFixed(1)} ${onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg'} over goal` :
                                    `${(onboardingData.goalWeightValue - onboardingData.weightValue).toFixed(1)} ${onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg'} to go!`
                                ) : 'Set a goal!'}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Workout Consistency</span>
                            <div className={styles.statValueContainer}>
                                <span className={styles.statValue}>{consistency}</span>
                                <span className={styles.statUnit}>%</span>
                            </div>
                            <span className={`${styles.statTrend} ${consistency > 50 ? styles.positive : styles.neutral}`}>
                                {consistency > 50 ? "↑ On Track" : "Keep pushing!"}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Current BMI</span>
                            <div className={styles.statValueContainer}>
                                <span className={styles.statValue}>{bmi}</span>
                            </div>
                            <span className={`${styles.statTrend} ${bmiStatus === 'Healthy Range' ? styles.positive : styles.neutral}`}>
                                {bmiStatus}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Exercises Logged</span>
                            <div className={styles.statValueContainer}>
                                <span className={styles.statValue}>{compEx}</span>
                                <span className={styles.statUnit}>/{totalEx}</span>
                            </div>
                            <div className={styles.miniProgressBar}>
                                <div className={styles.fill} style={{ width: `${goalPercent}%` }}></div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.chartsGrid}>
                        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                            <div className={styles.chartHeader}>
                                <h3>Weight Transformation</h3>
                                <div className={styles.chartFilters}>
                                    {['3M', '6M', '1Y', 'All'].map(f => (
                                        <button 
                                            key={f} 
                                            className={`${styles.filterBtn} ${chartFilter === f ? styles.active : ''}`}
                                            onClick={() => handleFilterChange(f)}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.visualChart}>
                                <svg viewBox="0 0 800 200" className={styles.chartSvg} style={{ opacity: chartOpacity }}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={chartPath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" />
                                    <path d={`${chartPath} V200 H0 Z`} fill="url(#chartGradient)" />
                                    <circle cx="200" cy="120" r="5" fill="var(--accent-primary)" className={styles.pulse} />
                                    <circle cx="400" cy="100" r="5" fill="var(--accent-primary)" className={styles.pulse} />
                                    <circle cx="600" cy="80" r="5" fill="var(--accent-primary)" className={styles.pulse} />
                                    <circle cx="800" cy="70" r="5" fill="var(--accent-primary)" className={styles.pulse} />
                                </svg>
                                <div className={styles.chartLabels}>
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Body Fat %</h3>
                            </div>
                            <div className={styles.radialProgressContainer}>
                                <svg viewBox="0 0 100 100" className={styles.radialSvg}>
                                    <circle cx="50" cy="50" r="45" className={styles.bg} />
                                    <circle cx="50" cy="50" r="45" className={styles.meter}
                                        style={{ strokeDasharray: 283, strokeDashoffset: radialOffset }} />
                                </svg>
                                <div className={styles.radialContent}>
                                    <span className={styles.value}>{bodyFat}%</span>
                                    <span className={styles.label}>Keep going!</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Measurement Progress</h3>
                            </div>
                            <div className={styles.measurementList}>
                                <div className={styles.measurementItem}>
                                    <span className={styles.mLabel}>Chest</span>
                                    <div className={styles.mBarContainer}>
                                        <div className={styles.mBar} style={{ width: '85%' }}></div>
                                    </div>
                                    <span className={styles.mValue}>102 cm</span>
                                </div>
                                <div className={styles.measurementItem}>
                                    <span className={styles.mLabel}>Waist</span>
                                    <div className={styles.mBarContainer}>
                                        <div className={styles.mBar} style={{ width: `${waistBarWidth}%` }}></div>
                                    </div>
                                    <span className={styles.mValue}>{waistSize} cm</span>
                                </div>
                                <div className={styles.measurementItem}>
                                    <span className={styles.mLabel}>Arms</span>
                                    <div className={styles.mBarContainer}>
                                        <div className={styles.mBar} style={{ width: '45%' }}></div>
                                    </div>
                                    <span className={styles.mValue}>38 cm</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.milestonesSection}>
                        <div className={styles.sectionTitle}>
                            <h3>Recent Milestones</h3>
                        </div>
                        <div className={styles.milestonesGrid}>
                            <div className={styles.milestoneCard}>
                                <div className={styles.milestoneIcon}>🏆</div>
                                <div className={styles.milestoneText}>
                                    <h4>Weight Master</h4>
                                    <p>Reached target weight!</p>
                                </div>
                            </div>
                            <div className={`${styles.milestoneCard} ${compEx < 7 ? styles.locked : ''}`}>
                                <div className={styles.milestoneIcon}>🔥</div>
                                <div className={styles.milestoneText}>
                                    <h4>Consistency King</h4>
                                    <p>Active for 7+ days</p>
                                </div>
                            </div>
                            <div className={`${styles.milestoneCard} ${totalEx < 50 ? styles.locked : ''}`}>
                                <div className={styles.milestoneIcon}>💪</div>
                                <div className={styles.milestoneText}>
                                    <h4>Iron Grip</h4>
                                    <p>{totalEx < 50 ? 'Log 50 exercises (Soon)' : 'Logged over 50 exercises!'}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* Metrics Modal */}
            <div className={`${styles.modal} ${isModalActive ? styles.active : ''}`}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2>Update Metrics</h2>
                        <button className={styles.closeModalBtn} onClick={() => setIsModalActive(false)}>&times;</button>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                        <div className={styles.formGroup}>
                            <label>Current Weight ({onboardingData.weightUnit === 'imperial' ? 'lbs' : 'kg'})</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                value={formData.currentWeight}
                                onChange={e => setFormData({...formData, currentWeight: e.target.value})}
                                required 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Body Fat %</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                value={formData.bodyFat}
                                onChange={e => setFormData({...formData, bodyFat: e.target.value})}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Waist Size (cm)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                value={formData.waistSize}
                                onChange={e => setFormData({...formData, waistSize: e.target.value})}
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn}>Update Journey</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProgressTracker;
