import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { adminAuthOptions } from '@/lib/auth/admin';
import { AdminLoginForm } from './AdminLoginForm';
import style from './page.module.scss';
import Image from 'next/image';

export const metadata = {
    title: 'Вход в админ-панель — Pizzaro',
};

export default async function AdminLoginPage() {
    const session = await getServerSession(adminAuthOptions);

    if (session) {
        redirect('/admin/dashboard');
    }

    return (
        <main className={'container ' + style.main}>
            <Image className={style.logo} alt="Pizzaro admin" src="/logo-admin.svg" width={150} height={60} />
            <AdminLoginForm />
        </main>
    );
}
