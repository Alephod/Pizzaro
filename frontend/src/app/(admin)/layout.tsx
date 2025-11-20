import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import '@/app/globals.scss';
import ModalProvider from '@/providers/ModalProvider';

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
    return (
        <html lang="ru" className={openSans.variable}>
            <body>
                <ModalProvider>{children}</ModalProvider>
            </body>
        </html>
    );
}
