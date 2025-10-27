'use client';

import { ArrowLeft, EllipsisVertical } from 'lucide-react';
import { Utensils } from 'lucide-react';
import style from './layout.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ElementType } from 'react';
import { usePathname } from 'next/navigation';

interface AsideProps {
    username: string | null | undefined;
}

interface NavItem {
    name: string;
    href: string;
    icon: ElementType;
}

const navItems: NavItem[] = [
    {
        name: 'Меню',
        href: '/menu',
        icon: Utensils,
    },
];

export default function DashboardAside({ username }: AsideProps) {
    const [isClosed, setIsClosed] = useState(false);

    const pathname = usePathname();

    return (
        <aside className={style.aside + ' ' + (isClosed ? style.asideСlosed : '')}>
            <div className={style.header}>
                <div className={style.logo}>
                    <Image alt="Pizzaro admin" src="/logo-admin.svg" width={150} height={60} />
                </div>
                <div className={style.arrowWrapper}>
                    <div className={style.arrow}>
                        <ArrowLeft onClick={() => setIsClosed(!isClosed)} />
                    </div>
                </div>
            </div>

            {navItems.map(item => {
                const Icon = item.icon;
                return (
                    <Link className={style.link} key={item.name} href={pathname + item.href}>
                        <Icon className={style.icon} />
                        <span>{item.name}</span>
                    </Link>
                );
            })}

            <div className={style.profile}>
                <div className={style.profileAvatar}></div>
                <p>{username}</p>
                <EllipsisVertical className={style.profileOptions} />
            </div>
        </aside>
    );
}
