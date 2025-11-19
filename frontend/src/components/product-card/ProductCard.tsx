'use client';

import React, { useContext } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';
import styles from './ProductCard.module.scss';
import { ModalContext } from '@/providers/ModalProvider';
import type { Addon, ItemVariant, Product, SectionSchema } from '@/types/menu';
import { ConfigureProductModal } from '@/components/configure-product-modal/ConfigureProductModal';

export interface ProductCardProps {
    product: Product;
    schema: SectionSchema;
    // onAddToCart: (selectedVariant: ItemVariant, selectedAddons: Addon[]) => void;
}

function parsePrice(costString: string): number | undefined {
    const cleanedString = costString.replace(/[^\d.,-]/g, '').replace(',', '.');
    if (cleanedString === '') return undefined;
    const parsedNumber = Number(cleanedString);
    return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
}

export function ProductCard({ product, schema }: ProductCardProps) {
    const { openModal, closeModal } = useContext(ModalContext);

    const pricesList = product.data.map(variant => parsePrice(variant.cost)).filter((price): price is number => typeof price === 'number');
    const minimumPrice = pricesList.length > 0 ? Math.min(...pricesList) : undefined;
    const minimumPriceDisplay = minimumPrice !== undefined ? `${minimumPrice % 1 === 0 ? minimumPrice.toFixed(0) : minimumPrice.toFixed(2)} ₽` : '-';

    const handleOpenModal = () => {
        const handleClose = () => {
            closeModal();
        };
        const handleAdd = (selectedVariant: ItemVariant, selectedAddons: Addon[]) => {
            // onAddToCart(selectedVariant, selectedAddons);
            closeModal();
        };
        openModal(<ConfigureProductModal schema={schema} product={product} onAddToCart={handleAdd} onClose={handleClose} />);
    };

    const cleanDescription = (text: string): string => {
        return text.replace(/\s*\[[xх]\]\s*/gi, '');
    };

    return (
        <article onClick={handleOpenModal} className={styles.card} aria-labelledby={`product-title-${product.id}`}>
            <div className={styles.media}>
                <Image fill className={styles.image} src={product.imageUrl} alt={product.name} />
            </div>
            <div className={styles.body}>
                <h3 id={`product-title-${product.id}`} className={styles.title}>
                    {product.name}
                </h3>
                <p className={styles.description}>{cleanDescription(product.description)}</p>
                <div className={styles.row}>
                    <p className={styles.price}>от {minimumPriceDisplay}</p>
                    <Button size="md" variant="primary" onClick={handleOpenModal} aria-label={`Добавить ${product.name} в корзину`}>
                        В корзину
                    </Button>
                </div>
            </div>
        </article>
    );
}
