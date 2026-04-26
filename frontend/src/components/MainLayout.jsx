import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import QuickLogModal from './QuickLogModal';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import dashStyles from '../styles/Dashboard.module.css';

const MainLayout = () => {
    const { sidebarCollapsed, toggleSidebar } = useUser();
    const { toggleQuickLog, isQuickLogOpen } = useNutrition();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Register Global Keyboard Shortcuts
    useKeyboardShortcuts({ toggleSidebar, toggleQuickLog, isQuickLogOpen });

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                isCollapsed={sidebarCollapsed}
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />
            <div className={dashStyles.mainWrapper}>
                <button 
                    className={dashStyles.mobileMenuBtn} 
                    onClick={() => setIsMobileOpen(true)}
                    aria-label="Open Menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <Outlet />
            </div>
            {/* Global Quick Log Modal reachable from anywhere */}
            <QuickLogModal />
        </div>
    );
};

export default MainLayout;
