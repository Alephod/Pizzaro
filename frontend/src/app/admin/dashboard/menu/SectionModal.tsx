'use client';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input/Input';
import slugify from 'slugify';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import type { FormEvent } from 'react';
import style from './SectionModal.module.scss';
import commonStyle from './CommonModal.module.scss';
import clsx from 'clsx';

interface OptionField {
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

type OptionErrors = Record<string, string>;

export default function SectionModal({ mode, initialData, onSubmit }: SectionModalProps) {
    const optionIdCounterRef = useRef(1);
    const generateOptionId = (prefix = 'id') => `${prefix}_${optionIdCounterRef.current++}`;
    const [sectionName, setSectionName] = useState(initialData?.name ?? '');
    const [sectionSlug, setSectionSlug] = useState(initialData?.slug ?? '');
    const [isSlugManual, setIsSlugManual] = useState(false);
    const initialOptions = initialData?.schema?.options ?? ['Вариант 1', 'Вариант 2'];
    const [optionFields, setOptionFields] = useState<OptionField[]>(initialOptions.map(value => ({ id: generateOptionId('opt'), value })));
    const [newlyAddedOptionId, setNewlyAddedOptionId] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ name?: string; slug?: string; options?: OptionErrors }>({});

    useEffect(() => {
        if (!isSlugManual) {
            setSectionSlug(slugify(sectionName, { lower: true, strict: true }));
        }
    }, [sectionName, isSlugManual]);

    useEffect(() => {
        if (!newlyAddedOptionId) return;
        const timer = setTimeout(() => {
            const el = document.querySelector<HTMLInputElement>(`input[data-option-id="${newlyAddedOptionId}"]`);
            if (el) el.focus();
        }, 10);
        return () => clearTimeout(timer);
    }, [newlyAddedOptionId]);

    const updateOptionValue = (optionId: string, newValue: string) => {
        setOptionFields(prev => prev.map(o => (o.id === optionId ? { ...o, value: newValue } : o)));
        setValidationErrors(prev => {
            if (!prev.options) return prev;
            const copy = { ...prev.options };
            delete copy[optionId];
            const hasKeys = Object.keys(copy).length > 0;
            return hasKeys ? { ...prev, options: copy } : { ...prev, options: undefined };
        });
    };

    const addNewOption = () => {
        const newOption: OptionField = { id: generateOptionId('opt'), value: '' };
        setOptionFields(prev => [...prev, newOption]);
        setNewlyAddedOptionId(newOption.id);
        setValidationErrors(prev => {
            if (prev.options && prev.options['__global']) {
                const copy = { ...prev.options };
                delete copy['__global'];
                const hasKeys = Object.keys(copy).length > 0;
                return hasKeys ? { ...prev, options: copy } : { ...prev, options: undefined };
            }
            return prev;
        });
    };

    const removeOption = (optionId: string) => {
        setOptionFields(prev => prev.filter(o => o.id !== optionId));
        setValidationErrors(prev => {
            if (!prev.options) return prev;
            const copy = { ...prev.options };
            delete copy[optionId];
            const hasKeys = Object.keys(copy).length > 0;
            return hasKeys ? { ...prev, options: copy } : { ...prev, options: undefined };
        });
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string; slug?: string; options?: OptionErrors } = {};
        if (!sectionName.trim()) newErrors.name = 'Название раздела не может быть пустым';
        if (!sectionSlug.trim()) newErrors.slug = 'Slug не может быть пустым';
        const optsErrors: OptionErrors = {};
        if (optionFields.length === 0) {
            optsErrors['__global'] = 'Должен быть хотя бы один вариант';
        } else {
            optionFields.forEach(o => {
                if (!o.value || !o.value.trim()) {
                    optsErrors[o.id] = 'Значение варианта не может быть пустым';
                }
            });
        }
        if (Object.keys(optsErrors).length > 0) newErrors.options = optsErrors;
        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const focusOnFirstError = () => {
        if (validationErrors.name) {
            const el = document.querySelector<HTMLInputElement>('input[placeholder="Название"]');
            el?.focus();
            return;
        }
        if (validationErrors.slug) {
            const el = document.querySelector<HTMLInputElement>('input[placeholder="slug"]');
            el?.focus();
            return;
        }
        if (validationErrors.options) {
            const keys = Object.keys(validationErrors.options);
            if (validationErrors.options['__global']) {
                const first = optionFields[0];
                if (first) {
                    const el = document.querySelector<HTMLInputElement>(`input[data-option-id="${first.id}"]`);
                    el?.focus();
                }
                return;
            }
            for (const k of keys) {
                if (k === '__global') continue;
                const el = document.querySelector<HTMLInputElement>(`input[data-option-id="${k}"]`);
                if (el) {
                    el.focus();
                    return;
                }
            }
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setTimeout(focusOnFirstError, 0);
            return;
        }
        onSubmit({
            name: sectionName.trim(),
            slug: sectionSlug.trim(),
            schema: { options: optionFields.map(o => o.value.trim()) },
        });
    };

    const handleFormClear = () => {
        setSectionName('');
        setSectionSlug('');
        setIsSlugManual(false);
        setOptionFields([]);
        setValidationErrors({});
        setNewlyAddedOptionId(null);
    };

    return (
        <form className={commonStyle.form} onSubmit={handleFormSubmit} noValidate>
            <h2 className={commonStyle.title}>{mode === 'add' ? 'Добавить раздел' : 'Редактировать раздел'}</h2>
            <div className={style.sectionFields}>
                <div className={commonStyle.field}>
                    <Input
                        placeholder="Название"
                        value={sectionName}
                        onChange={e => {
                            setSectionName(e.target.value);
                            setValidationErrors(prev => ({ ...prev, name: undefined, slug: undefined }));
                        }}
                        error={!!validationErrors.name}
                        errorMessage={validationErrors.name}
                    />
                </div>
                <div className={commonStyle.field}>
                    <Input
                        placeholder="slug"
                        value={sectionSlug}
                        onChange={e => {
                            setSectionSlug(e.target.value);
                            setIsSlugManual(true);
                            setValidationErrors(prev => ({ ...prev, slug: undefined }));
                        }}
                        error={!!validationErrors.slug}
                        errorMessage={validationErrors.slug}
                        rightAdornment={
                            <RotateCw
                                size={22}
                                aria-label="regen-slug"
                                onClick={() => {
                                    setSectionSlug(slugify(sectionName, { lower: true, strict: true }));
                                    setIsSlugManual(false);
                                }}
                            />
                        }
                    />
                </div>
            </div>
            <h3 className={commonStyle.title}>Варианты</h3>
            <div className={style.options}>
                {optionFields.map(opt => {
                    const optError = validationErrors.options?.[opt.id];
                    return (
                        <div key={opt.id} className={clsx(style.option, optError ? style.optionError : '')}>
                            <Input data-option-id={opt.id} value={opt.value} size={Math.max(1, Math.floor(opt.value.length * 1.16))} onChange={e => updateOptionValue(opt.id, e.target.value)} />
                            <button type="button" onClick={() => removeOption(opt.id)}>
                                ✕
                            </button>
                        </div>
                    );
                })}
                <span className={style.optionAdd} onClick={addNewOption}>
                    + Добавить
                </span>
                {validationErrors.options && (
                    <div style={{ color: 'var(--danger)', fontSize: '14px' }}>
                        {validationErrors.options?.['__global'] && <div>{validationErrors.options['__global']}</div>}
                        {Object.keys(validationErrors.options ?? {}).some(k => k !== '__global' && validationErrors.options?.[k]) && <div>Все варианты должны быть заполнены</div>}
                    </div>
                )}
            </div>
            <div className={commonStyle.footer}>
                {mode === 'add' && (
                    <Button size="md" type="button" variant="secondary" onClick={handleFormClear}>
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
