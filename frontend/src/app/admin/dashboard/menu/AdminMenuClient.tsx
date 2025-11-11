'use client';

import { ModalContext } from '@/providers/ModalProvider';
import { useContext, useState } from 'react';
import AddSectionModal from './AddSectionModal';

interface MenuItem {
    id: number;
    sectionId: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order?: number | null;
    data?: unknown;
    createdAt: string;
    updatedAt: string;
}

interface MenuSection {
    id: number;
    name: string;
    slug: string;
    schema?: {
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

    const handleOpenModal = () => {
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

    return (
        <main>
            <h1>Меню</h1>
            <ul>
                {sections.map(section => (
                    <li key={section.id}>
                        <span>{section.order + 1})</span>
                        {section.name}
                    </li>
                ))}
            </ul>
            <button onClick={handleOpenModal}>Добавить раздел</button>
        </main>
    );
}
