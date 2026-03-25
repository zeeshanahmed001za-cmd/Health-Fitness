import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useDocumentTitle from "../hooks/useDocumentTitle";

import dashStyles from "../styles/Dashboard.module.css";
import styles from "../styles/Profilepage.module.css";
import { useUser } from "../context/UserContext";

// --- Static initial data (later this will come from API/auth) ---
const initialPersonalInfo = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.j@example.com",
  phone: "+1 (555) 123-4567",
  dob: "1990-05-15",
  gender: "female",
};

const initialPhysicalInfo = {
  currentWeight: "68",
  targetWeight: "65",
  height: "165",
  activityLevel: "moderate",
  primaryGoal: "build",
};

const initialPreferences = {
  emailNotifications: true,
  smsReminders: false,
  publicProfile: true,
};

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
  const { userData, updateUserData } = useUser();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form data state - merge context data with defaults
  const [personalInfo, setPersonalInfo] = useState({
    ...initialPersonalInfo,
    firstName: userData.firstName || initialPersonalInfo.firstName,
    lastName: userData.lastName || initialPersonalInfo.lastName,
    dob: userData.dob || initialPersonalInfo.dob,
    gender: userData.gender || initialPersonalInfo.gender,
  });
  const [physicalInfo, setPhysicalInfo] = useState({
    ...initialPhysicalInfo,
    currentWeight: userData.weightValue || initialPhysicalInfo.currentWeight,
    targetWeight: userData.goalWeightValue || initialPhysicalInfo.targetWeight,
    height:
      userData.heightCm || userData.heightFeet || initialPhysicalInfo.height,
    activityLevel: userData.activityLevel || initialPhysicalInfo.activityLevel,
    primaryGoal: userData.primaryGoal?.[0] || initialPhysicalInfo.primaryGoal,
  });
  const [preferences, setPreferences] = useState(initialPreferences);

  // Snapshot to restore on cancel
  const [personalSnapshot, setPersonalSnapshot] = useState(null);
  const [physicalSnapshot, setPhysicalSnapshot] = useState(null);

  // --- Handlers ---
  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const handleEdit = () => {
    // Save snapshots before editing
    setPersonalSnapshot({ ...personalInfo });
    setPhysicalSnapshot({ ...physicalInfo });
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Restore snapshots
    setPersonalInfo(personalSnapshot);
    setPhysicalInfo(physicalSnapshot);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Sync back to context
    updateUserData({
      ...personalInfo,
      ...physicalInfo,
      weightValue: physicalInfo.currentWeight,
      goalWeightValue: physicalInfo.targetWeight,
    });
    console.log("Saving profile...", { personalInfo, physicalInfo });
    setIsEditing(false);
  };

  const handlePersonalChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhysicalChange = (field, value) => {
    setPhysicalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const avatarFallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  return (
    <div className={dashStyles.pageWrapper}>
      <Sidebar
        activePage="profile"
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className={dashStyles.mainWrapper}>
        {/* Top Navbar */}
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

        {/* Main Content */}
        <main className={styles.profileDashboard}>
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
                      <label>Current Weight (kg)</label>
                      <input
                        type="number"
                        value={physicalInfo.currentWeight}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handlePhysicalChange("currentWeight", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Target Weight (kg)</label>
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
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        value={physicalInfo.height}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handlePhysicalChange("height", e.target.value)
                        }
                      />
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

              {/* Preferences */}
              <div className={`${styles.card} ${styles.preferencesCard}`}>
                <div className={styles.sectionHeader}>
                  <h3>Preferences</h3>
                </div>

                <div className={styles.preferenceList}>
                  {[
                    {
                      key: "emailNotifications",
                      title: "Email Notifications",
                      desc: "Receive daily summaries and goal updates.",
                    },
                    {
                      key: "smsReminders",
                      title: "SMS Reminders",
                      desc: "Get text reminders for scheduled workouts.",
                    },
                    {
                      key: "publicProfile",
                      title: "Public Profile",
                      desc: "Allow other users to view your achievements and progress.",
                    },
                  ].map((pref) => (
                    <div key={pref.key} className={styles.preferenceItem}>
                      <div className={styles.prefInfo}>
                        <h4>{pref.title}</h4>
                        <p>{pref.desc}</p>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={preferences[pref.key]}
                          onChange={() => handlePreferenceToggle(pref.key)}
                        />
                        <span
                          className={`${styles.slider} ${styles.round}`}
                        ></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className={styles.dangerZone}>
                  <div>
                    <h4>Danger Zone</h4>
                    <p>Irreversible and destructive actions.</p>
                  </div>
                  <button className={styles.btnDanger}>Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
