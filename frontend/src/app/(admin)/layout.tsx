import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import '@/app/globals.scss';
import ModalProvider from '@/providers/ModalProvider';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/auth/admin';
import AdminProvider from '@/providers/AdminProvider';

const openSans = Open_Sans({
    subsets: ['latin', 'cyrillic'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-open-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Pizzaro Admin',
    description: 'Pizzaro App',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(adminAuthOptions);

    return (
        <html lang="ru" className={openSans.variable}>
            <body>
                <AdminProvider session={session}>
                    <ModalProvider>
                        {children}
                    </ModalProvider>
                </AdminProvider>
            </body>
        </html>
    );
}
