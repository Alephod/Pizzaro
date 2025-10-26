import React from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    disabled?: boolean;
    type?: string;
    className?: string;
    placeholder?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export const Input: React.FC<InputProps> = ({ type = 'text', error = false, disabled = false, className = '', placeholder, value, onChange }) => {
    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : '', className].filter(Boolean).join(' ');

    if (type === 'textarea') {
        return <textarea className={inputClass} disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} />;
    }

    return <input type={type} className={inputClass} disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} />;
};
