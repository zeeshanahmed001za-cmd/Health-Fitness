import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { getUserProfileAPI } from "../api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    try {
      const savedOnboarding = sessionStorage.getItem("onboardingData");
      const savedSession = localStorage.getItem("userSession");

      if (savedOnboarding) return JSON.parse(savedOnboarding);
      if (savedSession) return JSON.parse(savedSession);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return {};
  });

  // Fetch updated profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      getUserProfileAPI()
        .then((data) => {
          setUserData((prev) => ({ ...prev, ...data }));
        })
        .catch((err) => {
          console.error("Failed to fetch user profile", err);
        });
    }
  }, []);

  // Sync state changes to storage automatically
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      sessionStorage.setItem("onboardingData", JSON.stringify(userData));
    }
  }, [userData]);

  const updateUserData = useCallback((data) => {
    setUserData((prev) => {
      // Check if there's an actual change to avoid redundant renders
      const isDifferent = Object.entries(data).some(
        ([key, value]) => prev[key] !== value,
      );
      if (!isDifferent) return prev;
      return { ...prev, ...data };
    });
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Load sidebar preference when userId changes
  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (userId) {
      const pref = localStorage.getItem(`sidebar_collapsed_${userId}`);
      if (pref !== null) {
        setSidebarCollapsed(JSON.parse(pref));
      }
    } else {
      const globalPref = localStorage.getItem("sidebar_collapsed");
      if (globalPref !== null) {
        setSidebarCollapsed(JSON.parse(globalPref));
      }
    }
  }, [userData?._id, userData?.id]);

  // Persist sidebar preference
  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (userId) {
      localStorage.setItem(`sidebar_collapsed_${userId}`, JSON.stringify(sidebarCollapsed));
    } else {
      localStorage.setItem("sidebar_collapsed", JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, userData?._id, userData?.id]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const logout = useCallback(() => {
    const userId = userData?._id || userData?.id;
    
    // Clear all domain-specific data for the current user to prevent leakage
    if (userId) {
      localStorage.removeItem(`sidebar_collapsed_${userId}`);
      localStorage.removeItem(`loggedExercises_grouped_${userId}`);
      localStorage.removeItem(`journal_food_logs_${userId}`);
      localStorage.removeItem(`journal_water_logs_${userId}`);
      localStorage.removeItem(`journal_nutrition_goals_${userId}`);
    }

    setUserData({});
    sessionStorage.removeItem("onboardingData");
    localStorage.removeItem("userSession");
    localStorage.removeItem("userToken");
    
    // also clear any legacy generic keys if they exist
    localStorage.removeItem("sidebar_collapsed");
    localStorage.removeItem("loggedExercises_grouped");
    localStorage.removeItem("journal_food_logs");
    localStorage.removeItem("journal_water_logs");
    localStorage.removeItem("journal_nutrition_goals");
  }, [userData]);

  // Memoize the value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      userData,
      updateUserData,
      logout,
      sidebarCollapsed,
      toggleSidebar,
    }),
    [userData, updateUserData, logout, sidebarCollapsed, toggleSidebar],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
