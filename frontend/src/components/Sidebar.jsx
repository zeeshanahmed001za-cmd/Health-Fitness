import { Link, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import {
  DashboardIcon,
  NutritionIcon,
  WorkoutsIcon,
  ProgressIcon,
  LogoutIcon,
  CloseIcon
} from "./Icons";

// navItems data array
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: <NutritionIcon />,
    path: "/nutrition",
  },
  {
    id: "workouts",
    label: "Workouts",
    icon: <WorkoutsIcon />,
    path: "/workouts",
  },
  {
    id: "progress",
    label: "Progress",
    icon: <ProgressIcon />,
    path: "/progress",
  },
];

function Sidebar({ activePage, isCollapsed, isMobileOpen, onClose }) {
  const { logout } = useUser();
  const { toggleQuickLog } = useNutrition();
  const navigate = useNavigate();
  
  const sidebarClass = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : "",
    isMobileOpen ? styles.mobileOpen : "",
  ].join(" ");

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isMobileOpen ? styles.active : ""}`}
        onClick={onClose}
      />

      <aside className={sidebarClass}>
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logoLink}>
            <h2>Health&Fitness</h2>
          </Link>

          <button
            className={styles.closeSidebarBtn}
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ""}`}
              onClick={onClose}
            >
              {item.icon}
              <span className={styles.navText}>{item.label}</span>
            </Link>
          ))}
          
          <button 
            className={styles.navItem} 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '12px', color: 'var(--accent-primary)' }}
            onClick={() => { toggleQuickLog(true); onClose(); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <span className={styles.navText} style={{ fontWeight: '700' }}>Fast Record</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={`${styles.navItem} ${styles.logoutBtn}`}
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center' }}
          >
            <LogoutIcon />
            <span className={styles.navText}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
