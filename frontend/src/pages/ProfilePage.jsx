import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import useDocumentTitle from "../hooks/useDocumentTitle";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/Profilepage.module.css";
import { useUser } from "../context/UserContext";
import { updateUserProfileAPI, deleteUserProfileAPI } from "../api";



const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

const TRANSLATIONS = {
  english: {
    title: "Profile",
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    dob: "Date of Birth",
    gender: "Gender",
    physicalDetails: "Physical Details",
    currentWeight: "Current Weight",
    targetWeight: "Target Weight",
    height: "Height",
    activityLevel: "Activity Level",
    primaryGoal: "Primary Goal",
    preferences: "Account Settings & Preferences",
    emailNotifications: "Email Notifications",
    calorieSync: "Calorie & Macro Dynamic Sync",
    waterReminders: "Water Intake Reminders",
    language: "Preferred Language",
    appTheme: "App Theme",
    deleteAccount: "Delete Account",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    cancel: "Cancel"
  },
  spanish: {
    title: "Perfil",
    personalInfo: "Información Personal",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    dob: "Fecha de Nacimiento",
    gender: "Género",
    physicalDetails: "Detalles Físicos",
    currentWeight: "Peso Actual",
    targetWeight: "Peso Objetivo",
    height: "Altura",
    activityLevel: "Nivel de Actividad",
    primaryGoal: "Objetivo Principal",
    preferences: "Configuración y Preferencias",
    emailNotifications: "Notificaciones por Correo",
    calorieSync: "Sincronización Dinámica de Calorías",
    waterReminders: "Recordatorios de Agua",
    language: "Idioma Preferido",
    appTheme: "Tema de la Aplicación",
    deleteAccount: "Eliminar Cuenta",
    editProfile: "Editar Perfil",
    saveChanges: "Guardar Cambios",
    cancel: "Cancelar"
  },
  french: {
    title: "Profil",
    personalInfo: "Informations Personnelles",
    firstName: "Prénom",
    lastName: "Nom de Famille",
    email: "Adresse E-mail",
    dob: "Date de Naissance",
    gender: "Genre",
    physicalDetails: "Détails Physiques",
    currentWeight: "Poids Actuel",
    targetWeight: "Poids Cible",
    height: "Taille",
    activityLevel: "Niveau d'Activité",
    primaryGoal: "Objectif Principal",
    preferences: "Paramètres et Préférences",
    emailNotifications: "Notifications par E-mail",
    calorieSync: "Ajustement Dynamique des Calories",
    waterReminders: "Rappels d'Hydratation",
    language: "Langue Préférée",
    appTheme: "Thème de l'App",
    deleteAccount: "Supprimer le Compte",
    editProfile: "Modifier le Profil",
    saveChanges: "Enregistrer",
    cancel: "Annuler"
  },
  german: {
    title: "Profil",
    personalInfo: "Persönliche Daten",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse",
    dob: "Geburtsdatum",
    gender: "Geschlecht",
    physicalDetails: "Körperliche Details",
    currentWeight: "Aktuelles Gewicht",
    targetWeight: "Zielgewicht",
    height: "Größe",
    activityLevel: "Aktivitätslevel",
    primaryGoal: "Hauptziel",
    preferences: "Einstellungen & Präferenzen",
    emailNotifications: "E-Mail-Benachrichtigungen",
    calorieSync: "Dynamische Kaloriensynchronisierung",
    waterReminders: "Wasser-Erinnerungen",
    language: "Bevorzugte Sprache",
    appTheme: "App-Design",
    deleteAccount: "Konto Löschen",
    editProfile: "Profil Bearbeiten",
    saveChanges: "Änderungen Speichern",
    cancel: "Abbrechen"
  }
};

function ProfilePage() {
  useDocumentTitle("Profile");
  const { userData, updateUserData, sidebarCollapsed, toggleSidebar, logout } = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form data state - initialized from context
  const [personalInfo, setPersonalInfo] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    dob: userData.dob || "",
    gender: userData.gender || "male",
  });

  const [physicalInfo, setPhysicalInfo] = useState({
    currentWeight: userData.weightValue || "",
    targetWeight: userData.goalWeightValue || "",
    height: userData.heightCm || (userData.heightFeet ? `${userData.heightFeet}'${userData.heightInches || 0}"` : ""),
    activityLevel: userData.activityLevel || "moderate",
    primaryGoal: (() => {
      const raw = Array.isArray(userData.primaryGoal) ? userData.primaryGoal[0] : userData.primaryGoal || "maintain";
      const reverseMap = { weight_loss: "lose", muscle_gain: "build", maintain_weight: "maintain", build_endurance: "endurance" };
      return reverseMap[raw] || raw;
    })(),
  });


  // Snapshot to restore on cancel
  const [personalSnapshot, setPersonalSnapshot] = useState(null);
  const [physicalSnapshot, setPhysicalSnapshot] = useState(null);

  // Settings & Preferences state
  const [settings, setSettings] = useState({
    emailNotifications: userData?.emailNotifications ?? true,
    dynamicCalorieSync: userData?.dynamicCalorieSync ?? true,
    waterReminders: userData?.waterReminders ?? true,
    language: userData?.language ?? "english",
    darkMode: userData?.darkMode ?? true,
  });
  const [settingsSnapshot, setSettingsSnapshot] = useState(null);
  const t = TRANSLATIONS[settings?.language || "english"] || TRANSLATIONS.english;

  // Sync state if userData changes externally (e.g. from context updates)
  useEffect(() => {
    document.body.classList.remove("light-theme");
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setPersonalInfo({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        dob: userData.dob || "",
        gender: userData.gender || "male",
      });
      setPhysicalInfo({
        currentWeight: userData.weightValue || "",
        targetWeight: userData.goalWeightValue || "",
        height: userData.heightCm || (userData.heightFeet ? `${userData.heightFeet}'${userData.heightInches || 0}"` : ""),
        activityLevel: userData.activityLevel || "moderate",
        // Reverse-map long form back to short form for the select dropdown
        primaryGoal: (() => {
          const raw = Array.isArray(userData.primaryGoal) ? userData.primaryGoal[0] : userData.primaryGoal || "maintain";
          const reverseMap = { weight_loss: "lose", muscle_gain: "build", maintain_weight: "maintain", build_endurance: "endurance" };
          return reverseMap[raw] || raw;
        })(),
      });
      setSettings({
        emailNotifications: userData?.emailNotifications ?? true,
        dynamicCalorieSync: userData?.dynamicCalorieSync ?? true,
        waterReminders: userData?.waterReminders ?? true,
        language: userData?.language ?? "english",
        darkMode: userData?.darkMode ?? true,
      });
    }
  }, [userData, isEditing]);

  // --- Handlers ---


  const handleEdit = () => {
    setPersonalSnapshot({ ...personalInfo });
    setPhysicalSnapshot({ ...physicalInfo });
    setSettingsSnapshot({ ...settings });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPersonalInfo(personalSnapshot);
    setPhysicalInfo(physicalSnapshot);
    setSettings(settingsSnapshot);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserProfileAPI();
      logout();
      alert("Your account and all associated data have been permanently deleted.");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again later.");
    }
  };

  const handleSave = async () => {
    // Normalize short-form goal values from the select to the canonical long-form
    // used throughout the app (DashboardPage GOAL_CONTENT, nutritionUtils, etc.)
    const goalNormalizationMap = {
      lose: "weight_loss",
      build: "muscle_gain",
      maintain: "maintain_weight",
      endurance: "build_endurance",
    };
    const normalizedGoal =
      goalNormalizationMap[physicalInfo.primaryGoal] || physicalInfo.primaryGoal;

    // Sync back to global context
    const updatedData = {
      ...userData,
      ...personalInfo,
      ...settings,
      weightValue: physicalInfo.currentWeight,
      goalWeightValue: physicalInfo.targetWeight,
      activityLevel: physicalInfo.activityLevel,
      primaryGoal: [normalizedGoal],
    };
    
    // Handle height parsing if it was edited as a string (keep it simple for now)
    if (physicalInfo.height.includes("'")) {
       const [ft, inc] = physicalInfo.height.replace(/"/g, '').split("'");
       updatedData.heightFeet = ft;
       updatedData.heightInches = inc;
       updatedData.heightUnit = 'imperial';
    } else if (physicalInfo.height) {
       updatedData.heightCm = physicalInfo.height;
       updatedData.heightUnit = 'metric';
    }

    // Clear stale cached nutrition goals so the NutritionProvider
    // recalculates fresh goals from the new profile data immediately.
    const userId = userData?._id || userData?.id;
    if (userId) {
      localStorage.removeItem(`journal_nutrition_goals_${userId}`);
    }

    try {
      await updateUserProfileAPI(updatedData);
      updateUserData(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      // fallback: still update context so UI reflects the change
      updateUserData(updatedData);
      setIsEditing(false);
    }
  };

  const handlePersonalChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhysicalChange = (field, value) => {
    setPhysicalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = async (key, value) => {
    // 1. Update local settings state
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // 2. Prepare payload for backend API
    const goalNormalizationMap = {
      lose: "weight_loss",
      build: "muscle_gain",
      maintain: "maintain_weight",
      endurance: "build_endurance",
    };
    const normalizedGoal = goalNormalizationMap[physicalInfo.primaryGoal] || physicalInfo.primaryGoal;

    const updatedData = {
      ...userData,
      ...personalInfo,
      ...newSettings,
      weightValue: physicalInfo.currentWeight,
      goalWeightValue: physicalInfo.targetWeight,
      activityLevel: physicalInfo.activityLevel,
      primaryGoal: [normalizedGoal],
    };

    // Keep height synced
    if (physicalInfo.height.includes("'")) {
       const [ft, inc] = physicalInfo.height.replace(/"/g, '').split("'");
       updatedData.heightFeet = ft;
       updatedData.heightInches = inc;
       updatedData.heightUnit = 'imperial';
    } else if (physicalInfo.height) {
       updatedData.heightCm = physicalInfo.height;
       updatedData.heightUnit = 'metric';
    }

    // 4. Save to backend immediately
    try {
      await updateUserProfileAPI(updatedData);
      updateUserData(updatedData);
    } catch (err) {
      console.error("Failed to update preference", err);
      updateUserData(updatedData); // still sync context locally
    }
  };

  const toggleWeightUnit = (e) => {
    e.preventDefault();
    setPhysicalInfo(prev => {
      const val = parseFloat(prev.currentWeight);
      const targetVal = parseFloat(prev.targetWeight);
      if (userData.weightUnit === 'metric') {
        return {
          ...prev,
          currentWeight: isNaN(val) ? "" : (val * 2.20462).toFixed(1),
          targetWeight: isNaN(targetVal) ? "" : (targetVal * 2.20462).toFixed(1)
        };
      } else {
        return {
          ...prev,
          currentWeight: isNaN(val) ? "" : (val / 2.20462).toFixed(1),
          targetWeight: isNaN(targetVal) ? "" : (targetVal / 2.20462).toFixed(1)
        };
      }
    });
    updateUserData({ weightUnit: userData.weightUnit === 'metric' ? 'imperial' : 'metric' });
  };

  const toggleHeightUnit = (e) => {
    e.preventDefault();
    setPhysicalInfo(prev => {
      if (userData.heightUnit === 'metric') {
        const cm = parseFloat(prev.height);
        if (isNaN(cm)) return { ...prev, height: "5'9\"" };
        const totalInches = cm / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inc = Math.round(totalInches % 12);
        return { ...prev, height: `${ft}'${inc}"` };
      } else {
        const match = prev.height.match(/(\d+)'(\d+)"?/);
        if (!match) return { ...prev, height: "175" };
        const cm = (parseInt(match[1]) * 12 + parseInt(match[2])) * 2.54;
        return { ...prev, height: Math.round(cm).toString() };
      }
    });
    updateUserData({ heightUnit: userData.heightUnit === 'metric' ? 'imperial' : 'metric' });
  };


  const avatarFallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  return (
    <main className={styles.profileDashboard}>
      <header className={dashStyles.topNavbar}>
        <div className={dashStyles.navLeft}>
          <h1 className={dashStyles.pageTitle}>My Profile</h1>
        </div>
        <div className={dashStyles.navRight}>
          <button className={dashStyles.iconBtn} aria-label="Notifications">
            <BellIcon />
            <span className={dashStyles.badge}>3</span>
          </button>
          <Link to="/profile" className={dashStyles.profileDropdownBtn}>
            <div className={dashStyles.profileAvatar}>
              <img
                src="../assets/images/avatar-placeholder.png"
                alt="User Avatar"
                onError={(e) => {
                  e.target.src = avatarFallback;
                }}
              />
            </div>
          </Link>
        </div>
      </header>

      <div className={styles.profilePageContainer}>
        {/* Profile Header Card */}
        <div className={`${styles.profileHeaderCard} ${styles.card}`}>
          <div className={styles.profileAvatarLarge}>
            <img
              src="../assets/images/avatar-placeholder.png"
              alt="User Avatar"
              onError={(e) => {
                e.target.src = avatarFallback;
              }}
            />
            <button
              className={styles.editAvatarBtn}
              aria-label="Edit Avatar"
            >
              <EditIcon />
            </button>
          </div>

          <div className={styles.profileInfoBasic}>
            <h2>
              {personalInfo.firstName} {personalInfo.lastName}
            </h2>
            <p className={styles.roleText}>Fitness Enthusiast</p>
            <p className={styles.memberSince}>Member since Jan 2026</p>
          </div>

          <div className={styles.headerActions}>
            {!isEditing && (
              <button className={styles.primaryBtn} onClick={handleEdit}>
                {t.editProfile}
              </button>
            )}
            {isEditing && (
              <>
                <button className={styles.primaryBtn} onClick={handleSave}>
                  {t.saveChanges}
                </button>
                <button className={styles.btnCancel} onClick={handleCancel}>
                  {t.cancel}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Grid */}
        <div className={styles.profileGrid}>
          {/* Personal Information */}
          <div className={`${styles.card} ${styles.formCard}`}>
            <div className={styles.sectionHeader}>
              <h3>{t.personalInfo}</h3>
            </div>
            <div className={styles.profileForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t.firstName}</label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.lastName}</label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>{t.email}</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("email", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t.dob}</label>
                  <input
                    type="date"
                    value={personalInfo.dob}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("dob", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.gender}</label>
                  <select
                    value={personalInfo.gender}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("gender", e.target.value)
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">
                      Prefer not to say
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Details & Goals */}
          <div className={`${styles.card} ${styles.formCard}`}>
            <div className={styles.sectionHeader}>
              <h3>{t.physicalDetails}</h3>
            </div>
            <div className={styles.profileForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    {t.currentWeight} ({userData.weightUnit === "imperial" ? "lbs" : "kg"})
                    {isEditing && (
                      <button onClick={toggleWeightUnit} className={styles.inlineToggleBtn}>
                        Switch to {userData.weightUnit === "imperial" ? "kg" : "lbs"}
                      </button>
                    )}
                  </label>
                  <input
                    type="number"
                    value={physicalInfo.currentWeight}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePhysicalChange("currentWeight", e.target.value)
                    }
                  />
                  {!isEditing && physicalInfo.currentWeight && (
                    <span className={styles.unitHint}>
                      {userData.weightUnit === 'metric' 
                        ? `${(parseFloat(physicalInfo.currentWeight) * 2.20462).toFixed(1)} lbs`
                        : `${(parseFloat(physicalInfo.currentWeight) / 2.20462).toFixed(1)} kg`}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>{t.targetWeight} ({userData.weightUnit === "imperial" ? "lbs" : "kg"})</label>
                  <input
                    type="number"
                    value={physicalInfo.targetWeight}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePhysicalChange("targetWeight", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    {t.height} ({userData.heightUnit === "imperial" ? "ft'in\"" : "cm"})
                    {isEditing && (
                      <button onClick={toggleHeightUnit} className={styles.inlineToggleBtn}>
                        Switch to {userData.heightUnit === "imperial" ? "cm" : "ft'in\""}
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={physicalInfo.height}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePhysicalChange("height", e.target.value)
                    }
                    placeholder={userData.heightUnit === "imperial" ? "5'9\"" : "175"}
                  />
                  {!isEditing && physicalInfo.height && (
                    <span className={styles.unitHint}>
                      {userData.heightUnit === 'metric' 
                        ? (() => {
                            const totalInches = parseFloat(physicalInfo.height) / 2.54;
                            return `${Math.floor(totalInches / 12)}'${Math.round(totalInches % 12)}"`;
                          })()
                        : (() => {
                            const match = physicalInfo.height.match(/(\d+)'(\d+)"?/);
                            if (!match) return "";
                            return `${Math.round((parseInt(match[1]) * 12 + parseInt(match[2])) * 2.54)} cm`;
                          })()
                      }
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>{t.activityLevel}</label>
                  <select
                    value={physicalInfo.activityLevel}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePhysicalChange("activityLevel", e.target.value)
                    }
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very">Very Active</option>
                    <option value="extra">Extra Active</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>{t.primaryGoal}</label>
                  <select
                    value={physicalInfo.primaryGoal}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePhysicalChange("primaryGoal", e.target.value)
                    }
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="build">Build Muscle</option>
                    <option value="endurance">Improve Endurance</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Preferences Card (Full width / spans 2 columns) */}
          <div className={`${styles.card} ${styles.preferencesCard}`}>
            <div className={styles.sectionHeader}>
              <h3>{t.preferences}</h3>
            </div>
            <div className={styles.preferenceList}>
              <div className={styles.preferenceItem}>
                <div className={styles.prefInfo}>
                  <h4>{t.emailNotifications}</h4>
                  <p>Receive weekly digest, customized progress reports, and activity insights via email.</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handlePreferenceChange("emailNotifications", e.target.checked)
                    }
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.prefInfo}>
                  <h4>{t.calorieSync}</h4>
                  <p>Automatically adjust daily calorie and macronutrient targets based on your weight logs.</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.dynamicCalorieSync}
                    onChange={(e) =>
                      handlePreferenceChange("dynamicCalorieSync", e.target.checked)
                    }
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.prefInfo}>
                  <h4>{t.waterReminders}</h4>
                  <p>Receive friendly in-app alerts and notifications to meet your daily hydration target.</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.waterReminders}
                    onChange={(e) =>
                      handlePreferenceChange("waterReminders", e.target.checked)
                    }
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>

              {/* Language Selection */}
              <div className={styles.preferenceItem}>
                <div className={styles.prefInfo}>
                  <h4>{t.language}</h4>
                  <p>Choose your preferred language for the dashboard, logs, and workout plans.</p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", minWidth: "150px" }}>
                  <select
                    value={settings.language || "english"}
                    onChange={(e) =>
                      handlePreferenceChange("language", e.target.value)
                    }
                    style={{
                      background: settings.darkMode ? "#1e293b" : "#ffffff",
                      border: settings.darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                      color: settings.darkMode ? "#ffffff" : "#0f172a",
                      padding: "0.5rem 2.5rem 0.5rem 1rem",
                      borderRadius: "8px",
                      outline: "none",
                      width: "140px",
                      cursor: "pointer",
                      height: "40px",
                      fontFamily: "inherit",
                      fontSize: "0.9rem"
                    }}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
              <div className={styles.prefInfo}>
                <h4>{t.deleteAccount}</h4>
                <p>Permanently delete all your workout journals, meal history, and profile data. This cannot be undone.</p>
              </div>
              <button
                className={styles.btnDanger}
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteConfirm(true);
                }}
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}
        >
          <div
            style={{
              background: settings.darkMode ? "#121216" : "#ffffff",
              border: settings.darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "420px",
              width: "100%",
              boxShadow: settings.darkMode ? "0 20px 40px rgba(0, 0, 0, 0.6)" : "0 10px 25px rgba(0, 0, 0, 0.08)",
              textAlign: "center"
            }}
          >
            <h3
              style={{
                color: settings.darkMode ? "#ffffff" : "#0f172a",
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                fontFamily: "inherit"
              }}
            >
              Delete Account
            </h3>
            <p
              style={{
                color: settings.darkMode ? "rgba(255, 255, 255, 0.6)" : "#475569",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                marginBottom: "1.75rem",
                fontFamily: "inherit"
              }}
            >
              Deleting your account will permanently remove all of your profile preferences, workout records, and logs. This action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center"
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: settings.darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)",
                  border: settings.darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                  color: settings.darkMode ? "#ffffff" : "#0f172a",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  background: "rgb(239, 68, 68)",
                  border: "none",
                  color: "#ffffff",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                  transition: "all 0.2s"
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Theme Selection Modal */}
      {showThemeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}
        >
          <div
            style={{
              background: "rgba(18, 18, 22, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
              textAlign: "center"
            }}
          >
            <h3
              style={{
                color: "#ffffff",
                fontSize: "1.3rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                fontFamily: "inherit"
              }}
            >
              Select App Theme
            </h3>
            
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "2rem"
              }}
            >
              {/* Option 1: Dark Mode */}
              <button
                type="button"
                onClick={() => {
                  handlePreferenceChange("darkMode", true);
                  setShowThemeModal(false);
                }}
                style={{
                  background: settings.darkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                  border: settings.darkMode ? "1px solid rgb(16, 185, 129)" : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "1.2rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.95rem", display: "flex", justifyContent: "space-between" }}>
                  <span>Dark (Default)</span>
                  {settings.darkMode && <span style={{ color: "rgb(16, 185, 129)" }}>✓</span>}
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  Elegant slate dark theme tailored for high-contrast viewing.
                </div>
              </button>

              {/* Option 2: Light Mode */}
              <button
                type="button"
                onClick={() => {
                  handlePreferenceChange("darkMode", false);
                  setShowThemeModal(false);
                }}
                style={{
                  background: !settings.darkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                  border: !settings.darkMode ? "1px solid rgb(16, 185, 129)" : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "1.2rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.95rem", display: "flex", justifyContent: "space-between" }}>
                  <span>Light Theme</span>
                  {!settings.darkMode && <span style={{ color: "rgb(16, 185, 129)" }}>✓</span>}
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  Clean, classic high-contrast light slate theme styles.
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowThemeModal(false)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.2s"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;
