import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    type?: 'submit' | 'reset' | 'button';
    size: 'sm' | 'md' | 'lg';
    variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
    disabled?: boolean;
}

export function Button({ type = 'button', size, variant = 'primary', disabled = false, ...props }: ButtonProps) {
    return (
        <button className={`${styles.button} ${styles[variant]} ${styles[size]}`} type={type} disabled={disabled} {...props}>
            {props.children}
        </button>
    );
}
