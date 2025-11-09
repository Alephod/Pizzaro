import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const items = await prisma.menuItem.findMany({
        orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const body = await req.json();
    const item = await prisma.menuItem.create({
        data: {
            sectionId: body.sectionId,
            name: body.name,
            description: body.description ?? null,
            imageUrl: body.imageUrl ?? null,
            data: body.data ?? {},
            order: body.order ?? 999,
        },
    });
    return NextResponse.json(item);
}
