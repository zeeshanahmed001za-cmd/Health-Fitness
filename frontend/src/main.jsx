import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext";
import { NutritionProvider } from "./context/NutritionProvider.jsx";

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <NutritionProvider>
        <GoogleOAuthProvider clientId={clientId || "76587571141-4p9aop2m40l43b9bvnk2lt5bgm3g838a.apps.googleusercontent.com"}>
          <App />
        </GoogleOAuthProvider>
      </NutritionProvider>
    </UserProvider>
  </StrictMode>,
);
