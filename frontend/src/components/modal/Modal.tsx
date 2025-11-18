'use client';

import type { ReactNode, MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    const pointerDownOnBackdropRef = useRef(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const animationDuration = 300; // Время анимации закрытия в миллисекундах

    // Запустить анимацию закрытия и уведомить провайдера после завершения анимации
    const startClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);

        contentRef.current?.classList.add(style.closing);
        backdropRef.current?.classList.add(style.backdropClosing);

        setTimeout(() => {
            onClose();
        }, animationDuration);
    }, [isClosing, onClose, animationDuration]);

    // Закрытие по Escape и popstate
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') startClose();
        };

        const handlePopState = () => {
            startClose();
        };

        window.history.pushState({ modal: true }, '');

        document.addEventListener('keydown', handleEsc);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('keydown', handleEsc);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, startClose]);

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
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) setIsClosing(false);
    }, [isOpen]);

    if (!isOpen) return null;

    // Начало нажатия на бэкдроп
    const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        pointerDownOnBackdropRef.current = e.target === e.currentTarget;
    };

    // Закрываем только если pointerdown тоже был на бэкдропе
    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target && pointerDownOnBackdropRef.current) {
            startClose();
        }
        pointerDownOnBackdropRef.current = false;
    };

    return ReactDOM.createPortal(
        <div
            ref={backdropRef}
            className={`${style.modalBackdrop} ${isClosing ? style.backdropClosing : ''} ${className || ''}`}
            style={{ zIndex }}
            onPointerDown={handleBackdropPointerDown}
            onClick={handleBackdropClick}
        >
            <div ref={contentRef} className={`${style.modalContent} ${isClosing ? style.closing : ''}`} onClick={e => e.stopPropagation()}>
                <button onClick={startClose} aria-label="Close modal" className={style.modalCloseBtn} />
                {children}
            </div>
        </div>,
        document.body
    );
}
