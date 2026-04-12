import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useUser } from "../context/UserContext";
import { loginUserAPI, forgotPasswordAPI } from "../api";
import googleIcon from "../assets/images/google.svg";
import facebookIcon from "../assets/images/facebook.svg";
import { EyeOpen, EyeClose } from "../components/Icons";

const emailPolicy = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordPolicy = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(
    password,
  );



function LoginPage() {
  useDocumentTitle("Login");
  const navigate = useNavigate();
  const { updateUserData, logout } = useUser();

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      logout();
    }
  }, [logout]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Track validation states: null = untouched, true = success, false = error
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
    // Only live-correct if already showing error
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
        console.log("Validation passed. Redirecting to dashboard...");
        navigate("/dashboard");
      } catch (error) {
        setApiError(error.message || "Failed to log in. Please check your credentials.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Validation failed. Please correct the errors.");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className={styles.navBar}>
        <Link to="/" className={styles.logoLink}>
          <h1>Health & Fitness</h1>
        </Link>
      </nav>

      <div className={styles.splitWrapper}>
        {/* Left Visual Side */}
        <div className={styles.visualSide}>
          <div className={styles.overlay}></div>
          <div className={styles.visualContent}>
            <h2>Welcome Back</h2>
            <p>
              Pick up where you left off. Continue your journey towards a
              healthier, stronger you.
            </p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Log in to your account</h2>
              <p>Enter your details below to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
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
                  <label htmlFor="EmailInput" className={styles.floatLabel}>
                    Email Address
                  </label>
                </div>
                <span className={styles.errorText}>
                  Please enter a valid email address.
                </span>
              </div>

              {/* Password Input */}
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
                    <label htmlFor="PasswordInput" className={styles.floatLabel}>
                      Password
                    </label>
                  </div>
                  <button
                    type="button"
                    className={styles.TogglePassword}
                    aria-label="Toggle Password Visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeClose /> : <EyeOpen />}
                  </button>
                </div>
                <span className={styles.errorText}>
                  Must be 10+ chars with symbols & numbers.
                </span>
                
                {forgotMessage && (
                  <div style={{ color: "green", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    {forgotMessage}
                  </div>
                )}
                {forgotError && (
                  <div style={{ color: "red", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    {forgotError}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={styles.forgotPassword}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", color: "inherit", marginTop: "0.5rem" }}
                  disabled={isForgotSubmitting}
                >
                  {isForgotSubmitting ? "Sending..." : "Forgot Password?"}
                </button>
              </div>

              {/* Terms & Conditions */}
              <div
                className={`${styles.termsGroup} ${termsError ? styles.error : ""}`}
              >
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
                  <label htmlFor="checkBoxInput">
                    I agree to Health & Fitness{" "}
                    <a href="#">Terms & Conditions</a>
                  </label>
                </div>
                <span className={styles.errorText}>
                  You must agree to the terms to continue.
                </span>
              </div>

              {apiError && (
                <div style={{ color: "red", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {apiError}
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>

              {/* Divider */}
              <div className={styles.divider}>
                <span>Or continue with</span>
              </div>

              {/* Social Login */}
              <div className={styles.socialLogin}>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.googleBtn}`}
                >
                  <img src={googleIcon} alt="Google" />
                  Google
                </button>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.facebookBtn}`}
                >
                  <img src={facebookIcon} alt="Facebook" />
                  Facebook
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
