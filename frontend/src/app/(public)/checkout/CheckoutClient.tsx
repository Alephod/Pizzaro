'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { RadioGroup } from '@/components/ui/radio/Radio';
import { TimeSlots } from '@/components/time-slots/TimeSlots';
import { normalizePrice } from '@/utils';
import type { ProfileDataFromDB } from '@/types/profile';
import type { CartItem } from '@/types/cart';
import styles from './Checkout.module.scss';
import clsx from 'clsx';

// Генерация случайного ID 
const generateOrderId = () => {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

interface CheckoutClientProps {
    initialProfile: ProfileDataFromDB;
}

export default function CheckoutClient({ initialProfile }: CheckoutClientProps) {
    const { items, clear } = useCart();

    const [profile, setProfile] = useState<ProfileDataFromDB>(initialProfile);
    const [cartHydrated, setCartHydrated] = useState(false);
    // Форма
    const [customerName, setCustomerName] = useState(initialProfile.data.name || '');
    const [phone, setPhone] = useState(initialProfile.data.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryTime, setDeliveryTime] = useState<'asap' | 'other' | string>('asap');
    const [customTime, setCustomTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

    // Addresses management
    const [savedAddresses, setSavedAddresses] = useState<string[]>(initialProfile.data.addresses || []);
    const [newlyAddedAddresses, setNewlyAddedAddresses] = useState<string[]>([]);

    // Errors
    const [nameError, setNameError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [addressError, setAddressError] = useState(false);

    useEffect(() => {
        if (initialProfile.data.addresses && initialProfile.data.addresses.length > 0) {
            setDeliveryAddress(initialProfile.data.addresses[0]);
        }
        // как только useEffect отработал — мы точно на клиенте
        setCartHydrated(true);
    }, [initialProfile]);

    useEffect(() => {
        if (initialProfile.data.addresses && initialProfile.data.addresses.length > 0) {
            setDeliveryAddress(initialProfile.data.addresses[0]);
        }
    }, [initialProfile]);

    const totalAmount = items.reduce((sum, item) => sum + item.count * item.cost, 0);
    const totalAmountDisplay = normalizePrice(totalAmount);

    const handleAddAddress = (newAddress: string) => {
        const trimmedAddress = newAddress.trim();
        if (trimmedAddress && !savedAddresses.includes(trimmedAddress)) {
            setSavedAddresses(prev => [...prev, trimmedAddress]);
            setNewlyAddedAddresses(prev => [...prev, trimmedAddress]);
            setDeliveryAddress(trimmedAddress);
            setAddressError(false);
        }
    };

    const saveNewAddressesToProfile = async () => {
        if (newlyAddedAddresses.length === 0 || !profile) return;

        const updates = {
            addresses: [...(profile.data.addresses || []), ...newlyAddedAddresses],
        };

        try {
            const response = await fetch(`/api/user/${profile.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                console.error('Ошибка обновления адресов');
                return;
            }

            const result = await response.json();

            setProfile({
                ...profile,
                data: {
                    ...profile.data,
                    addresses: result.data.addresses || [],
                },
            });
            setNewlyAddedAddresses([]);
        } catch (error) {
            console.error('Ошибка при сохранении адресов:', error);
        }
    };

    const validateForm = () => {
        let isValid = true;

        if (!customerName.trim()) {
            setNameError(true);
            isValid = false;
        } else {
            setNameError(false);
        }

        if (!phone.trim()) {
            setPhoneError(true);
            isValid = false;
        } else {
            setPhoneError(false);
        }

        if (!deliveryAddress.trim()) {
            setAddressError(true);
            isValid = false;
        } else {
            setAddressError(false);
        }

        return isValid;
    };

    const handlePlaceOrder = () => {
        if (!validateForm()) return;

        const finalDeliveryTime =
            deliveryTime === 'asap'
                ? 'Как можно скорее'
                : deliveryTime === 'other'
                    ? customTime.trim() || 'Вручную'
                    : deliveryTime;

        const orderId = generateOrderId();
        const orderUrl = `/order/${orderId}`;

        const orderData = {
            id: orderId,
            name: customerName,
            phone,
            address: deliveryAddress,
            deliveryTime: finalDeliveryTime,
            paymentMethod,
            items: items.map((item: CartItem) => ({
                id: item.id,
                name: item.name,
                variant: item.variant,
                count: item.count,
                cost: item.cost,
                removedIngredients: item.removedIngredients,
                addons: item.addons,
            })),
            total: totalAmount,
            createdAt: new Date().toISOString(),
        };

        console.log('Заказ успешно оформлен!');
        console.log('Ссылка на заказ:', orderUrl);
        console.log('Данные заказа:', orderData);

        saveNewAddressesToProfile();
        clear();
        alert(`Заказ оформлен! Переход по ссылке: ${orderUrl}`);
    };

    return (
        <main className={clsx(styles.checkout, 'container')}>
            <div className={styles.form}>
                <h1 className={styles.title}>Оформление заказа</h1>

                <div className={styles.field}>
                    <label>Имя</label>
                    <Input
                        value={customerName}
                        onChange={e => {
                            setCustomerName(e.target.value);
                            setNameError(false);
                        }}
                        placeholder="Ваше имя"
                        error={nameError}
                        errorMessage="Поле обязательно для заполнения"
                    />
                </div>

                <div className={styles.field}>
                    <label>Телефон</label>
                    <Input
                        value={phone}
                        onChange={e => {
                            setPhone(e.target.value);
                            setPhoneError(false);
                        }}
                        placeholder="+7 (999) 123-45-67"
                        error={phoneError}
                        errorMessage="Поле обязательно для заполнения"
                    />
                </div>

                <div className={styles.field}>
                    <label>Адрес доставки</label>
                    <Select
                        options={savedAddresses}
                        value={deliveryAddress}
                        onChange={(value) => {
                            setDeliveryAddress(value);
                            setAddressError(false);
                        }}
                        placeholder="— Выберите адрес —"
                        allowAddNew={true}
                        onAddNew={handleAddAddress}
                        error={addressError}
                        errorMessage="Поле обязательно для заполнения"
                    />
                </div>

                <div className={styles.field}>
                    <label>Время доставки</label>
                    <div className={styles.timeButtons} suppressHydrationWarning={true}>
                        <Button
                            size="md"
                            variant={deliveryTime === 'asap' ? 'primary' : 'secondary'}
                            onClick={() => setDeliveryTime('asap')}
                        >
                            Побыстрее
                        </Button>

                        <TimeSlots
                            selected={deliveryTime}
                            onSelect={setDeliveryTime}
                        />

                        <Button
                            size="md"
                            variant={deliveryTime === 'other' ? 'primary' : 'secondary'}
                            onClick={() => setDeliveryTime('other')}
                        >
                            Другое время
                        </Button>
                    </div>

                    {deliveryTime === 'other' && (
                        <Input
                            className={styles.customTimeInput}
                            value={customTime}
                            onChange={e => setCustomTime(e.target.value)}
                            placeholder="Например: 18:30"
                        />
                    )}
                </div>

                <div className={styles.field}>
                    <h2>Способ оплаты</h2>
                    <RadioGroup
                        options={[
                            { value: 'card', label: 'Картой при получении' },
                            { value: 'cash', label: 'Наличными' },
                        ]}
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                    />
                </div>
            </div>

            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Состав заказа</h2>

                {!cartHydrated ? (
                    <div className={styles.cartLoading}>
                        Загрузка корзины…
                    </div>
                ) : (
                    <>
                        <div className={styles.orderItems}>
                            {items.map((item: CartItem) => (
                                <div key={item.id} className={styles.orderItem}>
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemName}>
                                            {item.name} {item.variant && `· ${item.variant}`}
                                        </span>
                                        <span className={styles.itemQuantity}>× {item.count}</span>
                                        <div className={styles.itemPrice}>
                                        {normalizePrice(item.cost * item.count)}
                                    </div>
                                    </div>

                                    

                                    {item.removedIngredients?.length ? (
                                        <div className={styles.modifiers}>
                                            <span className={styles.removed}>
                                                − {item.removedIngredients.join(', ')}
                                            </span>
                                        </div>
                                    ) : null}

                                    {item.addons?.length ? (
                                        <div className={styles.modifiers}>
                                            <span className={styles.added}>
                                                + {item.addons.join(', ')}
                                            </span>
                                        </div>
                                    ) : null}
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
                        >
                            Оформить заказ
                        </Button>
                    </>
                )}
            </aside>
        </main>
    );
}