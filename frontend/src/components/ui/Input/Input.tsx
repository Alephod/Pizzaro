import React from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    textarea?: boolean;
    error?: boolean;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    value?: string;
}

export const Input: React.FC<InputProps> = ({ textarea = false, error = false, disabled = false, className = '', placeholder, value }) => {
    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : '', className].filter(Boolean).join(' ');

    if (textarea) {
        return <textarea className={inputClass} disabled={disabled} placeholder={placeholder} value={value} />;
    }

    return <input className={inputClass} disabled={disabled} placeholder={placeholder} value={value} />;
};
