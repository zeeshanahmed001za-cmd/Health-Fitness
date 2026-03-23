import { useState, useEffect, useRef } from 'react';
import styles from '../styles/OnboardingQuestions.module.css';

function OnboardingQuestions() {
    const totalSteps = 7;
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '',
        gender: null, dob: '', location: '',
        primaryGoal: [],
        fitnessLevel: null,
        activityLevel: null,
        heightUnit: 'imperial',
        heightFeet: '', heightInches: '', heightCm: '',
        weightUnit: 'imperial',
        weightValue: '', goalWeightValue: '',
    });
    const [ageError, setAgeError] = useState('');
    const ageTimerRef = useRef(null);

    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    // --- Validation ---
    const isNameValid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';

    const validateAge = (dob) => {
        if (!dob) return { valid: false, underage: false };
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return { valid: age >= 18, underage: age < 18 };
    };

    const isDetailsValid = () => {
        if (!formData.gender || !formData.dob || !formData.location.trim()) return false;
        return validateAge(formData.dob).valid;
    };

    const validateMetrics = () => {
        let isHeightValid = false;
        if (formData.heightUnit === 'imperial') {
            const ft = parseFloat(formData.heightFeet);
            const inc = parseFloat(formData.heightInches) || 0;
            isHeightValid = !isNaN(ft) && ft >= 2 && ft <= 8 && inc >= 0 && inc <= 11;
        } else {
            const cm = parseFloat(formData.heightCm);
            isHeightValid = !isNaN(cm) && cm >= 60 && cm <= 272;
        }

        const currentWeight = parseFloat(formData.weightValue);
        const goalWeight = parseFloat(formData.goalWeightValue);

        const isWeightValid = formData.weightUnit === 'imperial'
            ? !isNaN(currentWeight) && currentWeight >= 50 && currentWeight <= 1000
            : !isNaN(currentWeight) && currentWeight >= 20 && currentWeight <= 450;

        const isGoalWeightValid = formData.weightUnit === 'imperial'
            ? !isNaN(goalWeight) && goalWeight >= 50 && goalWeight <= 1000
            : !isNaN(goalWeight) && goalWeight >= 20 && goalWeight <= 450;

        if (isHeightValid && isWeightValid && isGoalWeightValid) {
            if (goalWeight <= currentWeight) {
                return { valid: false, error: 'Goal weight must be greater than your current weight.' };
            }
            return { valid: true, error: '' };
        }

        if ((formData.heightFeet || formData.heightCm) && formData.weightValue && formData.goalWeightValue) {
            return { valid: false, error: 'Please enter realistic height and weight values.' };
        }
        return { valid: false, error: '' };
    };

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Cleanup age timer on unmount
    useEffect(() => {
        return () => { if (ageTimerRef.current) clearTimeout(ageTimerRef.current); };
    }, []);

    // --- Handlers ---
    const handleNext = () => {
        if (currentStep === totalSteps - 1) {
            sessionStorage.setItem('onboardingData', JSON.stringify(formData));
            console.log('Final Form Data:', formData);
            // TODO: navigate to signup with React Router
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleDobChange = (value) => {
        setFormData(prev => ({ ...prev, dob: value }));
        const { underage } = validateAge(value);
        if (underage) {
            setAgeError('Sorry, you must be at least 18 years old. Redirecting to home...');
            if (ageTimerRef.current) clearTimeout(ageTimerRef.current);
            ageTimerRef.current = setTimeout(() => {
                window.location.href = '/'; // TODO: Replace with React Router navigate
            }, 3500);
        } else {
            setAgeError('');
            if (ageTimerRef.current) clearTimeout(ageTimerRef.current);
        }
    };

    const handleCardSelect = (dataKey, value, maxSelections = 1) => {
        setFormData(prev => {
            if (maxSelections === 1) {
                return { ...prev, [dataKey]: value };
            }
            const current = prev[dataKey];
            if (current.includes(value)) {
                return { ...prev, [dataKey]: current.filter(v => v !== value) };
            } else if (current.length < maxSelections) {
                return { ...prev, [dataKey]: [...current, value] };
            } else {
                return { ...prev, [dataKey]: [...current.slice(1), value] };
            }
        });
    };

    const handleToggleHeight = (e) => {
        e.preventDefault();
        setFormData(prev => {
            if (prev.heightUnit === 'imperial') {
                const totalInches = (parseFloat(prev.heightFeet) || 0) * 12 + (parseFloat(prev.heightInches) || 0);
                return { ...prev, heightUnit: 'metric', heightCm: totalInches > 0 ? (totalInches * 2.54).toFixed(1) : '' };
            } else {
                const cm = parseFloat(prev.heightCm);
                if (!isNaN(cm) && cm > 0) {
                    const totalInches = cm / 2.54;
                    return { ...prev, heightUnit: 'imperial', heightFeet: String(Math.floor(totalInches / 12)), heightInches: String(Math.round(totalInches % 12)) };
                }
                return { ...prev, heightUnit: 'imperial' };
            }
        });
    };

    const handleToggleWeight = (e) => {
        e.preventDefault();
        setFormData(prev => {
            if (prev.weightUnit === 'imperial') {
                const lbs = parseFloat(prev.weightValue);
                const goalLbs = parseFloat(prev.goalWeightValue);
                return {
                    ...prev, weightUnit: 'metric',
                    weightValue: !isNaN(lbs) && lbs > 0 ? (lbs * 0.453592).toFixed(1) : prev.weightValue,
                    goalWeightValue: !isNaN(goalLbs) && goalLbs > 0 ? (goalLbs * 0.453592).toFixed(1) : prev.goalWeightValue,
                };
            } else {
                const kgs = parseFloat(prev.weightValue);
                const goalKgs = parseFloat(prev.goalWeightValue);
                return {
                    ...prev, weightUnit: 'imperial',
                    weightValue: !isNaN(kgs) && kgs > 0 ? (kgs / 0.453592).toFixed(1) : prev.weightValue,
                    goalWeightValue: !isNaN(goalKgs) && goalKgs > 0 ? (goalKgs / 0.453592).toFixed(1) : prev.goalWeightValue,
                };
            }
        });
    };

    const goalGreeting = currentStep === 2 && formData.firstName
        ? `Welcome ${formData.firstName}, now let's know about your goals`
        : 'What is your primary goal?';

    return (
        <>
            <header className={styles.topBar}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }} />
                </div>
                <div className={styles.accountIcon}>
                    <a href="#">
                        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20" />
                        </svg>
                    </a>
                </div>
            </header>

            <main className={styles.onboardingContainer}>

                {/* STEP 1: Welcome */}
                {currentStep === 0 && (
                    <div className={styles.step}>
                        <div className={styles.welcomeHeader}>
                            <h2>Welcome to <span className={styles.gradientText}>Health & Fitness</span></h2>
                            <p className={styles.subtitle}>Are you ready to start your fitness journey and build a personalized workout plan designed around your goals, experience level, and lifestyle?</p>
                        </div>
                        <div className={styles.imagesContainer}>
                            <div className={styles.imageWrapper}><img src="/images/cardio.jpg" alt="Cardio Training" /></div>
                            <div className={styles.imageWrapper}><img src="/images/deadlift.jpg" alt="Strength Training" /></div>
                            <div className={styles.imageWrapper}><img src="/images/situps.jpg" alt="Core Training" /></div>
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext}>Let's Go</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Name */}
                {currentStep === 1 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader}>
                            <h2>Let's get to know you</h2>
                            <p className={styles.subtitle}>What should we call you?</p>
                        </div>
                        <div className={styles.formGroup}>
                            <input type="text" className={styles.textInput} placeholder="First Name"
                                value={formData.firstName}
                                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} />
                            <input type="text" className={styles.textInput} placeholder="Last Name"
                                value={formData.lastName}
                                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} />
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={!isNameValid}>Next</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Primary Goal */}
                {currentStep === 2 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader}>
                            <h2>{goalGreeting}</h2>
                            <p className={styles.subtitle}>Select up to two to help us tailor your experience.</p>
                        </div>
                        <div className={styles.optionsList}>
                            {[
                                { value: 'weight_loss', title: 'Weight Loss', desc: 'Shed pounds and lean out' },
                                { value: 'muscle_gain', title: 'Muscle Gain', desc: 'Build size and strength' },
                                { value: 'general_fitness', title: 'General Fitness', desc: 'Improve overall health' },
                                { value: 'maintain_weight', title: 'Maintain Weight', desc: 'Stay at my current weight and tone up' },
                                { value: 'manage_stress', title: 'Manage Stress', desc: 'Use exercise for mental well-being and relaxation' },
                                { value: 'improve_flexibility', title: 'Improve Flexibility', desc: 'Enhance mobility, range of motion, and posture' },
                                { value: 'build_endurance', title: 'Build Endurance', desc: 'Increase stamina for runs, hikes, or sports' },
                                { value: 'increase_energy', title: 'Increase Energy', desc: 'Boost daily energy levels and overcome fatigue' },
                            ].map(option => (
                                <div key={option.value}
                                    className={`${styles.optionCard} ${styles.listStyle} ${formData.primaryGoal.includes(option.value) ? styles.selected : ''}`}
                                    onClick={() => handleCardSelect('primaryGoal', option.value, 2)}>
                                    <h3>{option.title}</h3>
                                    <p>{option.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={formData.primaryGoal.length === 0}>Next</button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Activity Level */}
                {currentStep === 3 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader}>
                            <h2>How active are you daily?</h2>
                            <p className={styles.subtitle}>This helps us calculate your energy needs.</p>
                        </div>
                        <div className={styles.optionsList}>
                            {[
                                { value: 'sedentary', title: 'Not Very Active', desc: 'Mostly sitting (office work, driving, etc.)' },
                                { value: 'lightly_active', title: 'Lightly Active', desc: 'On your feet often (teaching, retail, light walks)' },
                                { value: 'active', title: 'Active', desc: 'Moving most of the day or regular exercise' },
                                { value: 'very_active', title: 'Very Active', desc: 'Heavy physical labor or intense daily training' },
                            ].map(option => (
                                <div key={option.value}
                                    className={`${styles.optionCard} ${styles.listStyle} ${formData.activityLevel === option.value ? styles.selected : ''}`}
                                    onClick={() => handleCardSelect('activityLevel', option.value, 1)}>
                                    <h3>{option.title}</h3>
                                    <p>{option.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={!formData.activityLevel}>Next</button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Fitness Level */}
                {currentStep === 4 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader}>
                            <h2>What is your current fitness level?</h2>
                            <p className={styles.subtitle}>Be honest, this sets your starting point.</p>
                        </div>
                        <div className={styles.optionsList}>
                            {[
                                { value: 'beginner', title: 'Beginner', desc: 'I rarely exercise or am just starting out.' },
                                { value: 'intermediate', title: 'Intermediate', desc: 'I exercise 1-3 times a week consistently.' },
                                { value: 'advanced', title: 'Advanced', desc: 'I train 4+ times a week and know my way around a gym.' },
                            ].map(option => (
                                <div key={option.value}
                                    className={`${styles.optionCard} ${styles.listStyle} ${formData.fitnessLevel === option.value ? styles.selected : ''}`}
                                    onClick={() => handleCardSelect('fitnessLevel', option.value, 1)}>
                                    <h3>{option.title}</h3>
                                    <p>{option.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={!formData.fitnessLevel}>Next</button>
                        </div>
                    </div>
                )}

                {/* STEP 6: Personal Details */}
                {currentStep === 5 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader}>
                            <h2>A little about you</h2>
                            <p className={styles.subtitle}>Please provide some basic details.</p>
                        </div>
                        <div className={styles.formGroup}>
                            {ageError && <div className={styles.errorMessage}>{ageError}</div>}
                            <div className={styles.radioGroup}>
                                {['male', 'female', 'other'].map(g => (
                                    <label key={g} className={styles.radioLabel}>
                                        <input type="radio" name="gender" value={g}
                                            checked={formData.gender === g}
                                            onChange={() => setFormData(prev => ({ ...prev, gender: g }))} />
                                        <span className={styles.customRadio}></span>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </label>
                                ))}
                            </div>
                            <input type="date" className={`${styles.textInput} ${styles.customDateInput}`}
                                value={formData.dob} onChange={e => handleDobChange(e.target.value)} />
                            <input type="text" className={styles.textInput}
                                placeholder="Where do you live? (City, Country)"
                                value={formData.location}
                                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} />
                        </div>
                        <div className={styles.navigationButtons}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={!isDetailsValid()}>Next</button>
                        </div>
                    </div>
                )}

                {/* STEP 7: Body Metrics */}
                {currentStep === 6 && (
                    <div className={styles.step}>
                        <div className={styles.questionHeader} style={{ marginBottom: '20px' }}>
                            <h2>How tall are you?</h2>
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                            {validateMetrics().error && (
                                <div className={styles.errorMessage}>{validateMetrics().error}</div>
                            )}
                            {formData.heightUnit === 'imperial' ? (
                                <div className={styles.metricRow}>
                                    <div className={styles.inputGroupVertical}>
                                        <label className={styles.inputLabel}>Height (feet)</label>
                                        <input type="number" className={styles.textInput} placeholder="ft" min="0"
                                            value={formData.heightFeet}
                                            onChange={e => setFormData(prev => ({ ...prev, heightFeet: e.target.value }))} />
                                    </div>
                                    <div className={styles.inputGroupVertical}>
                                        <label className={styles.inputLabel}>Height (inches)</label>
                                        <input type="number" className={styles.textInput} placeholder="in" min="0" max="11"
                                            value={formData.heightInches}
                                            onChange={e => setFormData(prev => ({ ...prev, heightInches: e.target.value }))} />
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.metricRow}>
                                    <div className={styles.inputGroupVertical}>
                                        <label className={styles.inputLabel}>Height (cm)</label>
                                        <div className={styles.inputWithUnit} style={{ width: '100%' }}>
                                            <input type="number" className={styles.textInput} placeholder="cm" min="0" step="0.1"
                                                value={formData.heightCm}
                                                onChange={e => setFormData(prev => ({ ...prev, heightCm: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={styles.toggleContainer}>
                                <a href="#" className={styles.unitToggle} onClick={handleToggleHeight}>
                                    {formData.heightUnit === 'imperial' ? 'Switch to centimeters' : 'Switch to feet/inches'}
                                </a>
                            </div>
                        </div>

                        <div className={styles.questionHeader} style={{ marginBottom: '20px' }}>
                            <h2>How much do you weigh?</h2>
                            <p className={styles.subtitle} style={{ fontSize: '0.95rem' }}>It's OK to estimate. You can update this later.</p>
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                            <div className={styles.metricRow}>
                                <div className={styles.inputGroupVertical}>
                                    <label className={styles.inputLabel}>Current weight</label>
                                    <div className={styles.inputWithUnit} style={{ width: '100%' }}>
                                        <input type="number" className={styles.textInput}
                                            placeholder={formData.weightUnit === 'imperial' ? 'lbs' : 'kg'} min="0" step="0.1"
                                            value={formData.weightValue}
                                            onChange={e => setFormData(prev => ({ ...prev, weightValue: e.target.value }))} />
                                        <span className={styles.unitLabel}>{formData.weightUnit === 'imperial' ? 'lbs' : 'kg'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.questionHeader} style={{ marginBottom: '20px' }}>
                            <h2>What's your goal weight?</h2>
                            <p className={styles.subtitle} style={{ fontSize: '0.9rem' }}>Don't worry. This doesn't affect your daily calorie goal and you can always change it later.</p>
                        </div>
                        <div className={styles.formGroup}>
                            <div className={styles.metricRow}>
                                <div className={styles.inputGroupVertical}>
                                    <label className={styles.inputLabel}>Goal weight</label>
                                    <div className={styles.inputWithUnit} style={{ width: '100%' }}>
                                        <input type="number" className={styles.textInput}
                                            placeholder={formData.weightUnit === 'imperial' ? 'lbs' : 'kg'} min="0" step="0.1"
                                            value={formData.goalWeightValue}
                                            onChange={e => setFormData(prev => ({ ...prev, goalWeightValue: e.target.value }))} />
                                        <span className={styles.unitLabel}>{formData.weightUnit === 'imperial' ? 'lbs' : 'kg'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.toggleContainer}>
                                <a href="#" className={styles.unitToggle} onClick={handleToggleWeight}>
                                    {formData.weightUnit === 'imperial' ? 'Switch to kilograms' : 'Switch to pounds'}
                                </a>
                            </div>
                        </div>

                        <div className={styles.navigationButtons} style={{ marginTop: '10px' }}>
                            <button type="button" className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                            <button type="button" className={styles.ctaBtn} onClick={handleNext} disabled={!validateMetrics().valid}>Next</button>
                        </div>
                    </div>
                )}

            </main>
        </>
    );
}

export default OnboardingQuestions;