'use client';

import { ModalContext } from '@/providers/ModalProvider';
import { useContext, useState } from 'react';
import AddSectionModal from './AddSectionModal';
import AddItemModal from './AddItemModal';

export interface ItemVariant {
    name: string;
    weight: string;
    kkal: string;
    cost: string;
}

export interface MenuItem {
    id: number;
    sectionId: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    order: number | null;
    data: ItemVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface MenuSection {
    id: number;
    name: string;
    slug: string;
    schema: {
        fields: { name: string; type: 'text' | 'textarea' | 'file' | 'number' }[];
        options: string[];
    } | null;
    order: number;
    items: MenuItem[];
    createdAt: string;
    updatedAt: string;
}

interface Props {
    sectionsData: MenuSection[];
}

export default function AdminMenuClient({ sectionsData }: Props) {
    const { openModal, closeModal } = useContext(ModalContext);
    const [sections, setSections] = useState<MenuSection[]>(sectionsData);

    const handleOpenSectionModal = () => {
        openModal(
            <AddSectionModal
                onSubmit={data => {
                    const now = new Date().toISOString();
                    const newSection = {
                        ...data,
                        order: sections.length,
                        id: Math.floor(Math.random() * 1000000), // временный ID для клиента
                        schema: data.schema,
                        items: [],
                        createdAt: now,
                        updatedAt: now,
                    };
                    setSections(prev => [...prev, newSection]);
                    console.log(newSection);
                    closeModal();
                }}
            />
        );
    };

    const handleOpenItemModal = (section: MenuSection) => {
        openModal(
            <AddItemModal
                section={section}
                onSubmit={itemData => {
                    const now = new Date().toISOString();
                    const newItem: MenuItem = {
                        id: Date.now(),
                        sectionId: section.id,
                        name: itemData.name,
                        description: itemData.description ?? null,
                        imageUrl: itemData.imageUrl ?? null,
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

    return (
        <main>
            <h1>Меню</h1>
            <ul>
                {sections.map(section => (
                    <li key={section.id}>
                        <strong>{section.name}</strong> ({section.slug}){section.order && <small> — порядок: {section.order}</small>}
                        <button onClick={() => handleOpenItemModal(section)}>Добавить продукт</button>
                        <ul>
                            {section.items.map(item => (
                                <li key={item.id}>{item.name}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            <button onClick={handleOpenSectionModal}>Добавить раздел</button>
        </main>
    );
}
