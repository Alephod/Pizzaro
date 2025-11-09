'use client';

import type { ReactNode, MouseEvent, KeyboardEvent } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import style from './Modal.module.scss';

let openModals = 0;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    zIndex?: number;
}

export default function Modal({ isOpen, onClose, children, className, zIndex = 1000 }: ModalProps) {
    // Закрытие по Escape и popstate
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handlePopState = () => {
            onClose();
        };

        window.history.pushState({ modal: true }, '');

        document.addEventListener('keydown', handleEsc as unknown as EventListener);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('keydown', handleEsc as unknown as EventListener);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, onClose]);

    // Блокировка скролла body
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            openModals++;

            if (openModals === 1) {
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.overflow = 'hidden';
                document.body.style.width = '100%';
            }

            return () => {
                if (isOpen) {
                    openModals--;

                    if (openModals === 0) {
                        const y = parseInt(document.body.style.top || '0') * -1;
                        document.body.style.position = '';
                        document.body.style.top = '';
                        document.body.style.left = '';
                        document.body.style.right = '';
                        document.body.style.overflow = '';
                        document.body.style.width = '';

                        window.scrollTo(0, y);
                    }
                }
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div className={`${style.modalBackdrop} ${className || ''}`} style={{ zIndex }} onClick={handleBackdropClick}>
            <div className={style.modalContent} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close modal" className={style.modalCloseBtn} />
                {children}
            </div>
        </div>,
        document.body
    );
}
