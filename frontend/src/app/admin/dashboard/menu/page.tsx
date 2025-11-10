'use client';

import { ModalContext } from '@/providers/ModalProvider';
import { useContext } from 'react';
import AddSectionModal from './AddSectionModal';

export default function AdminDashboard() {
    const { openModal, closeModal } = useContext(ModalContext);

    const handleOpenModal = () => {
        openModal(
            <AddSectionModal
                onSubmit={data => {
                    console.log('Новая секция:', data);
                    closeModal();
                }}
            />
        );
    };

    return (
        <main>
            <h1>Меню</h1>
            <button onClick={handleOpenModal}>Добавить раздел</button>
        </main>
    );
}
