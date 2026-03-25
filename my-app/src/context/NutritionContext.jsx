import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const NutritionContext = createContext();

/**
 * NutritionProvider: Manages the single source of truth for food logs and goals.
 * Business logic for totals and persistence is handled here.
 */
export const NutritionProvider = ({ children }) => {
  // 1. Initial State from localStorage
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem('journal_food_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [nutritionGoals, setNutritionGoals] = useState(() => {
    const saved = localStorage.getItem('journal_nutrition_goals');
    if (saved) return JSON.parse(saved);
    
    // Fallback to onboarding data if available
    const onboarding = sessionStorage.getItem('onboardingData');
    if (onboarding) {
      const data = JSON.parse(onboarding);
      if (data.calorieGoal) return { calories: data.calorieGoal, protein: 150, carbs: 250, fat: 70 };
    }
    
    return { calories: 2100, protein: 150, carbs: 200, fat: 70 };
  });

  // 2. Persistence Layer
  useEffect(() => {
    localStorage.setItem('journal_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('journal_nutrition_goals', JSON.stringify(nutritionGoals));
  }, [nutritionGoals]);

  // 3. Actions (Business Logic)
  const addFoodLog = useCallback((foodItem) => {
    const newEntry = {
      ...foodItem,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setFoodLogs((prev) => [...prev, newEntry]);
  }, []);

  const removeFoodLog = useCallback((id) => {
    setFoodLogs((prev) => prev.filter(item => item.id !== id));
  }, []);

  const updateGoal = useCallback((newGoals) => {
    setNutritionGoals((prev) => ({ ...prev, ...newGoals }));
  }, []);

  // 4. Derived State (Calculations)
  // We use useMemo to avoid re-calculating on every render unless logs change
  const totals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = foodLogs.filter(log => log.timestamp.startsWith(today));

    return todaysLogs.reduce((acc, curr) => ({
      calories: acc.calories + (Number(curr.calories) || 0),
      protein: acc.protein + (Number(curr.protein) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      fat: acc.fat + (Number(curr.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodLogs]);

  // Group logs by category for UI
  const groupedLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = foodLogs.filter(log => log.timestamp.startsWith(today));
    
    return todaysLogs.reduce((acc, curr) => {
      const cat = curr.category?.toLowerCase() || 'snacks';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [], snacks: [] });
  }, [foodLogs]);

  const value = useMemo(() => ({
    foodLogs,
    nutritionGoals,
    totals,
    groupedLogs,
    addFoodLog,
    removeFoodLog,
    updateGoal
  }), [foodLogs, nutritionGoals, totals, groupedLogs, addFoodLog, removeFoodLog, updateGoal]);

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) throw new Error('useNutrition must be used within a NutritionProvider');
  return context;
};
