'use client';

import { ModalContext } from '@/providers/ModalProvider';
import { useContext, useState } from 'react';
import SectionModal from './SectionModal';
import type { ItemData } from './ProductModal';
import ProductModal from './ProductModal';
import AdminProductCard from '@/components/admin-product-card/AdminProductCard';

import style from './AdminMenu.module.scss';
import { Button } from '@/components/ui/button/Button';

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

    const handleOpenSectionModal = (mode: 'add' | 'edit', section?: MenuSection) => {
        openModal(
            <SectionModal
                mode={mode}
                initialData={section ? { name: section.name, slug: section.slug, schema: section.schema ?? { options: [] } } : undefined}
                onSubmit={(data: SectionFormData) => {
                    const now = new Date().toISOString();
                    if (mode === 'add') {
                        const newSection: MenuSection = {
                            ...data,
                            order: sections.length,
                            id: Math.floor(Math.random() * 1000000),
                            items: [],
                            createdAt: now,
                            updatedAt: now,
                        };
                        setSections(prev => [...prev, newSection]);
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
        <main className="container">
            <div className={style.header}>
                <h1>Меню</h1>
                <Button size="md" variant="primary" onClick={() => setIsEditing(prev => !prev)}>
                    {isEditing ? 'Завершить' : 'Редактировать'}
                </Button>
            </div>
            {sections.map(section => (
                <div key={section.id}>
                    <strong>{section.name}</strong> ({section.slug}){section.order && <small> — порядок: {section.order}</small>}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <Button size="sm" variant="secondary" onClick={() => handleOpenSectionModal('edit', section)}>
                            Редактировать раздел
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => handleAddItem(section)}>
                            Добавить продукт
                        </Button>
                    </div>
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
                    </div>
                </div>
            ))}
            <Button size="md" variant="primary" onClick={() => handleOpenSectionModal('add')}>
                Добавить раздел
            </Button>
        </main>
    );
}
