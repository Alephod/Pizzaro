import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from './AdminLoginForm';

import style from './page.module.scss';
import Image from 'next/image';

export default async function AdminLoginPage() {
    const session = await getServerSession(authOptions);

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
