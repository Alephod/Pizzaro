'use client';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input/Input';
import slugify from 'slugify';
import { RotateCw, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';

import type { FormEvent } from 'react';

import style from './AddSectionModal.module.scss';
import commonStyle from './CommonModal.module.scss';

interface FieldOption {
    id: string;
    value: string;
}

interface Field {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'file' | 'number';
}

interface AddSectionModalProps {
    onSubmit: (data: SectionData) => void;
}

interface SubmittedField {
    name: string;
    type: 'text' | 'textarea' | 'file' | 'number';
}

export interface SectionData {
    name: string;
    slug: string;
    schema: {
        fields: SubmittedField[];
        options: string[];
    };
}

export default function AddSectionModal({ onSubmit }: AddSectionModalProps) {
    const idCounterRef = useRef(1);
    const genId = (prefix = 'id') => `${prefix}_${idCounterRef.current++}`;

    const initialFields = [
        { name: 'Название', type: 'text' as const },
        { name: 'Описание', type: 'textarea' as const },
        { name: 'Фото', type: 'file' as const },
        { name: 'Вес', type: 'number' as const },
        { name: 'Ккал', type: 'number' as const },
        { name: 'Цена', type: 'number' as const },
    ];

    const [sectionName, setSectionName] = useState('');
    const [sectionSlug, setSectionSlug] = useState('');
    const [fields, setFields] = useState<Field[]>(initialFields.map(f => ({ ...f, id: genId('field') })));

    // Оставляем состояние options как в оригинале — массив опций (глобально)
    const [options, setOptions] = useState<FieldOption[]>([
        { id: genId('opt'), value: 'Вариант 1' },
        { id: genId('opt'), value: 'Вариант 2' },
    ]);

    const [editableMap, setEditableMap] = useState<Record<string, boolean>>({});
    const toggleEditable = (fieldId: string) => {
        setEditableMap(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
    };

    const updateFieldName = (fieldId: string, newName: string) => {
        setFields(prev => prev.map(f => (f.id === fieldId ? { ...f, name: newName } : f)));
    };

    // Опции теперь управляются глобально (options state)
    const updateOptionValue = (optionId: string, newValue: string) => {
        setOptions(prev => prev.map(o => (o.id === optionId ? { ...o, value: newValue } : o)));
    };

    const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);

    const addOption = () => {
        const newOption: FieldOption = { id: genId('opt'), value: '' };
        setOptions(prev => [...prev, newOption]);
        setFocusedOptionId(newOption.id);
    };

    const removeOption = (optionId: string) => {
        setOptions(prev => prev.filter(o => o.id !== optionId));
    };

    useEffect(() => {
        if (!focusedOptionId) return;
        const timer = setTimeout(() => {
            const el = document.querySelector<HTMLInputElement>(`input[data-option-id="${focusedOptionId}"]`);
            if (el) {
                el.focus();
            }
        }, 10);
        return () => clearTimeout(timer);
    }, [focusedOptionId]);

    useEffect(() => {
        const slug = slugify(sectionName, { lower: true, strict: true });
        setSectionSlug(slug);
    }, [sectionName]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const submittedFields: SubmittedField[] = fields.map(f => ({ name: f.name, type: f.type }));
        const submittedOptions: string[] = options.map(o => o.value);
        onSubmit({
            name: sectionName,
            slug: sectionSlug,
            schema: {
                fields: submittedFields,
                options: submittedOptions,
            },
        });
    };

    const handleClear = () => {
        setSectionName('');
        setSectionSlug('');
        setFields(prev => prev.map((f, i) => ({ ...f, name: initialFields[i].name })));
        setEditableMap({});
        setOptions([]);
    };

    return (
        <form className={commonStyle.form} onSubmit={handleSubmit}>
            <h2 className={commonStyle.title}>Добавить раздел</h2>

            <div className={style.sectionFields}>
                <div className={commonStyle.field}>
                    <Input placeholder="Название" value={sectionName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSectionName(e.target.value)} />
                </div>

                <div className={commonStyle.field}>
                    <Input placeholder="slug" value={sectionSlug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSectionSlug(e.target.value)} />
                    <RotateCw
                        className={commonStyle.fieldIcon}
                        size={22}
                        aria-label="regen-slug"
                        onClick={() => {
                            const slug = slugify(sectionName, { lower: true, strict: true });
                            setSectionSlug(slug);
                        }}
                    />
                </div>
            </div>

            <h3 className={commonStyle.title}>Заголовки полей элементов</h3>

            <div className={style.fields}>
                {fields.map(field => (
                    <div key={field.id} className={commonStyle.field}>
                        <Input value={field.name} disabled={!editableMap[field.id]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFieldName(field.id, e.target.value)} />
                        {editableMap[field.id] ? (
                            <Save className={commonStyle.fieldIcon} size={22} onClick={() => toggleEditable(field.id)} />
                        ) : (
                            <Pencil className={commonStyle.fieldIcon} size={20} onClick={() => toggleEditable(field.id)} />
                        )}
                    </div>
                ))}

                <h3 className={commonStyle.title}>Варианты</h3>
                <div className={style.options}>
                    {options.map(opt => (
                        <div key={opt.id} className={style.option}>
                            <Input
                                size={opt.value.length * 1.16 || 1}
                                data-option-id={opt.id}
                                value={opt.value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOptionValue(opt.id, e.target.value)}
                            />
                            <button type="button" onClick={() => removeOption(opt.id)}>
                                ✕
                            </button>
                        </div>
                    ))}
                    <span className={style.optionAdd} onClick={addOption}>
                        + Добавить
                    </span>
                </div>
            </div>
            <div className={commonStyle.footer}>
                <Button size="md" type="button" variant="secondary" onClick={handleClear}>
                    Очистить всё
                </Button>
                <Button className={style.submitBtn} type="submit" size="md" variant="primary">
                    Сохранить раздел
                </Button>
            </div>
        </form>
    );
}
