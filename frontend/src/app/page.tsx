import React from 'react';
import styles from './Home.module.scss';
import type { MenuSection, Product } from '../types/menu';
import { ProductCard } from '@/components/product-card/ProductCard';
import clsx from 'clsx';

async function fetchMenuSections(): Promise<MenuSection[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-section`, {
        method: 'GET',
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch menu sections: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as MenuSection[];
}

export default async function Home() {
    const sections = await fetchMenuSections();
    console.log(sections);

    return (
        <main className={clsx('container', styles.main)}>
            <h1 className={styles.title}>Меню</h1>

            {sections.length === 0 ? (
                <p>Секции не найдены.</p>
            ) : (
                sections.map(section =>
                    section.items.length !== 0 ? (
                        <section key={section.id} className={styles.section}>
                            <h2 className={styles.sectionTitle}>{section.name}</h2>

                            <div className={styles.grid}>
                                {section.items.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    ) : null
                )
            )}
        </main>
    );
}
