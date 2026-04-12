import { useState, useEffect, useMemo, useCallback } from 'react';
import { NutritionContext } from './NutritionContext';
import { useUser } from './UserContext';
import { getNutritionLogsAPI, addNutritionLogAPI, deleteNutritionLogAPI } from '../api';

/**
 * NutritionProvider: Manages the single source of truth for food logs, water, and goals.
 * Business logic for totals and persistence is handled here.
 */
export const NutritionProvider = ({ children }) => {
  const { userData } = useUser();
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

  // Calculate dynamic goals based on userData
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
       const calculateDynamicGoals = (data) => {
          let defaultGoals = { calories: 2100, protein: 150, carbs: 200, fat: 70 };
          if (data.calorieGoal) {
             const cal = parseInt(data.calorieGoal);
             return {
                ...defaultGoals,
                calories: cal,
                protein: Math.round(cal * 0.3 / 4),
                carbs: Math.round(cal * 0.4 / 4),
                fat: Math.round(cal * 0.3 / 9)
             };
          }

          let weight = parseFloat(data.weightValue);
          if (!weight) return null;

          if (data.weightUnit === "imperial" || data.weightUnit === "lbs") {
             weight = weight * 0.453592;
          }
          
          let height = 0;
          if (data.heightUnit === "imperial" && data.heightFeet) {
             const ft = parseFloat(data.heightFeet) || 0;
             const inc = parseFloat(data.heightInches) || 0;
             height = (ft * 12 + inc) * 2.54; 
          } else if (data.heightCm) {
             height = parseFloat(data.heightCm);
          }

          if (!height) return null;

          let age = 30;
          if (data.dob) {
            const today = new Date();
            const birthDate = new Date(data.dob);
            age = today.getFullYear() - birthDate.getFullYear();
          }

          const isMale = data.gender === "male";
          
          let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
          
          let tdee = bmr * 1.55; 
          if (data.activityLevel === "sedentary") tdee = bmr * 1.2;
          else if (data.activityLevel === "lightly_active") tdee = bmr * 1.375;
          else if (data.activityLevel === "active") tdee = bmr * 1.55;
          else if (data.activityLevel === "very_active") tdee = bmr * 1.725;

          let calorieModifier = 0;
          if (Array.isArray(data.primaryGoal)) {
              if (data.primaryGoal.includes("weight_loss")) calorieModifier = -500;
              else if (data.primaryGoal.includes("muscle_gain")) calorieModifier = 300;
          } else if (typeof data.primaryGoal === "string") {
              if (data.primaryGoal === "weight_loss") calorieModifier = -500;
              else if (data.primaryGoal === "muscle_gain") calorieModifier = 300;
          }

          const finalCalories = Math.round(tdee + calorieModifier);
          
          const protein = Math.round(weight * 2.2); 
          const fat = Math.round((finalCalories * 0.25) / 9); 
          const carbs = Math.round((finalCalories - (protein * 4) - (fat * 9)) / 4);

          return {
             calories: finalCalories,
             protein: protein > 0 ? protein : defaultGoals.protein,
             carbs: carbs > 0 ? carbs : defaultGoals.carbs,
             fat: fat > 0 ? fat : defaultGoals.fat
          };
       };

       const dynamicGoals = calculateDynamicGoals(userData);
       if (dynamicGoals) {
         setNutritionGoals(prev => {
           if (prev.calories === dynamicGoals.calories && prev.protein === dynamicGoals.protein) return prev;
           return dynamicGoals;
         });
       }
    }
  }, [userData]);

  // Fetch from backend
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

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
  }, []);

  // 2. Persistence Layer (Local fallback)
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
    const today = new Date().toISOString().split('T')[0];
    const todaysWater = waterLogs.filter(log => log.timestamp.startsWith(today));
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
    const today = new Date().toISOString().split('T')[0];
    // Find the last index of today's log
    const lastLogIdx = waterLogs.map(l => l.timestamp.startsWith(today)).lastIndexOf(true);
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


  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const toggleQuickLog = useCallback((val) => {
    setIsQuickLogOpen(prev => typeof val === 'boolean' ? val : !prev);
  }, []);

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
    updateGoal,
    refreshLogs,
    isQuickLogOpen,
    toggleQuickLog
  }), [foodLogs, waterLogs, nutritionGoals, totals, waterTotal, groupedLogs, addFoodLog, removeFoodLog, addWaterLog, removeWaterLog, updateGoal, refreshLogs, isQuickLogOpen, toggleQuickLog]);

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};
