'use client';

import { ModalContext } from '@/providers/ModalProvider';
import { useContext } from 'react';

export default function AdminDashboard() {
    const { openModal } = useContext(ModalContext);

    const handleOpenModal = () => {
        openModal(
            <div>
                <h2>Добавить раздел</h2>
                <form>
                    <input placeholder="Название раздела" />
                    <button type="submit">Сохранить</button>
                </form>
            </div>
        );
    };

    return (
        <main>
            <div>Меню</div>
            <button onClick={handleOpenModal}>Добавить раздел</button>
        </main>
    );
}
