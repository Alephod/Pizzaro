import styles from './Button.module.scss';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    type?: 'submit' | 'reset' | 'button';
    size: 'sm' | 'md' | 'lg';
    variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
    className?: string;
    disabled?: boolean;
}

export function Button({ type = 'button', size, variant = 'primary', disabled = false, className, ...props }: ButtonProps) {
    return (
        <button className={clsx(styles.button, styles[variant], styles[size], className)} type={type} disabled={disabled} {...props}>
            {props.children}
        </button>
    );
}
