import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/SignUpPage.module.css";
import { useUser } from "../context/UserContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

import googleIcon from "../assets/images/google.svg";
import facebookIcon from "../assets/images/facebook.svg";
import { EyeOpen, EyeClose } from "../components/Icons";

const emailPolicy = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordPolicy = (password) =>
  password.length >= 10 && !/\s/.test(password);



function SignUpPage() {
  useDocumentTitle("Create Account");
  const navigate = useNavigate();

  const { updateUserData } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // FIX 2: removed isSubmitting state — no real async op exists yet,
  // so it was locking the button permanently after navigate() fired.
  // Add it back properly with try/catch/finally once a real API call exists.

  // Validation states
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // FIX 2: handleSubmit is now synchronous and clean — no orphaned isSubmitting
  const handleSubmit = (e) => {
    e.preventDefault();

    const isEmailValid = emailPolicy(email.trim());
    const isPasswordValid = passwordPolicy(password);
    const isTermsValid = termsChecked;

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);
    setTermsError(!isTermsValid);

    if (isEmailValid && isPasswordValid && isTermsValid) {
      updateUserData({ email });
      navigate("/dashboard");
    }
  };

  // FIX 4: dynamic password hint helpers
  const tooShort = password.length > 0 && password.length < 10;
  const hasSpaces = password.length > 0 && /\s/.test(password);
  const passwordValid = password.length >= 10 && !/\s/.test(password);

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

          {/* FIX 1: removed id={styles.signupForm} — was passing a hashed
                        CSS module class name as an id, which is the wrong type entirely */}
          <form
            className={styles.signupForm}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Email Input */}
            <div
              className={`${styles.inputGroup} ${emailError ? styles.error : ""}`}
            >
              <input
                type="email"
                className={styles.floatInput}
                placeholder=" "
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError)
                    setEmailError(!emailPolicy(e.target.value.trim()));
                }}
                required
              />
              <label className={styles.floatLabel}>Email address</label>
              <span className={styles.errorText}>
                Please enter a valid email address.
              </span>
            </div>

            {/* Password Input */}
            <div
              className={`${styles.inputGroup} ${passwordError ? styles.error : ""}`}
            >
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.floatInput}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError)
                      setPasswordError(!passwordPolicy(e.target.value));
                  }}
                  required
                />
                <label className={styles.floatLabel}>Create a password</label>
                <button
                  type="button"
                  className={styles.TogglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>

              {/* FIX 4: dynamic hint — tells user exactly which rule they're failing */}
              {password.length === 0 ? (
                <p className={styles.passwordHint}>
                  Must be at least 10 characters, no spaces.
                </p>
              ) : passwordValid ? (
                <p
                  className={`${styles.passwordHint} ${styles.passwordHintSuccess}`}
                >
                  ✓ Looks good
                </p>
              ) : (
                <p
                  className={`${styles.passwordHint} ${styles.passwordHintWarn}`}
                >
                  {tooShort && (
                    <span>
                      {10 - password.length} more character
                      {10 - password.length !== 1 ? "s" : ""} needed.{" "}
                    </span>
                  )}
                  {hasSpaces && <span>Remove spaces.</span>}
                </p>
              )}

              <span className={styles.errorText}>
                Password does not meet requirements.
              </span>
            </div>

            <div className={styles.recaptchaText}>
              <p>
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="#">Privacy Policy</a> and <a href="#">Terms</a> apply.
              </p>
            </div>

            {/* Terms */}
            <div
              className={`${styles.termsGroup} ${termsError ? styles.error : ""}`}
            >
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
                <label>
                  I agree to Health & Fitness <a href="#">Terms & Conditions</a>{" "}
                  and <a href="#">Privacy Policy</a>.
                </label>
              </div>
              <span className={styles.errorText}>
                You must agree to the terms to continue.
              </span>
            </div>

            {/* Submit — FIX 2: no isSubmitting, button never locks */}
            <button type="submit" className={styles.primaryBtn}>
              Sign Up
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            {/* FIX 3: social buttons are disabled with title tooltip until implemented —
                            previously they were clickable but did absolutely nothing silently */}
            <div className={styles.socialLogin}>
              <button
                type="button"
                className={styles.socialBtn}
                disabled
                title="Coming soon"
              >
                <img src={googleIcon} alt="Google" />
                Continue with Google
              </button>
              <button
                type="button"
                className={styles.socialBtn}
                disabled
                title="Coming soon"
              >
                <img src={facebookIcon} alt="Facebook" />
                Continue with Facebook
              </button>
              <p className={styles.socialHint}>
                We will never post anything without your permission
              </p>
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
