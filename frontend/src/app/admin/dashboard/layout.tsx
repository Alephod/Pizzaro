import style from './layout.module.scss';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import DashboardAside from './DashboardAside';

export default async function Adminayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    const username = session?.user.username;

    return (
        <div className={style.wrapper}>
            <DashboardAside username={username} />
            {children}
        </div>
    );
}
