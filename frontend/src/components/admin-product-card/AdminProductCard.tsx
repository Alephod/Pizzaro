import type { Product } from '@/types/menu';
import style from './AdminProductCard.module.scss';
import { Edit, Trash2 } from 'lucide-react';
import React from 'react';
import Image from 'next/image';

interface AdminProductCardProps {
    item: Product;
    isEditing: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
}

function resolveImageSrc(src?: string | null) {
    if (!src) return 'https://via.placeholder.com/200';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
    if (typeof window !== 'undefined') {
        return `${window.location.origin.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`;
    }
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    return `${base.replace(/\/$/, '')}/${src.replace(/^\/+/, '')}`;
}

export default function AdminProductCard({ item, isEditing, onEdit, onDelete, onView }: AdminProductCardProps) {
    const costs = (item.data ?? []).map(v => parseFloat(String(v.cost))).filter(c => !isNaN(c));
    const minCost = costs.length > 0 ? Math.min(...costs) : null;
    const imageSrc = resolveImageSrc(item.imageUrl ?? '');

    return (
        <div className={style.card}>
            <Image width={130} height={130} src={imageSrc} alt={item.name} className={style.image} />
            <div className={style.content}>
                <h3 className={style.name} onClick={!isEditing ? onView : undefined} style={{ cursor: !isEditing ? 'pointer' : 'default' }}>
                    {item.name}
                </h3>
                {item.description ? <p className={style.description}>{item.description}</p> : null}
                {minCost !== null && <p className={style.price}>от {minCost}р</p>}
            </div>
            {isEditing && (
                <div className={style.buttons}>
                    <button onClick={onEdit} aria-label="Edit" type="button">
                        <Edit size={20} />
                    </button>
                    <button onClick={onDelete} className={style.deleteBtn} aria-label="Delete" type="button">
                        <Trash2 size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
