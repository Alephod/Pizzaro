'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { RadioGroup } from '@/components/ui/radio/Radio';
import { TimeSlots } from '@/components/time-slots/TimeSlots';
import { getErrorMessage, normalizePrice } from '@/utils';
import type { ProfileDataFromDB } from '@/types/profile';
import styles from './Checkout.module.scss';
import clsx from 'clsx';
import { useInfoModal } from '@/components/info-modal/InfoModal';

interface CheckoutClientProps {
    initialProfile: ProfileDataFromDB;
}

export default function CheckoutClient({ initialProfile }: CheckoutClientProps) {
    const router = useRouter();
    const { showInfo } = useInfoModal();
    const { items, clear } = useCart();

    const [profile] = useState<ProfileDataFromDB>(initialProfile);
    const [cartHydrated, setCartHydrated] = useState(false);

    const [customerName, setCustomerName] = useState(initialProfile.data.name || '');
    const [phone, setPhone] = useState(initialProfile.data.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryTime, setDeliveryTime] = useState<'asap' | 'other' | string>('asap');
    const [customTime, setCustomTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const [savedAddresses] = useState<string[]>(initialProfile.data.addresses || []);
    const [newlyAddedAddresses, setNewlyAddedAddresses] = useState<string[]>([]);

    const [nameError, setNameError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [addressError, setAddressError] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (initialProfile.data.addresses && initialProfile.data.addresses.length > 0) {
            setDeliveryAddress(initialProfile.data.addresses[0]);
        }
        setCartHydrated(true);
    }, [initialProfile]);

    const totalAmount = items.reduce((sum, item) => sum + item.count * item.cost, 0);
    const totalAmountDisplay = normalizePrice(totalAmount);

    const handleAddAddress = (newAddress: string) => {
        const trimmedAddress = newAddress.trim();
        if (trimmedAddress && !savedAddresses.includes(trimmedAddress) && !newlyAddedAddresses.includes(trimmedAddress)) {
            setNewlyAddedAddresses(prev => [...prev, trimmedAddress]);
            setDeliveryAddress(trimmedAddress);
            setAddressError(false);
        }
    };

    const validateForm = (): boolean => {
        let valid = true;

        if (!customerName.trim()) { setNameError(true); valid = false; } else setNameError(false);
        if (!phone.trim()) { setPhoneError(true); valid = false; } else setPhoneError(false);
        if (!deliveryAddress.trim()) { setAddressError(true); valid = false; } else setAddressError(false);

        return valid;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm() || isPlacingOrder) return;

        setIsPlacingOrder(true);

        const finalDeliveryTime =
            deliveryTime === 'asap'
                ? 'Как можно скорее'
                : deliveryTime === 'other'
                    ? customTime.trim() || 'В указанное время'
                    : deliveryTime;

        const orderPayload = {
            customerName: customerName.trim(),
            phone: phone.trim(),
            address: deliveryAddress.trim(),
            deliveryTime: finalDeliveryTime,
            paymentMethod,
            items: items.map(item => ({
                name: item.name,
                variant: item.variant,
                count: item.count,
                cost: item.cost,
                removedIngredients: item.removedIngredients,
                addons: item.addons,
            })),
            total: totalAmount,
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) throw new Error('Failed to create order');

            const { id } = await response.json();

            // Сохраняем новые адреса в профиль (если были)
            if (newlyAddedAddresses.length > 0 && profile?.id) {
                await fetch(`/api/user/${profile.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        addresses: [...savedAddresses, ...newlyAddedAddresses],
                    }),
                });
            }

            clear();
            router.push(`/order/${id}`);
        } catch (error) {
            void showInfo(`Не удалось оформить заказ: ${getErrorMessage(error)}`, 'Ошибка');
            setIsPlacingOrder(false);
        }
    };

    return (
        <main className={clsx(styles.checkout, 'container')}>
            <div className={styles.form}>
                <h1 className={styles.title}>Оформление заказа</h1>

                {/* Поля формы без изменений */}
                <div className={styles.field}>
                    <label>Имя</label>
                    <Input value={customerName} onChange={e => { setCustomerName(e.target.value); setNameError(false); }} placeholder="Ваше имя" error={nameError} errorMessage="Поле обязательно" />
                </div>

                <div className={styles.field}>
                    <label>Телефон</label>
                    <Input value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(false); }} placeholder="+7 (999) 123-45-67" error={phoneError} errorMessage="Поле обязательно" />
                </div>

                <div className={styles.field}>
                    <label>Адрес доставки</label>
                    <Select
                        options={[...savedAddresses, ...newlyAddedAddresses]}
                        value={deliveryAddress}
                        onChange={setDeliveryAddress}
                        onAddNew={handleAddAddress}
                        placeholder="— Выберите или добавьте адрес —"
                        allowAddNew={true}
                        error={addressError}
                        errorMessage="Поле обязательно"
                    />
                </div>

                <div className={styles.field}>
                    <label>Время доставки</label>
                    <div className={styles.timeButtons} suppressHydrationWarning>
                        <Button size="md" variant={deliveryTime === 'asap' ? 'primary' : 'secondary'} onClick={() => setDeliveryTime('asap')}>
                            Побыстрее
                        </Button>
                        <TimeSlots selected={deliveryTime} onSelect={setDeliveryTime} />
                        <Button size="md" variant={deliveryTime === 'other' ? 'primary' : 'secondary'} onClick={() => setDeliveryTime('other')}>
                            Другое время
                        </Button>
                    </div>
                    {deliveryTime === 'other' && (
                        <Input className={styles.customTimeInput} value={customTime} onChange={e => setCustomTime(e.target.value)} placeholder="Например: 18:30" />
                    )}
                </div>

                <div className={styles.field}>
                    <label>Способ оплаты</label>
                    <RadioGroup
                        options={[
                            { value: 'Картой при получении', label: 'Картой при получении' },
                            { value: 'Наличными', label: 'Наличными' },
                        ]}
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                    />
                </div>
            </div>

            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Состав заказа</h2>

                {!cartHydrated ? (
                    <div className={styles.cartLoading}>Загрузка корзины…</div>
                ) : items.length === 0 ? (
                    <div className={styles.emptyCart}>Корзина пуста</div>
                ) : (
                    <>
                        <div className={styles.orderItems}>
                                    {items.map(item => (
                                <div key={item.id} className={styles.orderItem}>
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemName}>
                                            {item.name} {item.variant && `· ${item.variant}`}
                                        </span>
                                        <span className={styles.itemQuantity}>× {item.count}</span>
                                            </div>
                                            <div className={styles.itemPrice}>
                                        {normalizePrice(item.cost * item.count)}
                                            </div>

                                            {item.removedIngredients?.length > 0 && (
                                        <div className={styles.modifiers}>
                                                    <span className={styles.removed}>− {item.removedIngredients.join(', ')}</span>
                                        </div>
                                            )}

                                            {item.addons?.length > 0 && (
                                        <div className={styles.modifiers}>
                                                    <span className={styles.added}>+ {item.addons.join(', ')}</span>
                                        </div>
                                            )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.total}>
                            <span>Итого</span>
                            <span className={styles.totalPrice}>{totalAmountDisplay}</span>
                        </div>

                        <Button
                            size="lg"
                            variant="primary"
                            className={styles.placeOrderBtn}
                            onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder || items.length === 0}
                                    loading={isPlacingOrder}
                        >
                                    {isPlacingOrder ? 'Оформляем…' : 'Оформить заказ'}
                        </Button>
                    </>
                )}
            </aside>
        </main>
    );
}