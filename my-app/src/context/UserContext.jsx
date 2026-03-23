import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(() => {
        try {
            const savedOnboarding = sessionStorage.getItem('onboardingData');
            const savedSession = localStorage.getItem('userSession');
            
            if (savedOnboarding) return JSON.parse(savedOnboarding);
            if (savedSession) return JSON.parse(savedSession);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return {};
    });

    // Sync state changes to storage automatically
    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            sessionStorage.setItem('onboardingData', JSON.stringify(userData));
        }
    }, [userData]);

    const updateUserData = useCallback((data) => {
        setUserData(prev => {
            // Check if there's an actual change to avoid redundant renders
            const isDifferent = Object.entries(data).some(([key, value]) => prev[key] !== value);
            if (!isDifferent) return prev;
            return { ...prev, ...data };
        });
    }, []);

    const logout = useCallback(() => {
        setUserData({});
        sessionStorage.removeItem('onboardingData');
        localStorage.removeItem('userSession');
    }, []);

    // Memoize the value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => ({
        userData,
        updateUserData,
        logout
    }), [userData, updateUserData, logout]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
