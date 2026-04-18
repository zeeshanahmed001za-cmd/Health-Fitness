import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import useDocumentTitle from "../hooks/useDocumentTitle";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/Profilepage.module.css";
import { useUser } from "../context/UserContext";
import { updateUserProfileAPI } from "../api";


// Icons
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
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

function ProfilePage() {
  useDocumentTitle("Profile");
  const { userData, updateUserData, sidebarCollapsed, toggleSidebar } = useUser();

  // Sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);



  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form data state - initialized from context
  const [personalInfo, setPersonalInfo] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phone: userData.phone || "",
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

  // Sync state if userData changes externally (e.g. from context updates)
  useEffect(() => {
    if (!isEditing) {
      setPersonalInfo({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
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
    }
  }, [userData, isEditing]);

  // --- Handlers ---
  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebar();
    }
  };

  const handleEdit = () => {
    setPersonalSnapshot({ ...personalInfo });
    setPhysicalSnapshot({ ...physicalInfo });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPersonalInfo(personalSnapshot);
    setPhysicalInfo(physicalSnapshot);
    setIsEditing(false);
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
          <button
            className={dashStyles.toggleSidebarBtn}
            onClick={handleSidebarToggle}
            aria-label="Toggle Sidebar"
          >
            <HamburgerIcon />
          </button>
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
                Edit Profile
              </button>
            )}
            {isEditing && (
              <>
                <button className={styles.primaryBtn} onClick={handleSave}>
                  Save Changes
                </button>
                <button className={styles.btnCancel} onClick={handleCancel}>
                  Cancel
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
              <h3>Personal Information</h3>
            </div>
            <div className={styles.profileForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
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
                  <label>Last Name</label>
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
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("email", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePersonalChange("phone", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date of Birth</label>
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
                  <label>Gender</label>
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
              <h3>Physical Details & Goals</h3>
            </div>
            <div className={styles.profileForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Current Weight ({userData.weightUnit === "imperial" ? "lbs" : "kg"})
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
                  <label>Target Weight ({userData.weightUnit === "imperial" ? "lbs" : "kg"})</label>
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
                    Height ({userData.heightUnit === "imperial" ? "ft'in\"" : "cm"})
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
                  <label>Activity Level</label>
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
                  <label>Primary Goal</label>
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

        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
