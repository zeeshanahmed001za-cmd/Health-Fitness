import React, { useState, useRef, useEffect } from 'react';
import { quickLogAPI } from '../api';
import styles from './QuickLogInput.module.css';

const QuickLogInput = ({ onLogSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const inputRef = useRef(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setStatus(null);

        try {
            const data = await quickLogAPI(text);
            setStatus({ type: 'success', message: data.message });
            setText('');
            if (onLogSuccess) onLogSuccess(data);
            
            // Close after success
            setTimeout(() => {
                setIsOpen(false);
                setStatus(null);
            }, 1500);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.message || 'Could not parse input. Try "2 cups of water"' 
            });
            setTimeout(() => setStatus(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {!isOpen ? (
                <button 
                    className={styles.triggerBtn} 
                    onClick={() => setIsOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Quick Log
                </button>
            ) : (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.logCard}>
                        <div className={styles.cardHeader}>
                            <h3>Fast Log</h3>
                            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>&times;</button>
                        </div>
                        <p className={styles.hint}>Mention food, water, or exercise...</p>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles.cardInput}
                                placeholder="e.g., '500 cal pizza' or '2 cups water'"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={loading}
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
            )}
        </div>
    );
};

export default QuickLogInput;
