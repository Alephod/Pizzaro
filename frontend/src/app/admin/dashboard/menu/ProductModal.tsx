'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import clsx from 'clsx';

import { Input } from '@/components/ui/input/Input';
import TextArea from '@/components/ui/textarea/Textarea';
import PhotoUpload from '@/components/ui/photo-upload/PhotoUpload';
import { Button } from '@/components/ui/button/Button';
import RadioButton from '../../../../components/ui/radio-button/RadioButton';

import type { MenuSection, ItemVariant } from './AdminMenuClient';

import style from './ProductModal.module.scss';
import commonStyle from './CommonModal.module.scss';

export interface ItemData {
    name: string;
    description: string;
    imageUrl: string;
    order: number;
    data: ItemVariant[];
}

interface AddProductModalProps {
    section: MenuSection;
    mode: 'edit' | 'add' | 'view';
    itemData?: Partial<ItemData> | ItemData;
    onSubmit: (data: ItemData) => void;
}

export default function ProductModal({ section, onSubmit, mode, itemData }: AddProductModalProps) {
    const options = useMemo<string[]>(() => (Array.isArray(section?.schema?.options) ? section.schema.options : []), [section]);

    const defaultOption = useMemo(() => options[0] ?? '', [options]);

    const itemDataVariants = useMemo<ItemVariant[]>(() => (Array.isArray(itemData?.data) ? (itemData.data as ItemVariant[]) : []), [itemData]);

    type VariantMap = Record<string, { weight: string; kkal: string; cost: string }>;
    const makeEmptyVariant = () => ({ weight: '', kkal: '', cost: '' });

    const buildInitialVariants = useCallback<() => VariantMap>(() => {
        const initial: VariantMap = {};
        options.forEach(opt => {
            initial[opt] = makeEmptyVariant();
        });

        if (itemDataVariants && itemDataVariants.length) {
            itemDataVariants.forEach(d => {
                if (!d || typeof d.name !== 'string') return;
                if (initial[d.name] !== undefined) {
                    initial[d.name] = {
                        weight: (d.weight as string) ?? '',
                        kkal: (d.kkal as string) ?? '',
                        cost: (d.cost as string) ?? '',
                    };
                }
            });
        }

        return initial;
    }, [options, itemDataVariants]);

    const [name, setName] = useState<string>(itemData?.name ?? '');
    const [description, setDescription] = useState<string>(itemData?.description ?? '');
    const [photo, setPhoto] = useState<string>(itemData?.imageUrl ?? '');
    const [variantValues, setVariantValues] = useState<VariantMap>(() => buildInitialVariants());
    const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

    // sync state при изменении
    useEffect(() => {
        setName(itemData?.name ?? '');
        setDescription(itemData?.description ?? '');
        setPhoto(itemData?.imageUrl ?? '');
        setVariantValues(buildInitialVariants());
        setSelectedOption(defaultOption);
    }, [section?.id, itemData?.name, itemData?.description, itemData?.imageUrl, buildInitialVariants, defaultOption]);

    const isReadOnly = mode === 'view';

    const resolveImageSrc = (src?: string | null) => {
        if (!src) return '';
        if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
        if (typeof window !== 'undefined') return `${window.location.origin.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        return `${base.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`;
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDeletePhoto = () => setPhoto('');

    const handleVariantChange = (option: string, field: keyof VariantMap[string], value: string) => {
        setVariantValues(prev => ({
            ...prev,
            [option]: { ...prev[option], [field]: value },
        }));
    };

    const handleClear = () => {
        setName('');
        setDescription('');
        setPhoto('');
        setVariantValues(options.reduce((acc, opt) => ({ ...acc, [opt]: makeEmptyVariant() }), {} as VariantMap));
        setSelectedOption(defaultOption);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        const trimmedName = (name ?? '').trim();
        if (!trimmedName) return;

        const formData: ItemData = {
            name: trimmedName,
            description: description ?? '',
            imageUrl: photo ?? '',
            order: mode === 'add' ? (section.items?.length ?? 0) + 1 : (itemData?.order as number) ?? (section.items?.length ?? 0) + 1,
            data: options.map(opt => ({
                name: opt,
                weight: variantValues[opt]?.weight ?? '',
                kkal: variantValues[opt]?.kkal ?? '',
                cost: variantValues[opt]?.cost ?? '',
            })) as ItemVariant[],
        };

        onSubmit(formData);
    };

    return (
        <form className={commonStyle.form} onSubmit={handleSubmit}>
            <h2 className={commonStyle.title}>{mode === 'add' ? 'Добавить позицию' : mode === 'edit' ? `Изменить ${itemData?.name ?? ''}` : `Просмотр ${itemData?.name ?? ''}`}</h2>

            <div className={style.sectionFields}>
                <div className={clsx(commonStyle.field)}>
                    <Input placeholder="Название" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} type="text" disabled={isReadOnly} />
                </div>

                <div className={clsx(commonStyle.field, style.textarea)}>
                    <TextArea
                        className={style.text}
                        name="description"
                        placeholder="Описание"
                        value={description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                <div className={clsx(commonStyle.field, style.photo)}>
                    <PhotoUpload
                        onChange={handleFileChange}
                        label={isReadOnly ? undefined : 'Загрузите фото'}
                        accept="image/*"
                        preview={photo ? resolveImageSrc(photo) : null}
                        onDelete={isReadOnly ? undefined : handleDeletePhoto}
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            {options.length > 0 && (
                <>
                    <div className={commonStyle.radioContainer}>
                        <RadioButton options={options} selected={selectedOption} onChange={opt => setSelectedOption(opt)} />
                    </div>

                    <div className={style.variantInputs}>
                        {selectedOption ? (
                            <>
                                <Input
                                    placeholder="Вес (объем)"
                                    value={variantValues[selectedOption]?.weight || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleVariantChange(selectedOption, 'weight', e.target.value)}
                                    type="text"
                                    disabled={isReadOnly}
                                />
                                <Input
                                    placeholder="Ккал"
                                    value={variantValues[selectedOption]?.kkal || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleVariantChange(selectedOption, 'kkal', e.target.value)}
                                    type="text"
                                    disabled={isReadOnly}
                                />
                                <Input
                                    placeholder="Цена"
                                    value={variantValues[selectedOption]?.cost || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleVariantChange(selectedOption, 'cost', e.target.value)}
                                    type="text"
                                    disabled={isReadOnly}
                                />
                            </>
                        ) : (
                            <div className={style.noOptions}>Нет доступных вариантов</div>
                        )}
                    </div>
                </>
            )}

            <div className={commonStyle.footer}>
                {mode !== 'view' && (
                    <Button size="md" type="button" variant="secondary" onClick={handleClear} disabled={isReadOnly}>
                        Очистить всё
                    </Button>
                )}

                {mode !== 'view' && (
                    <Button size="md" type="submit" variant="primary">
                        {mode === 'add' ? 'Добавить' : 'Сохранить'}
                    </Button>
                )}
            </div>
        </form>
    );
}
