import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnBoardingQuestions from "./pages/OnBoardingQuestions";
import DashboardPage from "./pages/DashboardPage";
import NutritionPage from "./pages/NutritionPage";
import NutritionGuidancePage from "./pages/NutritionGuidancePage";
import WorkoutPlansPage from "./pages/WorkoutPlansPage";
import WorkoutGuidancePage from "./pages/WorkoutGuidancePage";
import ProgressTracker from "./pages/ProgressTracker";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnBoardingQuestions />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/nutrition-guidance" element={<NutritionGuidancePage />} />
          <Route path="/workouts" element={<WorkoutPlansPage />} />
          <Route path="/workout-guidance" element={<WorkoutGuidancePage />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* Default route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
