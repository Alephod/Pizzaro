'use client';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input/Input';
import slugify from 'slugify';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';

import type { FormEvent } from 'react';

import style from './SectionModal.module.scss';
import commonStyle from './CommonModal.module.scss';

interface FieldOption {
    id: string;
    value: string;
}

export interface SectionData {
    name: string;
    slug: string;
    schema: {
        options: string[];
    };
}

interface SectionModalProps {
    mode: 'add' | 'edit';
    initialData?: SectionData;
    onSubmit: (data: SectionData) => void;
}

export default function SectionModal({ mode, initialData, onSubmit }: SectionModalProps) {
    const idCounterRef = useRef(1);
    const genId = (prefix = 'id') => `${prefix}_${idCounterRef.current++}`;

    const [sectionName, setSectionName] = useState(initialData?.name || '');
    const [sectionSlug, setSectionSlug] = useState(initialData?.slug || '');
    const [options, setOptions] = useState<FieldOption[]>(
        initialData?.schema.options.map(opt => ({ id: genId('opt'), value: opt })) || [
            { id: genId('opt'), value: 'Вариант 1' },
            { id: genId('opt'), value: 'Вариант 2' },
        ]
    );

    const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);

    const updateOptionValue = (optionId: string, newValue: string) => {
        setOptions(prev => prev.map(o => (o.id === optionId ? { ...o, value: newValue } : o)));
    };

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
            if (el) el.focus();
        }, 10);
        return () => clearTimeout(timer);
    }, [focusedOptionId]);

    useEffect(() => {
        if (!initialData || mode === 'add') {
            const slug = slugify(sectionName, { lower: true, strict: true });
            setSectionSlug(slug);
        }
    }, [sectionName, initialData, mode]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const submittedOptions: string[] = options.map(o => o.value);
        onSubmit({
            name: sectionName,
            slug: sectionSlug,
            schema: {
                options: submittedOptions,
            },
        });
    };

    const handleClear = () => {
        setSectionName('');
        setSectionSlug('');
        setOptions([]);
        setFocusedOptionId(null);
    };

    return (
        <form className={commonStyle.form} onSubmit={handleSubmit}>
            <h2 className={commonStyle.title}>{mode === 'add' ? 'Добавить раздел' : 'Редактировать раздел'}</h2>

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

            <h3 className={commonStyle.title}>Варианты</h3>
            <div className={style.options}>
                {options.map(opt => (
                    <div key={opt.id} className={style.option}>
                        <Input
                            size={Math.max(1, Math.floor(opt.value.length * 1.16))}
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

            <div className={commonStyle.footer}>
                {mode === 'add' && (
                    <Button size="md" type="button" variant="secondary" onClick={handleClear}>
                        Очистить всё
                    </Button>
                )}
                <Button className={style.submitBtn} type="submit" size="md" variant="primary">
                    {mode === 'add' ? 'Сохранить раздел' : 'Сохранить изменения'}
                </Button>
            </div>
        </form>
    );
}
