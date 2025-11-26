import React from 'react';
import { getServerSession } from 'next-auth/next';
import { clientAuthOptions } from '@/lib/auth/client'; 
import CheckoutClient from './CheckoutClient';
import type { ProfileDataFromDB } from '@/types/profile';
import { redirect } from 'next/navigation';

async function getProfile(userId: string): Promise<ProfileDataFromDB> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }
  return res.json();
}

export default async function CheckoutPage() {
  const session = await getServerSession(clientAuthOptions);

  if (!session?.user?.id) {
    redirect('/');
  }

  const profile = await getProfile(session?.user.id as string);

  return <CheckoutClient initialProfile={profile} />;
}