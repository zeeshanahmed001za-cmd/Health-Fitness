import React, { useState, useRef, useEffect } from 'react';
import { quickLogAPI } from '../api';
import { useNutrition } from '../context/NutritionContext';
import styles from './QuickLogModal.module.css';

const QuickLogModal = () => {
    const { isQuickLogOpen, toggleQuickLog, refreshLogs } = useNutrition();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const inputRef = useRef(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isQuickLogOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isQuickLogOpen]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setStatus(null);

        try {
            const data = await quickLogAPI(text);
            setStatus({ type: 'success', message: data.message });
            setText('');
            if (refreshLogs) refreshLogs();
            
            // Close after success
            setTimeout(() => {
                toggleQuickLog(false);
                setStatus(null);
            }, 1000);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.message || 'Could not parse input' 
            });
            setTimeout(() => setStatus(null), 5000);
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
                    <h3>Quick Log</h3>
                    <button className={styles.closeBtn} onClick={() => toggleQuickLog(false)}>&times;</button>
                </div>
                <div className={styles.modalInfo}>
                    <p className={styles.description}>Log your day in seconds using natural language.</p>
                    <div className={styles.examples}>
                        <span>Examples:</span>
                        <ul>
                            <li>"2 cups of water"</li>
                            <li>"500 calorie pizza"</li>
                            <li>"ran for 30 minutes"</li>
                        </ul>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.cardInput}
                        placeholder="e.g., '2 cups water' or 'ran 30 mins'"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && status?.type === 'success') {
                                toggleQuickLog(false);
                            }
                        }}
                    />
                    <div className={styles.cardFooter}>
                        <span className={styles.enterHint}>Press Enter to save</span>
                        <button type="submit" className={styles.submitBtn} disabled={loading || !text.trim()}>
                            {loading ? <span className={styles.spinner}></span> : 'Log Activity'}
                        </button>
                    </div>
                </form>
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
