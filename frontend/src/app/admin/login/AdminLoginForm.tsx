'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import style from './page.module.scss';

export function AdminLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('admin-credentials', {
            redirect: false,
            username: username.trim(),
            password: password.trim(),
        });
        if (res?.error) setError('Неверный логин или пароль');
        else window.location.href = '/admin/dashboard';
    };

    return (
        <form className={style.form} onSubmit={handleSubmit}>
            <Input type="text" placeholder="Ваш логин" value={username} onChange={e => setUsername(e.target.value)} />
            <Input type="password" placeholder="Ваш пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" size="lg" variant="primary">
                Войти
            </Button>
            {error && <p className={style.errorMassage}>{error}</p>}
        </form>
    );
}
