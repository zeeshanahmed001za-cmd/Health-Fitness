import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useSidebarShortcut from "../hooks/useSidebarShortcut";
import { useUser } from "../context/UserContext";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/ProgressTracker.module.css";

// Icons
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

function ProgressTracker() {
  const { sidebarCollapsed, toggleSidebar } = useUser();
  useDocumentTitle("Progress Tracker");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  useSidebarShortcut(toggleSidebar);

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebar();
    }
  };

  const handleNotificationsClick = () => {
    setNotificationsRead(true);
    alert("Notification drawer placeholder - To be replaced with a real drawer");
  };

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
            <button
              className={dashStyles.toggleSidebarBtn}
              onClick={handleSidebarToggle}
              aria-label="Toggle Sidebar"
            >
              <HamburgerIcon />
            </button>
            <h1 className={dashStyles.pageTitle}>Progress Tracker</h1>
          </div>
          <div className={dashStyles.navRight}>
            <button
              className={dashStyles.iconBtn}
              aria-label="Notifications"
              onClick={handleNotificationsClick}
            >
              <BellIcon />
              {!notificationsRead && <span className={dashStyles.badge}>2</span>}
            </button>
            <Link to="/profile" className={dashStyles.profileDropdownBtn}>
              <div className={dashStyles.profileAvatar}>
                <img
                  src={AVATAR_FALLBACK}
                  alt="User Avatar"
                />
              </div>
            </Link>
          </div>
        </header>

        <main className={styles.dashboardContent}>
          {/* Content removed per user request */}
        </main>
      </div>
    </div>
  );
}

export default ProgressTracker;
