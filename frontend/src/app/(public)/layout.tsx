import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import '@/app/globals.scss';
import ModalProvider from '@/providers/ModalProvider';
import ClientProvider from '@/providers/ClientProvider';
import { Header } from '@/components/header/Header';
import { getMenuSections } from '@/lib/fetchMenu';
import { CartProvider } from '@/providers/CartProvider';
import { getServerSession } from 'next-auth';
import { clientAuthOptions } from '@/lib/auth/client';

const openSans = Open_Sans({
    subsets: ['latin', 'cyrillic'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-open-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Pizzaro',
    description: 'Pizzaro App',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const sections = await getMenuSections();
    const session = await getServerSession(clientAuthOptions);

    return (
        <html lang="ru" className={openSans.variable}>
            <body>
                <ClientProvider>
                    <CartProvider>
                        <ModalProvider>
                            <Header sections={sections} session={session} />
                            {children}
                        </ModalProvider>
                    </CartProvider>
                </ClientProvider>
            </body>
        </html>
    );
}
