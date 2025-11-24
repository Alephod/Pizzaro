import React, { useState } from 'react';
import { EmailModal } from './EmailModal';
import { OtpModal } from './OtpModal';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  return userEmail ? (
    <OtpModal 
      email={userEmail} 
      onClose={onClose} 
      onBackToEmail={() => setUserEmail(null)} 
    />
  ) : (
    <EmailModal
      onClose={onClose}
      onEmailSent={(email) => setUserEmail(email)}
    />
  );
}