const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('onboardingData');

        // Only redirect if not already on auth pages to avoid infinite reloads/state loss
        if (!['/login', '/signup'].includes(window.location.pathname)) {
            window.location.href = '/login';
        }
        throw new Error(data.message || 'Session expired. Please login again.');
    }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

const fetchWithAuth = async (endpoint, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    });
    return handleResponse(res);
};

export const loginUserAPI = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
};

export const forgotPasswordAPI = async (email) => {
    const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const registerUserAPI = async (email, password, name = 'User') => {
    const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return handleResponse(res);
};

export const getUserProfileAPI = async () => {
    return fetchWithAuth('/users/profile');
};

export const updateUserProfileAPI = async (profileData) => {
    return fetchWithAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

export const logWorkoutAPI = async (workoutData) => {
    return fetchWithAuth('/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutData)
    });
};

export const getWorkoutsAPI = async () => {
    return fetchWithAuth('/workouts');
};

export const deleteWorkoutAPI = async (id) => {
    return fetchWithAuth(`/workouts/${id}`, {
        method: 'DELETE'
    });
};

export const addProgressAPI = async (progressData) => {
    return fetchWithAuth('/progress', {
        method: 'POST',
        body: JSON.stringify(progressData)
    });
};

export const getProgressHistoryAPI = async () => {
    return fetchWithAuth('/progress');
};

// --- NUTRITION ---
export const addNutritionLogAPI = async (logData) => {
    return fetchWithAuth('/nutrition', {
        method: 'POST',
        body: JSON.stringify(logData)
    });
};

export const getNutritionLogsAPI = async () => {
    return fetchWithAuth('/nutrition');
};

export const deleteNutritionLogAPI = async (id) => {
    return fetchWithAuth(`/nutrition/${id}`, {
        method: 'DELETE'
    });
};

export const quickLogAPI = async (text) => {
    return fetchWithAuth('/nutrition/quick-log', {
        method: 'POST',
        body: JSON.stringify({ text })
    });
};
