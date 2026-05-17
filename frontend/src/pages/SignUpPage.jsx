import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/SignUpPage.module.css";
import { useUser } from "../context/UserContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { registerUserAPI, updateUserProfileAPI, googleLoginAPI } from "../api";
import { useGoogleLogin } from '@react-oauth/google';
import googleIcon from "../assets/images/google.svg";
import facebookIcon from "../assets/images/facebook.svg";
import { EyeOpen, EyeClose, SpinnerIcon } from "../components/Icons";

const emailPolicy = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const passwordPolicy = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password) &&
  !/\s/.test(password);

function SignUpPage() {
  useDocumentTitle("Create Account");
  const navigate = useNavigate();
  const { userData, updateUserData } = useUser();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleSubmitting(true);
      try {
        const data = await googleLoginAPI(tokenResponse.access_token, true);
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userSession", JSON.stringify(data));
        
        try {
           const fullData = { ...userData, ...data };
           await updateUserProfileAPI(fullData);
           updateUserData(fullData);
        } catch(updateErr) {
           console.error("Failed to sync onboarding data", updateErr);
           updateUserData(data);
        }

        navigate("/dashboard");
      } catch (error) {
        setApiError(error.message || "Failed to log in with Google.");
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed', error);
      setApiError("Google Login Failed. Please try again.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = emailPolicy(email.trim());
    const isPasswordValid = passwordPolicy(password);
    const isTermsValid = termsChecked;

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);
    setTermsError(!isTermsValid);

    if (isEmailValid && isPasswordValid && isTermsValid) {
      setIsSubmitting(true);
      try {
        const name = userData.firstName ? `${userData.firstName} ${userData.lastName || ""}`.trim() : "User";
        const data = await registerUserAPI(email.trim(), password, name);
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userSession", JSON.stringify(data));
        
        try {
           const fullData = { ...userData, ...data, email: email.trim() };
           await updateUserProfileAPI(fullData);
           updateUserData(fullData);
        } catch(err) {
           updateUserData({ ...data, email: email.trim() });
        }
        navigate("/dashboard");
      } catch (error) {
        setApiError(error.message || "Failed to create account.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const tooShort = password.length > 0 && password.length < 8;
  const hasSpaces = password.length > 0 && /\s/.test(password);
  const lacksUpper = password.length > 0 && !/[A-Z]/.test(password);
  const lacksLower = password.length > 0 && !/[a-z]/.test(password);
  const lacksNumber = password.length > 0 && !/[0-9]/.test(password);
  const lacksSpecial = password.length > 0 && !/[^A-Za-z0-9]/.test(password);
  const passwordValid = password.length > 0 && passwordPolicy(password);

  return (
    <div className={styles.pageBody}>
      <nav className={styles.navBar}>
        <Link to="/" className={styles.logoLink}>
          <h1>Health & Fitness</h1>
        </Link>
      </nav>

      <div className={styles.signupWrapper}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Almost there! Create your account.</h2>
          </div>

          <form className={styles.signupForm} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.inputGroup} ${emailError ? styles.error : ""}`}>
              <input
                type="email"
                className={styles.floatInput}
                placeholder=" "
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(!emailPolicy(e.target.value.trim()));
                }}
                required
              />
              <label className={styles.floatLabel}>Email address</label>
              <span className={styles.errorText}>Please enter a valid email address.</span>
            </div>

            <div className={`${styles.inputGroup} ${passwordError ? styles.error : ""}`}>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.floatInput}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(!passwordPolicy(e.target.value));
                  }}
                  required
                />
                <label className={styles.floatLabel}>Create a password</label>
                <button type="button" className={styles.TogglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>

              {password.length === 0 ? (
                <p className={styles.passwordHint}>At least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.</p>
              ) : passwordValid ? (
                <p className={`${styles.passwordHint} ${styles.passwordHintSuccess}`}>✓ Looks good</p>
              ) : (
                <p className={`${styles.passwordHint} ${styles.passwordHintWarn}`}>
                  {tooShort && <span>{8 - password.length} more chars needed. </span>}
                  {hasSpaces && <span>Remove spaces. </span>}
                  {lacksUpper && <span>Add uppercase. </span>}
                  {lacksLower && <span>Add lowercase. </span>}
                  {lacksNumber && <span>Add number. </span>}
                  {lacksSpecial && <span>Add special char. </span>}
                </p>
              )}
              <span className={styles.errorText}>Password does not meet requirements.</span>
            </div>

            <div className={styles.recaptchaText}>
              <p>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms apply.</p>
            </div>

            <div className={`${styles.termsGroup} ${termsError ? styles.error : ""}`}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.customCheckbox}
                  checked={termsChecked}
                  onChange={(e) => {
                    setTermsChecked(e.target.checked);
                    if (termsError && e.target.checked) setTermsError(false);
                  }}
                  required
                />
                <label>I agree to Terms & Conditions and Privacy Policy.</label>
              </div>
              <span className={styles.errorText}>You must agree to the terms to continue.</span>
            </div>

            {apiError && <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem" }}>{apiError}</div>}

            <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <SpinnerIcon size={18} /> Signing Up...
                </span>
              ) : "Sign Up"}
            </button>

            <div className={styles.divider}><span>or</span></div>

            <div className={styles.socialLogin}>
              <button 
                type="button" 
                className={styles.socialBtn}
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleSubmitting}
              >
                {isGoogleSubmitting ? <SpinnerIcon size={18} /> : <img src={googleIcon} alt="Google" />}
                {isGoogleSubmitting ? "Wait..." : "Continue with Google"}
              </button>
              <button type="button" className={styles.socialBtn} disabled title="Coming soon">
                <img src={facebookIcon} alt="Facebook" /> Continue with Facebook
              </button>
            </div>

            <p className={styles.signupPrompt}>
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
