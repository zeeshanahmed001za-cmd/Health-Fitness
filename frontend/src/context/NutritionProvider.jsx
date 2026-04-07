import { useState, useEffect, useMemo, useCallback } from 'react';
import { NutritionContext } from './NutritionContext';

/**
 * NutritionProvider: Manages the single source of truth for food logs, water, and goals.
 * Business logic for totals and persistence is handled here.
 */
export const NutritionProvider = ({ children }) => {
  // 1. Initial State from localStorage
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem('journal_food_logs');
    try {
      return saved ? JSON.parse(saved) || [] : [];
    } catch {
      return [];
    }
  });

  const [waterLogs, setWaterLogs] = useState(() => {
    const saved = localStorage.getItem('journal_water_logs');
    try {
      return saved ? JSON.parse(saved) || [] : [];
    } catch {
      return [];
    }
  });

  const [nutritionGoals, setNutritionGoals] = useState(() => {
    const defaultGoals = { calories: 2100, protein: 150, carbs: 200, fat: 70 };
    const saved = localStorage.getItem('journal_nutrition_goals');
    
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error("Error parsing nutrition goals", e);
    }
    
    // Fallback to onboarding data if available
    const onboarding = sessionStorage.getItem('onboardingData');
    if (onboarding) {
      try {
        const data = JSON.parse(onboarding);
        if (data.calorieGoal) return { ...defaultGoals, calories: data.calorieGoal };
      } catch {
        // Fallback to defaults if parsing fails
      }
    }
    
    return defaultGoals;
  });

  // 2. Persistence Layer
  useEffect(() => {
    localStorage.setItem('journal_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('journal_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('journal_nutrition_goals', JSON.stringify(nutritionGoals));
  }, [nutritionGoals]);

  // 3. Actions (Business Logic)
  const addFoodLog = useCallback((foodItem) => {
    const newEntry = {
      ...foodItem,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      activityType: 'food'
    };
    setFoodLogs((prev) => [...prev, newEntry]);
  }, []);

  const removeFoodLog = useCallback((id) => {
    setFoodLogs((prev) => prev.filter(item => item.id !== id));
  }, []);

  const addWaterLog = useCallback(() => {
    setWaterLogs((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const todaysWater = prev.filter(log => log.timestamp.startsWith(today));
      if (todaysWater.length >= 8) return prev; // max 8 glasses

      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        amount: 250, // per glass
        activityType: 'water'
      };
      return [...prev, newEntry];
    });
  }, []);

  const removeWaterLog = useCallback(() => {
    setWaterLogs((prev) => {
      const today = new Date().toISOString().split('T')[0];
      // Find the last index of today's log to remove it specifically
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].timestamp.startsWith(today)) {
          return [...prev.slice(0, i), ...prev.slice(i + 1)];
        }
      }
      return prev;
    });
  }, []);

  const updateGoal = useCallback((newGoals) => {
    setNutritionGoals((prev) => ({ ...prev, ...newGoals }));
  }, []);

  // 4. Derived State (Calculations)
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

  const waterTotal = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysWater = waterLogs.filter(log => log.timestamp.startsWith(today));
    return todaysWater.length; // counts of glasses
  }, [waterLogs]);

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
    waterLogs,
    nutritionGoals,
    totals,
    waterTotal,
    groupedLogs,
    addFoodLog,
    removeFoodLog,
    addWaterLog,
    removeWaterLog,
    updateGoal
  }), [foodLogs, waterLogs, nutritionGoals, totals, waterTotal, groupedLogs, addFoodLog, removeFoodLog, addWaterLog, removeWaterLog, updateGoal]);

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};
