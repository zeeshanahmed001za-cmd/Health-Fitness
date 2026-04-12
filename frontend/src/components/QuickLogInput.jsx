import React, { useState } from 'react';
import axios from 'axios';
import styles from './QuickLogInput.module.css';

const QuickLogInput = ({ onLogSuccess }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setStatus(null);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.post('/api/user/quick-log', { text }, config);
            
            setStatus({ type: 'success', message: data.message });
            setText('');
            if (onLogSuccess) onLogSuccess(data);
            
            // Clear success message after 3s
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Could not parse input. Try "2 cups of water"' 
            });
            setTimeout(() => setStatus(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.quickLogContainer}>
            <form onSubmit={handleSubmit} className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.quickInput}
                    placeholder="Log anything... (e.g., '2 cups water' or '500 cal pizza')"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" className={styles.logBtn} disabled={loading || !text.trim()}>
                    {loading ? <span className={styles.spinner}></span> : 'Quick Log'}
                </button>
            </form>
            {status && (
                <div className={`${styles.statusMsg} ${styles[status.type]}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default QuickLogInput;
