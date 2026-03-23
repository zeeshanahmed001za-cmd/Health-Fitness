import { createContext, useContext, useState, useEffect } from 'react';

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

    const updateUserData = (data) => {
        setUserData(prev => ({ ...prev, ...data }));
    };

    const logout = () => {
        setUserData({});
        sessionStorage.removeItem('onboardingData');
        localStorage.removeItem('userSession');
    };

    return (
        <UserContext.Provider value={{ userData, updateUserData, logout }}>
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
