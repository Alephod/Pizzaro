import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ type = 'text', value = '', error = false, disabled = false, className = '', placeholder, onChange, ...rest }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : '', className].filter(Boolean).join(' ');

    return (
        <div className={styles.inputWrapper}>
            <input
                type={type === 'password' && showPassword ? 'text' : type}
                className={inputClass}
                disabled={disabled}
                placeholder={placeholder}
                value={type === 'file' ? undefined : value}
                onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
            {type === 'password' && (
                <span className={styles.showPassword} onClick={() => setShowPassword(prev => !prev)} style={{ cursor: 'pointer' }}>
                    {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                </span>
            )}
        </div>
    );
}
