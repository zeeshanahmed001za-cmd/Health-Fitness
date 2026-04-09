const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const loginUserAPI = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to login');
    return data;
};

export const registerUserAPI = async (email, password, name = 'User') => {
    const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to register');
    return data;
};

export const getUserProfileAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
};

export const updateUserProfileAPI = async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
};

export const logWorkoutAPI = async (workoutData) => {
    const res = await fetch(`${API_BASE_URL}/workouts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workoutData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to log workout');
    return data;
};

export const getWorkoutsAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/workouts`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch workouts');
    return data;
};

export const deleteWorkoutAPI = async (id) => {
    const res = await fetch(`${API_BASE_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete workout');
    return data;
};

export const addProgressAPI = async (progressData) => {
    const res = await fetch(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(progressData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add progress');
    return data;
};

export const getProgressHistoryAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/progress`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch progress');
    return data;
};

// --- NUTRITION ---
export const addNutritionLogAPI = async (logData) => {
    const res = await fetch(`${API_BASE_URL}/nutrition`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(logData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to log nutrition');
    return data;
};

export const getNutritionLogsAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/nutrition`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch nutrition logs');
    return data;
};

export const deleteNutritionLogAPI = async (id) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete nutrition log');
    return data;
};
