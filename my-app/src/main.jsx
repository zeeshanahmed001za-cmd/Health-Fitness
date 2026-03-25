import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext";
import { NutritionProvider } from "./context/NutritionContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <NutritionProvider>
        <App />
      </NutritionProvider>
    </UserProvider>
  </StrictMode>,
);
