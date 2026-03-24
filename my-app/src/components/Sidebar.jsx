import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useUser } from '../context/UserContext';
import siteLogo from '../assets/images/site.png';


// Icons extracted as components outside
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);
const NutritionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
);
const WorkoutsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);
const ProgressIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 9 8 12 2 12"></polyline>
    </svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// navItems data array
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { id: 'nutrition', label: 'Nutrition', icon: <NutritionIcon />, path: '/nutrition' },
    { id: 'workouts', label: 'Workouts', icon: <WorkoutsIcon />, path: '/workouts' },
    { id: 'progress', label: 'Progress', icon: <ProgressIcon />, path: '/progress' },
];

function Sidebar({ activePage, isCollapsed, isMobileOpen, onClose }) {
    const { logout } = useUser();
    const sidebarClass = [
        styles.sidebar,
        isCollapsed ? styles.collapsed : '',
        isMobileOpen ? styles.mobileOpen : '',
    ].join(' ');

    const handleLogout = () => {
        logout();
        // Link will handle the navigation
    };

    return (
        <>
            <div
                className={`${styles.sidebarOverlay} ${isMobileOpen ? styles.active : ''}`}
                onClick={onClose}
            />

            <aside className={sidebarClass}>
                <div className={styles.sidebarHeader}>
                    <Link to="/dashboard" className={styles.logoLink}>
                        <img src={siteLogo} alt="Logo" className={styles.logoImg} />
                        <h2>Health&Fitness</h2>
                    </Link>

                    <button className={styles.closeSidebarBtn} onClick={onClose} aria-label="Close Sidebar">
                        <CloseIcon />
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map(item => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
                            onClick={onClose}
                        >
                            {item.icon}
                            <span className={styles.navText}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link to="/login" className={`${styles.navItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                        <LogoutIcon />
                        <span className={styles.navText}>Log Out</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;