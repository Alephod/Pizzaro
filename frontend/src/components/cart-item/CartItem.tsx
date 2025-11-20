'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import styles from './CartItem.module.scss';
import type { CartItem } from '@/types/cart';
import { Trash2 } from 'lucide-react';

interface Ingredient {
    name: string;
    isRemovable: boolean;
}

interface CartItemProps {
    item: CartItem;
    onDecrease: () => void;
    onIncrease: () => void;
    onRemove: () => void;
}

const MAX_COUNT = 30;

export function CartItem({ item, onDecrease, onIncrease, onRemove }: CartItemProps) {
    const totalPrice = item.cost * item.count;
    const isMaxCount = item.count >= MAX_COUNT;

    const parseIngredients = (description: string): Ingredient[] => {
        return description.split(', ').map(part => {
            const trimmed = part.trim();
            const removableMatch = trimmed.match(/\[ ?[xх] ?]$/i);

            if (removableMatch) {
                const name = trimmed.slice(0, -removableMatch[0].length).trim();
                return { name, isRemovable: true };
            }
            return { name: trimmed, isRemovable: false };
        });
    };

    const ingredients = parseIngredients(item.description);
    const removedSet = new Set(item.removedIngredients.map(i => i.toLowerCase()));

    return (
        <div className={styles.item}>
            <div className={styles.itemImage}>
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                />
            </div>

            <div className={styles.itemInfo}>
                <div className={styles.header}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    
                    {item.variant && <span className={styles.variant}>{item.variant}</span>}
                    <button onClick={onRemove} className={styles.removeBtn} aria-label="Удалить товар">
                        <Trash2 size={18} />
                    </button>
                </div>

                <p className={styles.description}>
                    {ingredients.map((ingredient, index) => {
                        const isRemoved = removedSet.has(ingredient.name.toLowerCase());
                        return (
                            <React.Fragment key={ingredient.name}>
                                <span
                                    className={clsx(
                                        styles.ingredient,
                                        isRemoved && styles.removedIngredient
                                    )}
                                >
                                    {ingredient.name}
                                </span>
                                {index < ingredients.length - 1 && ', '}
                            </React.Fragment>
                        );
                    })}
                </p>

                {item.addons.length > 0 && (
                    <p className={styles.addons}>
                        + {item.addons.join(', ')}
                    </p>
                )}

                <div className={styles.footer}>
                    <button className={styles.changeBtn}>Изменить состав</button>

                    <div className={styles.itemControls}>
                        <button
                            onClick={onDecrease}
                            aria-label="Уменьшить количество"
                            disabled={item.count <= 1}
                            className={styles.countBtn}
                        >
                            −
                        </button>

                        <span className={styles.count}>{item.count}</span>

                        <button
                            onClick={onIncrease}
                            aria-label="Увеличить количество"
                            disabled={isMaxCount}
                            className={styles.countBtn}
                        >
                            +
                        </button>
                    </div>

                    <p className={styles.itemPrice}>
                        {totalPrice} ₽
                    </p>
                </div>
            </div>
        </div>
    );
}