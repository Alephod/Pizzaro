'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input/Input';

import { Button } from '@/components/ui/button/Button';
import RadioButton from '../../../../components/ui/radio-button/RadioButton';
import TextArea from '@/components/ui/textarea/Textarea';
import PhotoUpload from '@/components/ui/photo-upload/PhotoUpload';
import clsx from 'clsx';

import type { FormEvent, ChangeEvent } from 'react';
import type { MenuSection } from './AdminMenuClient';
import type { ItemVariant } from './AdminMenuClient';

import style from './AddItemModal.module.scss';
import commonStyle from './CommonModal.module.scss';

export interface ItemFormData {
    name: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
    data: ItemVariant[];
}

interface AddItemModalProps {
    section: MenuSection;
    onSubmit: (data: ItemFormData) => void;
}

export default function AddItemModal({ section, onSubmit }: AddItemModalProps) {
    const schema = section.schema || { fields: [], options: [] };
    const fields = schema.fields;
    const options = schema.options;

    const commonFields = fields.filter(f => f.type !== 'number');
    const variantFields = fields.filter(f => f.type === 'number');

    const [selectedOption, setSelectedOption] = useState(options[0] || '');
    // Стандартные поля
    const [commonValues, setCommonValues] = useState<Record<string, string>>(() => commonFields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}));

    // Поля вариантов
    const [variantValues, setVariantValues] = useState(() => {
        const emptyFields = Object.fromEntries(variantFields.map(f => [f.name, '']));
        return Object.fromEntries(options.map(opt => [opt, { ...emptyFields }]));
    });

    const handleCommonChange = (fieldName: string, value: string) => {
        setCommonValues(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleVariantChange = (option: string, fieldName: string, value: string) => {
        setVariantValues(prev => ({
            ...prev,
            [option]: { ...prev[option], [fieldName]: value },
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleCommonChange('Фото', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = () => {
        handleCommonChange('Фото', '');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const name = commonValues['Название']?.trim();
        // TODO Проверка чтобы все поля были заполнены

        const formData: ItemFormData = {
            name,
            description: commonValues['Ингредиенты'] || commonValues['Описание'] || null,
            imageUrl: commonValues['Фото'] || null,
            order: section.items.length + 1,
            data: options.map(opt => ({
                name: opt,
                weight: variantValues[opt]['Вес'] || '',
                kkal: variantValues[opt]['Ккал'] || '',
                cost: variantValues[opt]['Цена'] || '',
            })),
        };
        console.log(formData);

        onSubmit(formData);
    };

    const handleClear = () => {
        setCommonValues(commonFields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}));
        setVariantValues(options.reduce((acc, opt) => ({ ...acc, [opt]: variantFields.reduce((vAcc, f) => ({ ...vAcc, [f.name]: '' }), {}) }), {}));
        setSelectedOption(options[0] || '');
    };

    return (
        <form className={commonStyle.form} onSubmit={handleSubmit}>
            <h2 className={commonStyle.title}>Добавить позицию</h2>

            <div className={style.sectionFields}>
                {commonFields.map(field => (
                    <div key={field.name} className={clsx(commonStyle.field, field.type === 'file' ? style.photo : '', field.type === 'textarea' ? style.textarea : '')}>
                        {field.type === 'file' ? (
                            <PhotoUpload onChange={handleFileChange} label="Загрузите фото" accept="image/*" preview={commonValues['Фото'] || null} onDelete={handleDeletePhoto} />
                        ) : field.type === 'textarea' ? (
                            <TextArea
                                className={style.text}
                                name="desc"
                                placeholder={field.name}
                                value={commonValues[field.name] || ''}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCommonChange(field.name, e.target.value)}
                            />
                        ) : (
                            <Input
                                placeholder={field.name}
                                value={commonValues[field.name]}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCommonChange(field.name, e.target.value)}
                                type={field.type}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className={commonStyle.radioContainer}>
                <RadioButton options={options} selected={selectedOption} onChange={setSelectedOption} />
            </div>

            <div className={style.variantInputs}>
                {variantFields.map(field => (
                    <Input
                        key={field.name}
                        placeholder={field.name}
                        value={variantValues[selectedOption]?.[field.name] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleVariantChange(selectedOption, field.name, e.target.value)}
                        type="text"
                    />
                ))}
            </div>

            <div className={commonStyle.footer}>
                <Button size="md" type="button" variant="secondary" onClick={handleClear}>
                    Очистить всё
                </Button>
                <Button size="md" type="submit" variant="primary">
                    Добавить
                </Button>
            </div>
        </form>
    );
}
