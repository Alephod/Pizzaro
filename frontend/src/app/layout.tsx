import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.scss';
import ModalProvider from '@/providers/ModalProvider';
import { Header } from '@/components/header/Header';
import { getMenuSections } from '@/lib/fetchMenu';

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

    return (
        <html lang="ru" className={openSans.variable}>
            <body>
                <ModalProvider>
                    <Header sections={sections} />
                    {children}
                </ModalProvider>
            </body>
        </html>
    );
}
