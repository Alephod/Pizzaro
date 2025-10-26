import React from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    disabled?: boolean;
    type?: string;
    className?: string;
    placeholder?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ({ type = 'text', value = '', error = false, disabled = false, className = '', placeholder, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : '', className].filter(Boolean).join(' ');
    return (
        <div className={styles.inputWrapper}>
            <input type={type === 'password' && showPassword ? 'text' : type} className={inputClass} disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} />
            {type === 'password' && (
                <span className={styles.showPassword} onClick={() => setShowPassword(prev => !prev)} style={{ cursor: 'pointer' }}>
                    {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                </span>
            )}
        </div>
    );
};
