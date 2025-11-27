// components/orders/OrderCardAdmin.tsx
'use client';
import React, { useState } from 'react';
import clsx from 'clsx';
import styles from '@/components/order-card/OrderCard.module.scss';
import { normalizePrice } from '@/utils';
import type { OrderData } from '@/types/order';

const STATUS_ORDER: OrderData['status'][] = ['Принято', 'Готовится', 'Доставляется', 'Доставлено'];

function statusClass(status: OrderData['status']) {
  switch (status) {
    case 'Принято':
      return styles.statusAccepted;
    case 'Готовится':
      return styles.statusPreparing;
    case 'Доставляется':
      return styles.statusDelivering;
    case 'Доставлено':
      return styles.statusDelivered;
    default:
      return '';
  }
}

function itemsPreview(items: OrderData['items']) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .map((it) => `${it.name}${it.variant ? ` · ${it.variant}` : ''} - x${it.count}`)
    .join(', ');
}

async function patchStatus(orderId: string, status: OrderData['status']) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Ошибка обновления: ${res.status} ${text}`);
  }
  return res.json();
}

export default function OrderCardAdmin({
  order,
  onUpdate,
}: {
  order: OrderData;
  onUpdate?: (id: string, patch: Partial<OrderData>) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selected, setSelected] = useState<OrderData['status']>(order.status);

  const preview = itemsPreview(order.items);
  const created = new Date(order.createdAt).toLocaleString('ru-RU');

  const handleQuickToggle = async () => {
    // find next status in STATUS_ORDER
    const idx = STATUS_ORDER.indexOf(order.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    // optimistic update
    onUpdate?.(order.id, { status: next, updatedAt: new Date().toISOString() });
    setIsSaving(true);
    try {
      await patchStatus(order.id, next);
      // success — nothing else to do (already updated optimistically)
    } catch (err) {
      console.error(err);
      // revert
      onUpdate?.(order.id, { status: order.status, updatedAt: order.updatedAt });
      alert('Не удалось обновить статус');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (selected === order.status) {
      setShowEditor(false);
      return;
    }
    setIsSaving(true);
    // optimistic
    const prev = order.status;
    onUpdate?.(order.id, { status: selected, updatedAt: new Date().toISOString() });
    try {
      await patchStatus(order.id, selected);
      setShowEditor(false);
    } catch (err) {
      console.error(err);
      onUpdate?.(order.id, { status: prev, updatedAt: order.updatedAt });
      alert('Не удалось сохранить статус');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className={styles.card} style={{ position: 'relative' }}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Заказ № {order.id}</div>
          <div className={styles.address} title={order.address} style={{ marginTop: 4 }}>
            {order.address}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
          <button
            onClick={handleQuickToggle}
            disabled={isSaving}
            title="Быстрая смена статуса"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {isSaving ? '...' : '→'}
          </button>

          <button
            onClick={() => { setShowEditor((s) => !s); setSelected(order.status); }}
            title="Редактировать статус"
            style={{
              padding: 8,
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Редактировать"
          >
            {/* pencil icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.preview} style={{ marginTop: 10 }}>{preview}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className={clsx(styles.status, statusClass(order.status))}>{order.status}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{created}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className={styles.price}>{normalizePrice(order.total)}</div>
        </div>
      </div>

      {showEditor && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={selected} onChange={(e) => setSelected(e.target.value as OrderData['status'])}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={handleSaveManual} disabled={isSaving} className="button">
            Сохранить
          </button>
          <button onClick={() => setShowEditor(false)} disabled={isSaving} className="button" style={{ background: '#f3f3f3' }}>
            Отменить
          </button>
        </div>
      )}
    </article>
  );
}
