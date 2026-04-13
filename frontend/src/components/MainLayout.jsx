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

    // Register Global Keyboard Shortcuts
    useKeyboardShortcuts({ toggleSidebar, toggleQuickLog, isQuickLogOpen });

    return (
        <div className={dashStyles.pageWrapper}>
            <Sidebar
                isCollapsed={sidebarCollapsed}
                // We don't need activePage here if Sidebar handles it via useLocation (it does)
            />
            <div className={dashStyles.mainWrapper}>
                <Outlet />
            </div>
            {/* Global Quick Log Modal reachable from anywhere */}
            <QuickLogModal />
        </div>
    );
};

export default MainLayout;
