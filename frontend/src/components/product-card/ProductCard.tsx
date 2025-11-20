'use client';

import React, { useContext } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';
import styles from './ProductCard.module.scss';
import { ModalContext } from '@/providers/ModalProvider';
import type { Product, SectionSchema } from '@/types/menu';
import { ConfigureProductModal } from '@/components/configure-product-modal/ConfigureProductModal';
import { useCart } from '@/providers/CartProvider';
import type { CartItem } from '@/types/cart';

export interface ProductCardProps {
    product: Product;
    schema: SectionSchema;
}

function parsePrice(costString: string): number {
    const cleaned = costString.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
}

export function ProductCard({ product, schema }: ProductCardProps) {
    const { openModal, closeModal } = useContext(ModalContext);
    const { addItem } = useCart(); // добавляем корзину

    // Находим самый дешёвый вариант
    const cheapestVariant = product.data.reduce((cheapest, variant) => {
        const price = parsePrice(variant.cost);
        const cheapestPrice = parsePrice(cheapest.cost);
        return price < cheapestPrice ? variant : cheapest;
    });

    const minPrice = parsePrice(cheapestVariant.cost);
    const minPriceDisplay = minPrice % 1 === 0 ? `${minPrice.toFixed(0)} ₽` : `${minPrice.toFixed(2)} ₽`;

    // Быстрое добавление без модалки
    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation(); // чтобы не сработал onClick на всей карточке
        const item: CartItem = {
            name: product.name,
            sectionId: product.sectionId,
            description: product.description,
            imageUrl: product.imageUrl,
            count: 1,
            removedIngredients: [],
            addons: [],
        };
        console.log(item);
        addItem(item);
    };

    // Открытие модалки для полной настройки
    const handleOpenModal = () => {
        const handleClose = () => {
            closeModal();
        };
        openModal(<ConfigureProductModal schema={schema} product={product} onClose={handleClose} />);
    };
    const cleanDescription = (text: string): string => {
        return text.replace(/\s*\[[xх]\]\s*/gi, '');
    };

    return (
        <article className={styles.card} aria-labelledby={`product-title-${product.id}`}>
            <div onClick={handleOpenModal} className={styles.media}>
                <Image fill className={styles.image} src={product.imageUrl} alt={product.name} />
            </div>

            <div className={styles.body}>
                <h3 id={`product-title-${product.id}`} className={styles.title}>
                    {product.name}
                </h3>

                <p className={styles.description}>{cleanDescription(product.description)}</p>

                <div className={styles.row}>
                    <p className={styles.price}>от {minPriceDisplay}</p>

                    <Button size="md" variant="primary" onClick={handleAdd} aria-label={`Выбрать ${product.name}`}>
                        Выбрать
                    </Button>
                </div>
            </div>
        </article>
    );
}
