import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

async function safeReadDir(dir: string) {
    try {
        return await fs.readdir(dir);
    } catch {
        return [];
    }
}

export async function POST(_req: Request) {
    try {
        const tempDir = path.join(process.cwd(), 'public', 'temp-uploads');
        const files = await safeReadDir(tempDir);
        const deleted: string[] = [];

        for (const f of files) {
            if (!f || f.startsWith('.')) continue;
            const fp = path.join(tempDir, f);
            try {
                const stat = await fs.lstat(fp);
                if (stat.isFile()) {
                    await fs.unlink(fp);
                    deleted.push(f);
                }
            } catch {}
        }

        return NextResponse.json({ deleted, count: deleted.length });
    } catch {
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}
