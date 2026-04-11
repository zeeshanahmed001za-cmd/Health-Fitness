import { Link, useNavigate } from "react-router-dom";
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
