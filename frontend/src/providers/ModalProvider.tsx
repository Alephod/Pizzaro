'use client';

import { createContext, useState, type ReactNode } from 'react';
import Modal from '@/components/modal/Modal'; // Укажите правильный путь импорта к компоненту Modal

interface ModalContextType {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType>({
    openModal: () => {},
    closeModal: () => {},
});

interface ModalProviderProps {
    children: ReactNode;
}

export default function ModalProvider({ children }: ModalProviderProps) {
    const [modalStack, setModalStack] = useState<ReactNode[]>([]);

    const openModal = (newContent: ReactNode) => {
        setModalStack(previousStack => [...previousStack, newContent]);
    };

    const closeModal = () => {
        setModalStack(previousStack => previousStack.slice(0, -1));
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {modalStack.map((content, index) => (
                <Modal
                    key={index}
                    isOpen={true}
                    onClose={closeModal}
                    zIndex={1000 + index * 10} // Увеличиваем z-index для каждой вложенной модалки
                >
                    {content}
                </Modal>
            ))}
        </ModalContext.Provider>
    );
}
