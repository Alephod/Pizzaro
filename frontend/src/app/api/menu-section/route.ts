import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const sections = await prisma.menuSection.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(sections);
}

export async function POST(req: Request) {
    const body = await req.json();
    const section = await prisma.menuSection.create({
        data: {
            name: body.name,
            slug: body.slug,
            schema: body.schema,
            order: body.order ?? 999,
        },
    });
    return NextResponse.json(section);
}
