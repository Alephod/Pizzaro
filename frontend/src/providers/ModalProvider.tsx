'use client';

import type { ReactNode } from 'react';
import { createContext, useState } from 'react';
import Modal from '@/components/modal/Modal';

interface ModalContextType {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
    isOpen: boolean;
}

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalContext = createContext<ModalContextType>({
    openModal: () => {
        throw new Error('openModal must be used within ModalProvider');
    },
    closeModal: () => {
        throw new Error('closeModal must be used within ModalProvider');
    },
    isOpen: false,
});

export default function ModalProvider({ children }: ModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode>(null);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    };

    const closeModal = () => {
        // задержка должна совпадать с длительностью CSS closing animation (здесь 300ms)
        setTimeout(() => {
            setIsOpen(false);
            setModalContent(null);
        }, 170);
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
            {children}
            <Modal isOpen={isOpen} onClose={closeModal}>
                {modalContent}
            </Modal>
        </ModalContext.Provider>
    );
}
