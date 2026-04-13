import { useState, useEffect, useMemo, useCallback } from 'react';
import { NutritionContext } from './NutritionContext';
import { useUser } from './UserContext';
import { getNutritionLogsAPI, addNutritionLogAPI, deleteNutritionLogAPI } from '../api';
import { isToday, calculateDynamicGoals } from '../utils/nutritionUtils';

/**
 * NutritionProvider: Manages the single source of truth for food logs, water, and goals.
 * Business logic for totals and persistence is handled here.
 */
export const NutritionProvider = ({ children }) => {
  const { userData } = useUser();
  const userId = userData?._id || userData?.id;

  // 1. Initial State from localStorage
  const [foodLogs, setFoodLogs] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 2100, protein: 150, carbs: 200, fat: 70 });

  // Load user-specific data when userId changes
  useEffect(() => {
    if (userId) {
      const savedFood = localStorage.getItem(`journal_food_logs_${userId}`);
      const savedWater = localStorage.getItem(`journal_water_logs_${userId}`);
      const savedGoals = localStorage.getItem(`journal_nutrition_goals_${userId}`);

      try {
        if (savedFood) setFoodLogs(JSON.parse(savedFood));
        if (savedWater) setWaterLogs(JSON.parse(savedWater));
        if (savedGoals) setNutritionGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error("Error loading user-specific data", e);
      }
    } else {
      // Clear current state if no user
      setFoodLogs([]);
      setWaterLogs([]);
      setNutritionGoals({ calories: 2100, protein: 150, carbs: 200, fat: 70 });
    }
  }, [userId]);

  // Calculate dynamic goals based on userData
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
       const dynamicGoals = calculateDynamicGoals(userData);
       if (dynamicGoals) {
         setNutritionGoals(prev => {
           if (prev.calories === dynamicGoals.calories && prev.protein === dynamicGoals.protein) return prev;
           return dynamicGoals;
         });
       }
    }
  }, [userData]);


  // Fetch/Refresh from backend
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token || !userId) return;

    getNutritionLogsAPI()
      .then(logs => {
        if (logs && logs.length > 0) {
          const food = logs.filter(l => l.activityType === 'food').map(l => ({...l, id: l._id}));
          const water = logs.filter(l => l.activityType === 'water').map(l => ({...l, id: l._id}));
          setFoodLogs(food);
          setWaterLogs(water);
        }
      })
      .catch(err => console.error("Failed to load nutrition from cloud", err));
  }, [userId]);

  // 2. Persistence Layer (Local fallback) - User Specific
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`journal_food_logs_${userId}`, JSON.stringify(foodLogs));
    }
  }, [foodLogs, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`journal_water_logs_${userId}`, JSON.stringify(waterLogs));
    }
  }, [waterLogs, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`journal_nutrition_goals_${userId}`, JSON.stringify(nutritionGoals));
    }
  }, [nutritionGoals, userId]);

  // 3. Actions (Business Logic)
  const addFoodLog = useCallback(async (foodItem) => {
    const newEntry = {
      ...foodItem,
      timestamp: new Date().toISOString(),
      activityType: 'food'
    };
    try {
      const saved = await addNutritionLogAPI(newEntry);
      setFoodLogs((prev) => [...prev, { ...saved, id: saved._id }]);
    } catch (err) {
      console.error(err);
      setFoodLogs((prev) => [...prev, { ...newEntry, id: Date.now().toString() }]);
    }
  }, []);

  const removeFoodLog = useCallback(async (id) => {
    try {
      await deleteNutritionLogAPI(id);
    } catch(err) {
      console.error(err);
    }
    setFoodLogs((prev) => prev.filter(item => item.id !== id));
  }, []);

  const addWaterLog = useCallback(async () => {
    const todaysWater = waterLogs.filter(log => isToday(log.timestamp));
    if (todaysWater.length >= 8) return; // max 8 glasses

    const newEntry = {
      timestamp: new Date().toISOString(),
      amount: 250, // per glass
      activityType: 'water'
    };

    try {
      const saved = await addNutritionLogAPI(newEntry);
      setWaterLogs((prev) => [...prev, { ...saved, id: saved._id }]);
    } catch(err) {
      console.error(err);
      setWaterLogs((prev) => [...prev, { ...newEntry, id: Date.now().toString() }]);
    }
  }, [waterLogs]);

  const removeWaterLog = useCallback(async () => {
    // Find the last index of today's log
    const lastLogIdx = waterLogs.map(l => isToday(l.timestamp)).lastIndexOf(true);
    if (lastLogIdx !== -1) {
      const logToRemove = waterLogs[lastLogIdx];
      try {
        if (logToRemove._id || !logToRemove.id.includes(today)) { // basic check
          await deleteNutritionLogAPI(logToRemove.id || logToRemove._id);
        }
      } catch(err) {
        console.error(err);
      }
      setWaterLogs((prev) => [...prev.slice(0, lastLogIdx), ...prev.slice(lastLogIdx + 1)]);
    }
  }, [waterLogs]);

  const updateGoal = useCallback((newGoals) => {
    setNutritionGoals((prev) => ({ ...prev, ...newGoals }));
  }, []);

  const refreshLogs = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
      const logs = await getNutritionLogsAPI();
      if (logs) {
        const food = logs.filter(l => l.activityType === 'food').map(l => ({...l, id: l._id}));
        const water = logs.filter(l => l.activityType === 'water').map(l => ({...l, id: l._id}));
        setFoodLogs(food);
        setWaterLogs(water);
      }
    } catch (err) {
      console.error("Failed to refresh logs", err);
    }
  }, []);

  // 4. Derived State (Calculations)

  const todaysFoodLogs = useMemo(() => {
    return foodLogs.filter(log => isToday(log.timestamp));
  }, [foodLogs, isToday]);

  const totals = useMemo(() => {
    return todaysFoodLogs.reduce((acc, curr) => ({
      calories: acc.calories + (Number(curr.calories) || 0),
      protein: acc.protein + (Number(curr.protein) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      fat: acc.fat + (Number(curr.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysFoodLogs]);

  const waterTotal = useMemo(() => {
    const todaysWater = waterLogs.filter(log => isToday(log.timestamp));
    return todaysWater.length; // counts of glasses
  }, [waterLogs, isToday]);

  // Group logs by category for UI
  const groupedLogs = useMemo(() => {
    return todaysFoodLogs.reduce((acc, curr) => {
      const cat = curr.category?.toLowerCase() || 'snacks';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [], snacks: [] });
  }, [todaysFoodLogs]);


  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const toggleQuickLog = useCallback((val) => {
    setIsQuickLogOpen(prev => typeof val === 'boolean' ? val : !prev);
  }, []);

  const value = useMemo(() => ({
    foodLogs,
    todaysFoodLogs,
    waterLogs,
    nutritionGoals,
    totals,
    waterTotal,
    groupedLogs,
    addFoodLog,
    removeFoodLog,
    addWaterLog,
    removeWaterLog,
    updateGoal,
    refreshLogs,
    isQuickLogOpen,
    toggleQuickLog
  }), [foodLogs, todaysFoodLogs, waterLogs, nutritionGoals, totals, waterTotal, groupedLogs, addFoodLog, removeFoodLog, addWaterLog, removeWaterLog, updateGoal, refreshLogs, isQuickLogOpen, toggleQuickLog]);


  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};
