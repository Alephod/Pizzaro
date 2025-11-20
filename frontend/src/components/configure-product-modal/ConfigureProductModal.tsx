'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';
import styles from './ConfigureProductModal.module.scss';
import type { Product, ItemVariant, Addon, SectionSchema } from '@/types/menu';
import RadioButton from '@/components/ui/radio-button/RadioButton';
import clsx from 'clsx';
import { Undo2, X } from 'lucide-react';
import type { CartItem } from '@/types/cart';

interface ProductModalProps {
    product: Product;
    schema: SectionSchema;
    onAddToCart: (cartItem: CartItem) => void;
    onClose: () => void;
}

interface Ingredient {
    name: string;
    isRemovable: boolean;
}

export function ConfigureProductModal({ product, schema, onAddToCart, onClose }: ProductModalProps) {
    const initialVariant = product.data[0];
    const [selectedVariant, setSelectedVariant] = useState<ItemVariant>(initialVariant);
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());

    const variantOptions = product.data.map(variant => variant.name);

    const handleVariantChange = (newVariantName: string) => {
        const foundVariant = product.data.find(variant => variant.name === newVariantName);
        if (foundVariant) {
            setSelectedVariant(foundVariant);
            setSelectedAddons([]);
            setRemovedIngredients(new Set());
        }
    };

    const toggleAddon = (addon: Addon) => {
        setSelectedAddons(previousAddons => {
            const isAlreadySelected = previousAddons.some(existingAddon => existingAddon.name === addon.name);
            if (isAlreadySelected) {
                return previousAddons.filter(existingAddon => existingAddon.name !== addon.name);
            } else {
                return [...previousAddons, addon];
            }
        });
    };

    const parseCostToNumber = (costString: string): number => {
        const cleanedString = costString.replace(/[^\d.,-]/g, '').replace(',', '.');
        const parsedNumber = parseFloat(cleanedString);
        return isNaN(parsedNumber) ? 0 : parsedNumber;
    };

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

    const ingredients = parseIngredients(product.description);

    const toggleIngredient = (ingredientName: string) => {
        setRemovedIngredients(previousRemoved => {
            const updated = new Set(previousRemoved);
            if (updated.has(ingredientName)) {
                updated.delete(ingredientName);
            } else {
                updated.add(ingredientName);
            }
            return updated;
        });
    };

    const currentAddons = schema.options.find(option => option.name === selectedVariant.name)?.addons || [];
    const baseCost = parseCostToNumber(selectedVariant.cost);
    const addonsTotalCost = selectedAddons.reduce((sum, addon) => sum + parseCostToNumber(addon.cost), 0);
    const totalCost = baseCost + addonsTotalCost;
    const totalCostDisplay = `${totalCost % 1 === 0 ? totalCost.toFixed(0) : totalCost.toFixed(2)} ₽`;

    return (
        <div className={styles.modalContainer}>
            <div className={styles.imageWrapper}>
                <Image src={product.imageUrl} alt={product.name} fill className={styles.image} />
            </div>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{product.name}</h2>
                    <p className={styles.variantInfo}>
                        {selectedVariant.name}, {selectedVariant.weight}, {selectedVariant.kkal} ккал
                    </p>
                    <p className={styles.description}>
                        {ingredients.map((ingredient, index) => (
                            <React.Fragment key={ingredient.name}>
                                <span onClick={() => toggleIngredient(ingredient.name)} className={clsx(styles.ingredient, removedIngredients.has(ingredient.name) ? styles.removedIngredient : '')}>
                                    {ingredient.name}
                                    {ingredient.isRemovable && (
                                        <button className={styles.removeButton} aria-label={removedIngredients.has(ingredient.name) ? `Вернуть ${ingredient.name}` : `Удалить ${ingredient.name}`}>
                                            {removedIngredients.has(ingredient.name) ? <Undo2 size={10} /> : <X />}
                                        </button>
                                    )}
                                </span>
                                {index < ingredients.length - 1 && ', '}
                            </React.Fragment>
                        ))}
                    </p>
                </div>
                <div className={styles.variants}>
                    <RadioButton
                        customStyle={{ gridTemplateColumns: `repeat(${variantOptions.length}, 1fr)`, display: 'grid' }}
                        options={variantOptions}
                        selected={selectedVariant.name}
                        onChange={handleVariantChange}
                    />
                </div>
                {currentAddons.length > 0 && (
                    <>
                        <h3 className={styles.sectionTitle}>Добавить по вкусу</h3>
                        <div className={styles.addons}>
                            <div className={styles.addonsList}>
                                {currentAddons.map(addon => {
                                    const isSelected = selectedAddons.some(selected => selected.name === addon.name);
                                    return (
                                        <div
                                            key={addon.name}
                                            className={`${styles.addon} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleAddon(addon)}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Переключить ${addon.name}`}
                                        >
                                            <Image src={addon.imageUrl} alt={addon.name} width={80} height={80} className={styles.addonImage} />
                                            <p className={styles.addonName}>{addon.name}</p>
                                            <p className={styles.addonCost}>{addon.cost} ₽</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
                <div className={styles.footer}>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => {
                            const item: CartItem = {
                                name: product.name,
                                sectionId: product.sectionId,
                                description: product.description,
                                imageUrl: product.imageUrl,
                                count: 1,
                                removedIngredients: Array.from(removedIngredients),
                                addons: selectedAddons.map(addon => addon.name),
                            };
                            console.log(item);

                            onAddToCart(item);
                            onClose();
                        }}
                    >
                        Добавить в корзину за {totalCostDisplay}
                    </Button>
                </div>
            </div>
        </div>
    );
}
