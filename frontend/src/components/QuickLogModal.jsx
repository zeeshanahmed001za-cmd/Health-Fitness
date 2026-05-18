import React, { useState, useRef, useEffect } from 'react';
import { quickLogAPI, addNutritionLogAPI } from '../api';
import { useNutrition } from '../context/NutritionContext';
import styles from './QuickLogModal.module.css';

const QuickLogModal = () => {
    const { isQuickLogOpen, toggleQuickLog, refreshLogs } = useNutrition();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [refinementData, setRefinementData] = useState(null);
    const inputRef = useRef(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isQuickLogOpen && inputRef.current && !refinementData) {
            inputRef.current.focus();
        }
    }, [isQuickLogOpen, refinementData]);

    const handleRefinedSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (refinementData.activityType === 'food') {
                await addNutritionLogAPI({
                    activityType: 'food',
                    name: refinementData.name,
                    calories: Number(data.calories),
                    protein: Number(data.protein),
                    carbs: Number(data.carbs),
                    fat: Number(data.fat),
                    category: data.category || 'snacks'
                });
            }

            setStatus({ type: 'success', message: 'Activity logged successfully!' });
            setTimeout(() => {
                toggleQuickLog(false);
                setRefinementData(null);
                setText('');
                setStatus(null);
                if (refreshLogs) refreshLogs();
            }, 1000);
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to save log' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setStatus(null);

        try {
            const res = await quickLogAPI(text);
            
            if (res.needsRefinement) {
                setRefinementData({
                    activityType: res.activityType || 'food',
                    name: res.name || text,
                    ...res.data
                });
            } else {
                setStatus({ type: 'success', message: res.message });
                setText('');
                if (refreshLogs) refreshLogs();
                setTimeout(() => {
                    toggleQuickLog(false);
                    setStatus(null);
                }, 1500);
            }
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.message || 'Could not parse input' 
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isQuickLogOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={() => toggleQuickLog(false)} />
            <div className={styles.logCard}>
                <div className={styles.cardHeader}>
                    <h3>{refinementData ? 'Refine Food Details' : 'Quick Food Log'}</h3>
                    <button className={styles.closeBtn} onClick={() => toggleQuickLog(false)}>&times;</button>
                </div>

                {!refinementData ? (
                    <>
                        <div className={styles.modalInfo}>
                            <p className={styles.description}>Log your meals and water by typing naturally.</p>
                            <div className={styles.examples}>
                                <ul>
                                    <li>"2 cups of water"</li>
                                    <li>"300 calorie snack"</li>
                                    <li>"an apple"</li>
                                </ul>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles.cardInput}
                                placeholder="What did you eat?"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={loading}
                            />
                            <div className={styles.cardFooter}>
                                <button type="submit" className={styles.submitBtn} disabled={loading || !text.trim()}>
                                    {loading ? 'Analyzing...' : 'Next'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleRefinedSubmit} className={styles.refinementForm}>
                        <p className={styles.refineLabel}>Logging: <strong>{refinementData.name}</strong></p>
                        
                        {refinementData.activityType === 'food' && (
                            <div className={styles.gridFields}>
                                <div className={styles.inputGroup}>
                                    <label>Calories (kcal)</label>
                                    <input name="calories" type="number" defaultValue={refinementData.calories || ''} required placeholder="0" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Protein (g)</label>
                                    <input name="protein" type="number" defaultValue={refinementData.protein || ''} placeholder="0" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Carbs (g)</label>
                                    <input name="carbs" type="number" defaultValue={refinementData.carbs || ''} placeholder="0" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Fat (g)</label>
                                    <input name="fat" type="number" defaultValue={refinementData.fat || ''} placeholder="0" />
                                </div>
                            </div>
                        )}



                        <div className={styles.cardFooter}>
                            <button type="button" className={styles.backBtn} onClick={() => setRefinementData(null)}>Back</button>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Log'}
                            </button>
                        </div>
                    </form>
                )}

                {status && (
                    <div className={`${styles.statusMsg} ${styles[status.type]}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </>
    );
};

export default QuickLogModal;

