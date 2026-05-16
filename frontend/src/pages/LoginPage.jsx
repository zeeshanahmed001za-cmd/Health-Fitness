import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useUser } from "../context/UserContext";
import { loginUserAPI, forgotPasswordAPI } from "../api";
import googleIcon from "../assets/images/google.svg";
import facebookIcon from "../assets/images/facebook.svg";
import { EyeOpen, EyeClose, SpinnerIcon } from "../components/Icons";

const emailPolicy = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const passwordPolicy = (password) => password.length > 0;

function LoginPage() {
  useDocumentTitle("Login");
  const navigate = useNavigate();
  const { updateUserData, logout } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [termsError, setTermsError] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const getGroupClass = (status) => {
    if (status === true) return `${styles.inputGroup} ${styles.success}`;
    if (status === false) return `${styles.inputGroup} ${styles.error}`;
    return styles.inputGroup;
  };

  const handleEmailBlur = () => {
    if (email.trim() === "") {
      setEmailStatus(null);
      return;
    }
    setEmailStatus(emailPolicy(email.trim()));
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailStatus === false) setEmailStatus(emailPolicy(val.trim()) || null);
  };

  const handlePasswordBlur = () => {
    if (password.trim() === "") {
      setPasswordStatus(null);
      return;
    }
    setPasswordStatus(passwordPolicy(password));
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (passwordStatus === false)
      setPasswordStatus(passwordPolicy(val) || null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError("");
    
    if (!email.trim() || !emailPolicy(email.trim())) {
      setForgotError("Please enter a valid email address to reset password.");
      setEmailStatus(false);
      return;
    }

    setIsForgotSubmitting(true);
    try {
      const data = await forgotPasswordAPI(email.trim());
      setForgotMessage(data.message || "Password reset link sent to your email.");
    } catch (error) {
      setForgotError(error.message || "Failed to send reset link.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = emailPolicy(email.trim());
    const isPasswordValid = passwordPolicy(password);
    const isTermsValid = termsChecked;

    setEmailStatus(isEmailValid);
    setPasswordStatus(isPasswordValid);
    setTermsError(!isTermsValid);
    setApiError("");

    if (isEmailValid && isPasswordValid && isTermsValid) {
      setIsSubmitting(true);
      try {
        const data = await loginUserAPI(email.trim(), password);
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userSession", JSON.stringify(data));
        updateUserData(data);
        navigate("/dashboard");
      } catch (error) {
        setApiError(error.message || "Failed to log in.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <nav className={styles.navBar}>
        <Link to="/" className={styles.logoLink}>
          <h1>Health & Fitness</h1>
        </Link>
      </nav>

      <div className={styles.splitWrapper}>
        <div className={styles.visualSide}>
          <div className={styles.overlay}></div>
          <div className={styles.visualContent}>
            <h2>Welcome Back</h2>
            <p>Continue your journey towards a healthier, stronger you.</p>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Log in to your account</h2>
              <p>Enter your details below to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={getGroupClass(emailStatus)}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="EmailInput"
                    className={styles.floatInput}
                    placeholder=" "
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    required
                  />
                  <label htmlFor="EmailInput" className={styles.floatLabel}>Email Address</label>
                </div>
                <span className={styles.errorText}>Please enter a valid email address.</span>
              </div>

              <div className={getGroupClass(passwordStatus)}>
                <div className={styles.passwordWrapper}>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="PasswordInput"
                      className={styles.floatInput}
                      placeholder=" "
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={handlePasswordBlur}
                      required
                    />
                    <label htmlFor="PasswordInput" className={styles.floatLabel}>Password</label>
                  </div>
                  <button
                    type="button"
                    className={styles.TogglePassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeClose /> : <EyeOpen />}
                  </button>
                </div>
                <span className={styles.errorText}>Please enter your password.</span>
                
                {forgotMessage && <div style={{ color: "green", fontSize: "0.875rem", marginTop: "0.5rem" }}>{forgotMessage}</div>}
                {forgotError && <div style={{ color: "red", fontSize: "0.875rem", marginTop: "0.5rem" }}>{forgotError}</div>}
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={styles.forgotPassword}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", color: "inherit", marginTop: "0.5rem" }}
                  disabled={isForgotSubmitting}
                >
                  {isForgotSubmitting ? "Sending..." : "Forgot Password?"}
                </button>
              </div>

              <div className={`${styles.termsGroup} ${termsError ? styles.error : ""}`}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id="checkBoxInput"
                    className={styles.customCheckbox}
                    checked={termsChecked}
                    onChange={(e) => {
                      setTermsChecked(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                  />
                  <label htmlFor="checkBoxInput">I agree to Terms & Conditions</label>
                </div>
                <span className={styles.errorText}>You must agree to the terms to continue.</span>
              </div>

              {apiError && <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem" }}>{apiError}</div>}

              <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <SpinnerIcon size={18} /> Logging in...
                  </span>
                ) : "Log in"}
              </button>

              <div className={styles.divider}><span>Or continue with</span></div>

              <div className={styles.socialLogin}>
                <button type="button" className={`${styles.socialBtn} ${styles.googleBtn}`}>
                  <img src={googleIcon} alt="Google" /> Google
                </button>
                <button type="button" className={`${styles.socialBtn} ${styles.facebookBtn}`}>
                  <img src={facebookIcon} alt="Facebook" /> Facebook
                </button>
              </div>

              <p className={styles.signupPrompt}>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
