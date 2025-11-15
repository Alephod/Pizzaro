'use client';
import { ModalContext } from '@/providers/ModalProvider';
import { useContext, useState } from 'react';
import SectionModal from './SectionModal';
import type { ItemData } from './ProductModal';
import ProductModal from './ProductModal';
import AdminProductCard from '@/components/admin-product-card/AdminProductCard';
import style from './AdminMenu.module.scss';
import { Button } from '@/components/ui/button/Button';
import { ChevronRight, Edit, Pencil, Plus, Save, X } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';

export interface ItemVariant {
    name: string;
    weight: string;
    kkal: string;
    cost: string;
}

export interface Product {
    id: number;
    sectionId: number;
    name: string;
    description?: string;
    imageUrl: string;
    order?: number;
    data: ItemVariant[];
    createdAt: string;
    updatedAt: string;
}

export type SectionSchema = {
    options: string[];
};

export interface SectionFormData {
    name: string;
    slug: string;
    schema: SectionSchema | null;
}

export interface MenuSection {
    id: number;
    name: string;
    slug: string;
    schema: SectionSchema | null;
    order: number;
    items: Product[];
    createdAt: string;
    updatedAt: string;
}

interface Props {
    sectionsData: MenuSection[];
}

export default function AdminMenuClient({ sectionsData }: Props) {
    const { openModal, closeModal } = useContext(ModalContext);
    const [sections, setSections] = useState<MenuSection[]>(sectionsData);
    const [isEditing, setIsEditing] = useState(false);
    const [backupSections, setBackupSections] = useState<MenuSection[] | null>(null);
    const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<number>>(new Set());

    const startEditing = () => {
        setBackupSections(JSON.parse(JSON.stringify(sections)));
        setIsEditing(true);
    };

    const saveChanges = () => {
        // Здесь можно добавить вызов API для сохранения на сервер, например:
        // fetch('/api/menu', { method: 'POST', body: JSON.stringify(sections) });
        console.log('Сохранение изменений:', sections);
        setIsEditing(false);
        setBackupSections(null);
    };

    const cancelChanges = () => {
        if (backupSections) {
            setSections(JSON.parse(JSON.stringify(backupSections)));
        }
        setIsEditing(false);
        setBackupSections(null);
    };

    const toggleSectionCollapse = (sectionId: number) => {
        const newCollapsedIds = new Set(collapsedSectionIds);
        if (newCollapsedIds.has(sectionId)) {
            newCollapsedIds.delete(sectionId);
        } else {
            newCollapsedIds.add(sectionId);
        }
        setCollapsedSectionIds(newCollapsedIds);
    };

    const handleOpenSectionModal = (mode: 'add' | 'edit', section?: MenuSection, insertIndex?: number) => {
        openModal(
            <SectionModal
                mode={mode}
                initialData={section ? { name: section.name, slug: section.slug, schema: section.schema ?? { options: [] } } : undefined}
                onSubmit={(data: SectionFormData) => {
                    const now = new Date().toISOString();
                    if (mode === 'add') {
                        const newSection: MenuSection = {
                            ...data,
                            id: Math.floor(Math.random() * 1000000),
                            items: [],
                            createdAt: now,
                            updatedAt: now,
                            order: 0, // Временное значение, будет обновлено ниже
                        };
                        setSections(prev => {
                            const updatedSections = [...prev];
                            const effectiveInsertIndex = insertIndex ?? updatedSections.length;
                            updatedSections.splice(effectiveInsertIndex, 0, newSection);
                            // Обновляем order для всех секций на основе их позиции в массиве
                            return updatedSections.map((sec, idx) => ({ ...sec, order: idx }));
                        });
                    } else if (mode === 'edit' && section) {
                        setSections(prev => prev.map(s => (s.id === section.id ? { ...s, ...data, updatedAt: now } : s)));
                    }
                    closeModal();
                }}
            />
        );
    };

    const itemToFormData = (item: Product): ItemData => ({
        name: item.name,
        description: item.description ?? '',
        imageUrl: item.imageUrl ?? '',
        order: item.order ?? sections.find(s => s.id === item.sectionId)?.items.length ?? 0,
        data: item.data,
    });

    const handleAddItem = (section: MenuSection) => {
        openModal(
            <ProductModal
                mode="add"
                section={section}
                onSubmit={itemData => {
                    const now = new Date().toISOString();
                    const newItem: Product = {
                        id: Date.now(),
                        sectionId: section.id,
                        name: itemData.name,
                        description: itemData.description ?? '',
                        imageUrl: itemData.imageUrl ?? '',
                        order: itemData.order ?? null,
                        data: itemData.data,
                        createdAt: now,
                        updatedAt: now,
                    };
                    setSections(prev => prev.map(s => (s.id === section.id ? { ...s, items: [...s.items, newItem] } : s)));
                    closeModal();
                }}
            />
        );
    };

    const handleEditItem = (section: MenuSection, item: Product) => {
        openModal(
            <ProductModal
                section={section}
                mode="edit"
                itemData={itemToFormData(item)}
                onSubmit={(itemData: ItemData) => {
                    const now = new Date().toISOString();
                    const updatedItem: Product = {
                        ...item,
                        name: itemData.name,
                        description: itemData.description ?? '',
                        imageUrl: itemData.imageUrl ?? '',
                        order: itemData.order ?? item.order,
                        data: itemData.data,
                        updatedAt: now,
                    };
                    setSections(prev => prev.map(s => (s.id === section.id ? { ...s, items: s.items.map(i => (i.id === item.id ? updatedItem : i)) } : s)));
                    closeModal();
                }}
            />
        );
    };

    const handleViewItem = (section: MenuSection, item: Product) => {
        openModal(<ProductModal section={section} mode="view" itemData={itemToFormData(item)} onSubmit={() => {}} />);
    };

    const handleDeleteItem = (sectionId: number, itemId: number) => {
        setSections(prev => prev.map(s => (s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)));
    };

    return (
        <main className={clsx('container', style.main)}>
            <div className={style.mainWrapper}>
                <div className={style.header}>
                    <h1>Меню</h1>
                    {isEditing ? (
                        <div className={style.actions}>
                            <Button size="md" variant="primary" onClick={saveChanges}>
                                <Save size={20} /> Сохранить
                            </Button>
                            <Button size="md" variant="secondary" onClick={cancelChanges}>
                                Отменить
                            </Button>
                        </div>
                    ) : (
                        <Button size="md" variant="primary" onClick={startEditing}>
                            <Pencil size={20} /> Редактировать
                        </Button>
                    )}
                </div>
                {sections.length === 0 ? (
                    !isEditing ? (
                        <div className={style.noSections}>Нет разделов в меню</div>
                    ) : (
                        <div className={style.addSection}>
                            <Button size="sm" variant="secondary" className={clsx(style.addSectionBtn, style.lastAddSectionBtn)} onClick={() => handleOpenSectionModal('add', undefined, 0)}>
                                <Plus size={16} /> Добавить раздел
                            </Button>
                        </div>
                    )
                ) : (
                    <>
                        {isEditing && (
                            <div className={style.addSection}>
                                <Button size="sm" variant="secondary" className={style.addSectionBtn} onClick={() => handleOpenSectionModal('add', undefined, 0)}>
                                    <Plus size={16} /> Добавить раздел
                                </Button>
                            </div>
                        )}
                        {sections.map((section, index) => {
                            const isCollapsed = collapsedSectionIds.has(section.id);
                            return (
                                <React.Fragment key={section.id}>
                                    <div className={style.sectionWrapper}>
                                        <div className={style.sectionHeader}>
                                            <h2 onClick={() => toggleSectionCollapse(section.id)} className={style.sectionTitle}>
                                                {section.name}
                                            </h2>
                                            <button className={clsx(style.toggleArrow, { [style.expanded]: !isCollapsed })} onClick={() => toggleSectionCollapse(section.id)}>
                                                <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 7.25012L8.79487 1.25012L17 7.25012" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                            {isEditing && (
                                                <span className={style.sectionEdit} onClick={() => handleOpenSectionModal('edit', section)}>
                                                    <Pencil size={20} /> Редактировать
                                                </span>
                                            )}
                                        </div>
                                        <div className={clsx(style.productsWrapper, { [style.collapsed]: isCollapsed })}>
                                            <div className={style.products}>
                                                {section.items.map(item => (
                                                    <AdminProductCard
                                                        key={item.id}
                                                        item={item}
                                                        isEditing={isEditing}
                                                        onEdit={isEditing ? () => handleEditItem(section, item) : undefined}
                                                        onDelete={isEditing ? () => handleDeleteItem(section.id, item.id) : undefined}
                                                        onView={!isEditing ? () => handleViewItem(section, item) : undefined}
                                                    />
                                                ))}
                                                {isEditing && (
                                                    <div className={style.addProduct} onClick={() => handleAddItem(section)}>
                                                        <Plus size={34} /> Добавить
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing ? (
                                        <div className={style.addSection}>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className={clsx(style.addSectionBtn, index === sections.length - 1 ? style.lastAddSectionBtn : '')}
                                                onClick={() => handleOpenSectionModal('add', undefined, index + 1)}
                                            >
                                                <Plus size={16} /> Добавить раздел
                                            </Button>
                                        </div>
                                    ) : (
                                        index !== sections.length - 1 && <div className={style.addSection}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </>
                )}
            </div>
        </main>
    );
}
