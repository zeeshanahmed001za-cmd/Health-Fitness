import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/SignUpPage.module.css';
import { useUser } from '../context/UserContext';

const emailPolicy = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordPolicy = password => password.length >= 10 && !/\s/.test(password);

const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeClose = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

function SignUpPage() {
    const navigate = useNavigate();
    const { updateUserData } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsChecked, setTermsChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation states
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [termsError, setTermsError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const isEmailValid = emailPolicy(email.trim());
        const isPasswordValid = passwordPolicy(password);
        const isTermsValid = termsChecked;

        setEmailError(!isEmailValid);
        setPasswordError(!isPasswordValid);
        setTermsError(!isTermsValid);

        if (isEmailValid && isPasswordValid && isTermsValid) {
            setIsSubmitting(true);
            updateUserData({ email });
            console.log('Sign up successful');
            navigate('/dashboard');
        }
    };

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

                    <form id={styles.signupForm} onSubmit={handleSubmit} noValidate>
                        {/* Email Input */}
                        <div className={`${styles.inputGroup} ${emailError ? styles.error : ''}`}>
                            <input
                                type="email"
                                className={styles.floatInput}
                                placeholder=" "
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(!emailPolicy(e.target.value.trim()));
                                }}
                                required
                            />
                            <label className={styles.floatLabel}>Email address</label>
                            <span className={styles.errorText}>Please enter a valid email address.</span>
                        </div>

                        {/* Password Input */}
                        <div className={`${styles.inputGroup} ${passwordError ? styles.error : ''}`}>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.floatInput}
                                    placeholder=" "
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError(!passwordPolicy(e.target.value));
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
                            <p className={styles.passwordHint}>Must be at least 10 characters, no spaces.</p>
                            <span className={styles.errorText}>Password does not meet requirements.</span>
                        </div>

                        <div className={styles.recaptchaText}>
                            <p>This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms</a> apply.</p>
                        </div>

                        {/* Terms */}
                        <div className={`${styles.termsGroup} ${termsError ? styles.error : ''}`}>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.customCheckbox}
                                    checked={termsChecked}
                                    onChange={e => {
                                        setTermsChecked(e.target.checked);
                                        if (termsError && e.target.checked) setTermsError(false);
                                    }}
                                    required
                                />
                                <label>
                                    I agree to Health & Fitness <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                                </label>
                            </div>
                            <span className={styles.errorText}>You must agree to the terms to continue.</span>
                        </div>

                        {/* Submit */}
                        <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div className={styles.divider}>
                            <span>or</span>
                        </div>

                        <div className={styles.socialLogin}>
                            <button type="button" className={styles.socialBtn}>
                                <img src="/images/google.svg" alt="Google" />
                                Continue with Google
                            </button>
                            <button type="button" className={styles.socialBtn}>
                                <img src="/images/facebook.svg" alt="Facebook" />
                                Continue with Facebook
                            </button>
                            <p className={styles.socialHint}>We will never post anything without your permission</p>
                        </div>

                        <p className={styles.signupPrompt}>Already have an account? <Link to="/login">Log In</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
