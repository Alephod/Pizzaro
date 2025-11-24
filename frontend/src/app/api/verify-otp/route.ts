// app/api/verify-otp/route.ts
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  const record = await prisma.otpCode.findUnique({
    where: { email },
  });

  if (!record) {
    return NextResponse.json({ error: 'Код не найден' }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Код просрочен' }, { status: 400 });
  }

  if (record.code !== code) {
    return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
  }

  // Код верный — удаляем его и "пускаем" пользователя
  await prisma.otpCode.delete({ where: { email } });

  // Тут ты можешь создать сессию, куку или JWT
  // Для курсовой можно просто вернуть успех
  return NextResponse.json({ message: 'Успешный вход!', email });
}