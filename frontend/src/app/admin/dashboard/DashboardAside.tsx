'use client';

import { ArrowLeft, EllipsisVertical } from 'lucide-react';
import { Utensils } from 'lucide-react';
import style from './layout.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import type { ElementType } from 'react';
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
    const pathname = usePathname();

    return (
        <aside className={style.aside}>
            <div className={style.header}>
                <div className={style.logo}>
                    <Image alt="Pizzaro admin" src="/logo-admin.svg" width={150} height={60} />
                </div>
                <ArrowLeft className={style.arrow} />
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
                <p>{username}</p>
                <EllipsisVertical className={style.profileOptions} />
            </div>
        </aside>
    );
}
