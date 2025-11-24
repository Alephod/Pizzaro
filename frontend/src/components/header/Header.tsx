'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import style from './Header.module.scss';
import Link from 'next/link';
import { LogIn, ShoppingCart } from 'lucide-react';
import type { MenuSection } from '@/types/menu';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';
import clsx from 'clsx';
import { ModalContext } from '@/providers/ModalProvider';
import { Cart } from '@/components/cart/Cart';
import { AuthModal } from '../auth-modal/AuthModal';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

interface HeaderProps {
    sections: MenuSection[];
    session?: Session | null;
}

export function Header({ sections, session: initialSession }: HeaderProps) {
    const { openModal, closeModal } = useContext(ModalContext);
    const { data: liveSession } = useSession(); // живой источник правды
    const router = useRouter();

    const displayedSession = liveSession ?? initialSession ?? null;

    const filteredSections = sections.filter((s) => s.items && s.items.length > 0);

    const headerRef = useRef<HTMLElement | null>(null);
    const bottomRowWrapperRef = useRef<HTMLDivElement | null>(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const headerEl = headerRef.current;
        const wrapperEl = bottomRowWrapperRef.current;
        if (!headerEl || !wrapperEl) return;

        let ticking = false;
        const check = () => {
            ticking = false;
            const headerRect = headerEl.getBoundingClientRect();
            const wrapperRect = wrapperEl.getBoundingClientRect();

            const headerBottom = headerRect.bottom;
            const wrapperTop = wrapperRect.top;
            const stuck = wrapperTop <= headerBottom + 0.5;
            setIsSticky((prev) => !(prev === stuck ? prev : stuck));
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(check);
            }
        };

        const onResize = () => {
            check();
        };

        check();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const handleOpenCart = () => {
        openModal(<Cart isOpen onClose={closeModal} />, 'right');
    };

    const handleOpenEmailModal = () => {
        const handleClose = () => {
            closeModal();
        };
        openModal(<AuthModal onClose={handleClose} />);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.refresh();
    };

    return (
        <>
            <header className={style.header} ref={headerRef}>
                <div className="container">
                    <div className={style.topRow}>
                        <Link href="/" className={style.logo}>
                            <Image width={150} height={57} className={style.logoImg} src="/logo.png" alt="logo" />
                        </Link>

                        <div className={style.actions}>
                            {displayedSession?.user?.email ? (
                                <div className={style.userInfo}>
                                    <span className={style.userEmail}>{displayedSession.user.email}</span>
                                    <Button type="button" size="md" variant="secondary" onClick={handleSignOut}>
                                        Выйти
                                    </Button>
                                </div>
                            ) : (
                                    <Button type="button" size="md" variant="primary" onClick={handleOpenEmailModal}>
                                        <LogIn size={22} />
                                        Войти
                                    </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div ref={bottomRowWrapperRef} className={style.bottomRowWrapper}>
                <div className={clsx(style.bottomRow, 'container', isSticky && style.sticky)}>
                    <div className={style.navWrapper}>
                        <Link href="/" className={style.navLogo}>
                            <Image width={40} height={40} src="/logo-sm.png" alt="" />
                        </Link>
                        <nav className={style.nav} aria-label="Main navigation">
                            {filteredSections.map((section) => (
                                <Link key={section.id} href={`/#section-${section.slug}`} className={style.navItem}>
                                    {section.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className={style.rightControls}>
                        <button onClick={handleOpenCart} className={style.cartBtn}>
                            <ShoppingCart size={22} />
                            Корзина
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
