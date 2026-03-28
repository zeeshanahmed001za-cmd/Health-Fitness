import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useUser } from "../context/UserContext";
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
  const sidebarClass = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : "",
    isMobileOpen ? styles.mobileOpen : "",
  ].join(" ");

  const handleLogout = () => {
    logout();
    // Link will handle the navigation
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
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            to="/login"
            className={`${styles.navItem} ${styles.logoutBtn}`}
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span className={styles.navText}>Log Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
