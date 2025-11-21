'use client';

import React from 'react';
import { useCart } from '@/providers/CartProvider';
import styles from './Cart.module.scss'; 
import { Button } from '@/components/ui/button/Button';
import { CartItem } from '@/components/cart-item/CartItem';
import { normalizePrice } from '@/utils';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Cart({ isOpen }: CartProps) {
    const { items, updateItem, removeItem } = useCart();

    const totalSum = items.reduce((sum, item) => sum + item.count * item.cost, 0);
    const totalSumDisplay = normalizePrice(totalSum);

    if (!isOpen) return null;

    return (
        <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
                <h2>Корзина</h2>
            </div>

            {items.length === 0 ? (
                <p className={styles.empty}>Корзина пуста</p>
            ) : (
                <div className={styles.itemsList}>
                    {items.map(item => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onDecrease={() => updateItem(item.id || '', { count: item.count - 1 })}
                            onIncrease={() => updateItem(item.id || '', { count: item.count + 1 })}
                            onRemove={() => removeItem(item.id || '')}
                        />
                    ))}
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.footerCost}>
                    <p>Сумма заказа:</p>
                    <span>{totalSumDisplay}</span>
                </div>
                <Button className={styles.finalBtn} size="lg" variant="primary">
                    Перейти к оформлению
                </Button>
            </div>
        </div>
    );
}
