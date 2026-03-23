import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import dashStyles from '../styles/Dashboard.module.css';
import pageStyles from '../styles/DashboardPage.module.css';
import { useUser } from '../context/UserContext';

// SVG Icons
const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const StepsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 5h-4l-3 4h4l-3 6"></path><circle cx="12" cy="12" r="10"></circle>
    </svg>
);
const CaloriesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path>
    </svg>
);
const ActiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const RunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
);
const StrengthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v18M18 3v18M2 15h20M2 9h20"></path>
    </svg>
);
const YogaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
);

const AVATAR_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function DashboardPage() {
    const { userData } = useUser();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [notificationsClean, setNotificationsClean] = useState(false);

    const loggedExercises = useMemo(() => {
        return JSON.parse(localStorage.getItem('loggedExercises_grouped')) || [];
    }, []);

    // Use context values instead of local lookups
    const firstName = userData.firstName || 'Alex';
    const completedExercises = useMemo(() => loggedExercises.filter(ex => ex.completed), [loggedExercises]);
    
    const progress = useMemo(() => {
        if (loggedExercises.length === 0) return 70; 
        return Math.round((completedExercises.length / loggedExercises.length) * 100);
    }, [loggedExercises, completedExercises]);

    const totalCalories = useMemo(() => {
        return completedExercises.reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0);
    }, [completedExercises]);

    const caloriePercent = Math.min((totalCalories / 2000) * 100, 100);

    // Metric configurations to avoid duplicate JSX
    const metrics = [
        { 
            title: 'Steps', value: '8,432', icon: <StepsIcon />, 
            iconClass: pageStyles.stepsIcon, progress: '84%', 
            footer: <><span className={`${pageStyles.trend} ${pageStyles.positive}`}>↑ 12%</span> vs yesterday</>
        },
        { 
            title: 'Calories Burned', value: `${totalCalories.toLocaleString()} kcal`, icon: <CaloriesIcon />, 
            iconClass: pageStyles.caloriesIcon, progress: `${caloriePercent || 65}%`, barClass: pageStyles.caloriesBar,
            footer: <><span className={`${pageStyles.trend} ${pageStyles.positive}`}>↑ 5%</span> vs yesterday</>
        },
        { 
            title: 'Active Time', value: '45 mins', icon: <ActiveIcon />, 
            iconClass: pageStyles.activeIcon, progress: '50%', barClass: pageStyles.activeBar,
            footer: <span>Goal: 90 mins</span>
        }
    ];

    // Handlers
    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen(prev => !prev);
        } else {
            setSidebarCollapsed(prev => !prev);
        }
    };

    const handleNotificationClick = () => {
        setNotificationsClean(true);
        alert("You have 3 new notifications:\n1. Calorie target reached!\n2. Weekly report ready.\n3. New workout plan recommended.");
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            alert(`Searching for: "${e.target.value}"... This feature is coming soon!`);
            e.target.value = '';
        }
    };

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                activePage="dashboard"
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
                        <h1 className={dashStyles.pageTitle}>Overview</h1>
                    </div>
                    <div className={dashStyles.navRight}>
                        <div className={dashStyles.searchBar}>
                            <SearchIcon />
                            <input type="text" placeholder="Search..." onKeyDown={handleSearch} />
                        </div>
                        <button className={dashStyles.iconBtn} onClick={handleNotificationClick} aria-label="Notifications">
                            <BellIcon />
                            {!notificationsClean && <span className={dashStyles.badge}>3</span>}
                        </button>
                        <Link to="/profile" className={dashStyles.profileDropdownBtn}>
                            <div className={dashStyles.profileAvatar}>
                                <img 
                                    src="/images/avatar-placeholder.png" 
                                    alt="User Avatar"
                                    onError={e => { e.target.src = AVATAR_FALLBACK; }} 
                                />
                            </div>
                        </Link>
                    </div>
                </header>

                <main className={pageStyles.dashboardContent}>
                    <section className={pageStyles.welcomeSection}>
                        <div className={pageStyles.welcomeText}>
                            <h2>Hello, {firstName}!</h2>
                            <p>You've crushed {progress}% of your {loggedExercises.length > 0 ? 'routine today' : 'weekly fitness goals'}. Keep it up!</p>
                        </div>
                        <div className={pageStyles.welcomeAction}>
                            <button className={pageStyles.primaryBtn} onClick={() => alert("Redirecting to workouts...")}>Log Workout</button>
                        </div>
                    </section>

                    <section className={pageStyles.metricsGrid}>
                        {metrics.map((m, idx) => (
                            <div key={idx} className={pageStyles.metricCard} onClick={() => alert(`${m.title} Overview: Track is live!`)}>
                                <div className={pageStyles.metricHeader}>
                                    <div className={`${pageStyles.metricIcon} ${m.iconClass}`}>{m.icon}</div>
                                    <span className={pageStyles.metricTitle}>{m.title}</span>
                                </div>
                                <div className={pageStyles.metricValue}>{m.value}</div>
                                <div className={pageStyles.metricProgress}>
                                    <div className={`${pageStyles.progressBar} ${m.barClass || ''}`} style={{ width: m.progress }}></div>
                                </div>
                                <div className={pageStyles.metricFooter}>{m.footer}</div>
                            </div>
                        ))}
                    </section>

                    <section className={pageStyles.secondaryGrid}>
                        <div className={`${pageStyles.activityCard} ${pageStyles.panelCard}`}>
                            <div className={pageStyles.panelHeader}>
                                <h3>Weekly Activity</h3>
                                <div className={pageStyles.panelActions}>
                                    <select className={pageStyles.customSelect}>
                                        <option>This Week</option>
                                        <option>Last Week</option>
                                    </select>
                                </div>
                            </div>
                            <div className={pageStyles.chartContainer}>
                                <div className={pageStyles.barChartMock}>
                                    {[
                                        { day: 'Mon', h: '40%' }, { day: 'Tue', h: '70%' }, { day: 'Wed', h: '50%' },
                                        { day: 'Thu', h: '90%', active: true }, { day: 'Fri', h: '30%' },
                                        { day: 'Sat', h: '60%' }, { day: 'Sun', h: '80%' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={pageStyles.barWrap}>
                                            <div className={`${pageStyles.bar} ${item.active ? pageStyles.active : ''}`} style={{ height: item.h }}></div>
                                            <span>{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${pageStyles.workoutsCard} ${pageStyles.panelCard}`}>
                            <div className={pageStyles.panelHeader}>
                                <h3>Recent Workouts</h3>
                                <a href="#" className={pageStyles.viewAllLink} onClick={(e) => { e.preventDefault(); alert("Viewing all workouts..."); }}>View All</a>
                            </div>
                            <div className={pageStyles.workoutList}>
                                {loggedExercises.length > 0 && (
                                    <div className={`${pageStyles.workoutItem} ${pageStyles.pulseOutline}`}>
                                        <div className={`${pageStyles.workoutIcon} ${pageStyles.bgBlue}`}><RunIcon /></div>
                                        <div className={pageStyles.workoutDetails}>
                                            <h4>Active Routine</h4>
                                            <p>Latest Session</p>
                                        </div>
                                        <div className={pageStyles.workoutStats}>
                                            <span>{loggedExercises.length} Exercises</span>
                                            <span className={pageStyles.duration}>{progress}% Done</span>
                                        </div>
                                    </div>
                                )}
                                <div className={pageStyles.workoutItem}>
                                    <div className={`${pageStyles.workoutIcon} ${pageStyles.bgBlue}`}><RunIcon /></div>
                                    <div className={pageStyles.workoutDetails}><h4>Morning Run</h4><p>Today, 6:00 AM</p></div>
                                    <div className={pageStyles.workoutStats}><span>5.2 km</span><span className={pageStyles.duration}>45 min</span></div>
                                </div>
                                <div className={pageStyles.workoutItem}>
                                    <div className={`${pageStyles.workoutIcon} ${pageStyles.bgOrange}`}><StrengthIcon /></div>
                                    <div className={pageStyles.workoutDetails}><h4>Upper Body Strength</h4><p>Yesterday, 5:30 PM</p></div>
                                    <div className={pageStyles.workoutStats}><span>8 exercises</span><span className={pageStyles.duration}>1h 15m</span></div>
                                </div>
                                <div className={pageStyles.workoutItem}>
                                    <div className={`${pageStyles.workoutIcon} ${pageStyles.bgPurple}`}><YogaIcon /></div>
                                    <div className={pageStyles.workoutDetails}><h4>Yoga Flow</h4><p>Tue, 7:00 AM</p></div>
                                    <div className={pageStyles.workoutStats}><span>Flexibility</span><span className={pageStyles.duration}>30 min</span></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default DashboardPage;
