// app/orders/page.tsx
import React from 'react';
import OrdersList from './OrdersList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Все заказы',
};

export default async function OrdersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?page=1&perPage=20`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Ошибка получения заказов: ${res.status}`);
  }
  const json = await res.json();

  return (
    <main className="container" style={{ padding: '24px 0' }}>
      <h1>Все заказы</h1>
      <OrdersList initialOrders={json.orders} initialMeta={json.meta} />
    </main>
  );
}
