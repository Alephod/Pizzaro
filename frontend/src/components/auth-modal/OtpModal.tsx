// app/components/OtpModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import styles from './OtpModal.module.scss';

interface OtpModalProps {
  email: string;
  onClose: () => void;
  onBackToEmail: () => void;
}

export function OtpModal({ email, onClose, onBackToEmail }: OtpModalProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | undefined>(undefined);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Автофокус на первую пустую ячейку при любом изменении
  useEffect(() => {
    const firstEmptyIndex = otpDigits.findIndex(d => d === '');
    if (firstEmptyIndex !== -1 && !isSubmitting) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, [otpDigits, isSubmitting]);

  // Авто-сабмит когда все 6 цифр заполнены
  useEffect(() => {
    if (otpDigits.every(d => d !== '') && !isSubmitting && !otpError) {
      formRef.current?.requestSubmit();
    }
  }, [otpDigits, isSubmitting, otpError]);

  // Таймер для countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleDigitChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Разрешаем только одну цифру или пустую строку
    if (value === '' || /^\d$/.test(value)) {
      const newDigits = [...otpDigits];
      newDigits[index] = value;
      setOtpDigits(newDigits);
      setOtpError(undefined);
    }
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasteData = event.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtpDigits(pasteData.split(''));
      event.preventDefault();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otpCode = otpDigits.join('');

    setIsSubmitting(true);
    setSubmitMessage(undefined);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      if (!response.ok) {
        throw new Error('Ошибка верификации');
      }

      const data = await response.json();
      setSubmitMessage(data.message || 'Успешный вход!');

      localStorage.setItem('user', email);

      setTimeout(onClose, 2000);
    } catch (error) {
      setOtpError('Неверный код или ошибка. Попробуйте позже.');
      setOtpDigits(['', '', '', '', '', '']); 
      // Сбрасываем фокус на первую пустую (или первую) ячейку
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setSubmitMessage(undefined);
    setOtpError(undefined);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Ошибка повторной отправки');
      }

      setSubmitMessage('Код отправлен повторно');
      // Очищаем поле для нового кода
      setOtpDigits(['', '', '', '', '', '']);
      // Запускаем countdown
      setResendCountdown(60);
    } catch (error) {
      setOtpError('Ошибка отправки. Попробуйте позже.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    onBackToEmail();
  };

  return (
    <div className={styles.modalContent}>
      <h2 className={styles.title}>Введите код с почты</h2>
      <p className={styles.description}>
        {email} <span className={styles.changeLink} onClick={handleChangeEmail}>Изменить</span>
      </p>
      
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.otpInputs} onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <Input
              key={index}
              type="text"
              value={digit}
              onChange={handleDigitChange(index)}
              onKeyDown={handleKeyDown(index)}
              maxLength={1}
              ref={(el) => { inputRefs.current[index] = el; }}
              error={!!otpError}
              className={styles.otpInput}
              disabled={isSubmitting}
            />
          ))}
        </div>
        
        {otpError && <p className={styles.errorMessage}>{otpError}</p>}
        {submitMessage && <p className={styles.successMessage}>{submitMessage}</p>}
        
        <div className={styles.actions}>
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={handleResend}
            disabled={isResending || isSubmitting || resendCountdown > 0}
            className={styles.resendButton}
            loading={true}
          >
            {resendCountdown > 0 ? `Отправить еще раз (${resendCountdown})` : 'Отправить еще раз'}
          </Button>
        </div>
      </form>
    </div>
  );
}