import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useUser } from "../context/UserContext";
import { useNutrition } from "../context/NutritionContext";
import {
  DashboardIcon,
  NutritionIcon,
  WorkoutsIcon,
  ProgressIcon,
  LogoutIcon,
  CloseIcon,
  AppLogo
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

function Sidebar({ isCollapsed, isMobileOpen, onClose }) {
  const { logout, toggleSidebar } = useUser();
  const { toggleQuickLog } = useNutrition();
  const navigate = useNavigate();
  const location = useLocation();
  
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

      <aside 
        className={sidebarClass}
        onMouseEnter={() => isCollapsed && toggleSidebar()}
        onMouseLeave={() => !isCollapsed && toggleSidebar()}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logoLink}>
            <AppLogo />
            {!isCollapsed && <h2 className={styles.brandTitle}>Health & Fitness</h2>}
          </Link>
        </div>


        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${location.pathname.startsWith(item.path) ? styles.active : ""}`}
              onClick={onClose}
            >
              {item.icon}
              <span className={styles.navText}>{item.label}</span>
            </Link>
          ))}
          
          {!isCollapsed && (
            <button 
              className={`${styles.navItem} ${styles.quickActionBtn}`} 
              onClick={() => { toggleQuickLog(true); onClose(); }}
              style={{ marginTop: 'auto' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className={styles.navText}>New Entry</span>
            </button>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={`${styles.navItem} ${styles.logoutBtn}`}
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center' }}
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
