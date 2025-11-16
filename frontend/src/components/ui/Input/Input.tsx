import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.scss';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
    rightAdornment?: React.ReactNode;
}
export function Input({ type = 'text', value = '', error = false, errorMessage, rightAdornment, disabled = false, className = '', placeholder, onChange, ...rest }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const inputClass = [styles.input, error ? styles.error : '', disabled ? styles.disabled : '', className].filter(Boolean).join(' ');
    const passwordAdornment =
        type === 'password' ? (
            <span className={styles.adornment} onClick={() => setShowPassword(prev => !prev)} style={{ cursor: 'pointer' }}>
                {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
            </span>
        ) : null;
    return (
        <div className={styles.inputWrapper}>
            <div>
                <input
                    type={inputType}
                    className={inputClass}
                    disabled={disabled}
                    placeholder={placeholder}
                    value={type === 'file' ? undefined : value}
                    onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
                    {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                />
                {passwordAdornment}
                {rightAdornment && <span className={styles.adornment}>{rightAdornment}</span>}
            </div>

            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </div>
    );
}
