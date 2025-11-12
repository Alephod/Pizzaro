'use client';

import clsx from 'clsx';
import style from './Textarea.module.scss';
import type { ChangeEvent, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    cols?: number;
    disabled?: boolean;
    className?: string;
}

export default function Textarea({ value, onChange, placeholder = '', rows = 4, cols, disabled = false, className, ...rest }: TextareaProps) {
    return (
        <textarea
            className={clsx(style.textarea, className, disabled && style.disabled)}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            cols={cols}
            disabled={disabled}
            {...rest}
        />
    );
}
