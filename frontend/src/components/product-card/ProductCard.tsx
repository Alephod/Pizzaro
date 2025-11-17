'use client';

import React from 'react';
import type { Product } from '@/types/menu';
import { Button } from '@/components/ui/button/Button';
import styles from './ProductCard.module.scss';
import Image from 'next/image';

export interface ProductCardProps {
    product: Product;
    onAdd?: (productId: number) => void;
}

function parsePrice(cost: string): number | undefined {
    const cleaned = cost.replace(/[^\d.,-]/g, '').replace(',', '.');
    if (cleaned === '') return undefined;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
    const prices = product.data.map(v => parsePrice(v.cost)).filter((p): p is number => typeof p === 'number');

    const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
    const minPriceDisplay = minPrice !== undefined ? `${minPrice % 1 === 0 ? minPrice.toFixed(0) : minPrice.toFixed(2)} ₽` : '-';

    return (
        <article onClick={() => onAdd?.(product.id)} className={styles.card} aria-labelledby={`prod-title-${product.id}`}>
            <div className={styles.media}>
                <Image fill className={styles.image} src={product.imageUrl} alt={product.name} />
            </div>

            <div className={styles.body}>
                <h3 id={`prod-title-${product.id}`} className={styles.title}>
                    {product.name}
                </h3>

                <p className={styles.description}>{product.description}</p>

                <div className={styles.row}>
                    <p className={styles.price}>от {minPriceDisplay}</p>
                    <Button size="md" variant="primary" onClick={() => onAdd?.(product.id)} aria-label={`Добавить ${product.name} в корзину`}>
                        В корзину
                    </Button>
                </div>
            </div>
        </article>
    );
}
