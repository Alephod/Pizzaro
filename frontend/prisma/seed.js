import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('supersecret', 10);

    await prisma.adminUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: hash,
        },
    });

    console.log('Admin user created / updated'); // eslint-disable-line no-console
}

main()
    .catch(e => {
        console.error('Seed error:', e); // eslint-disable-line no-console
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
