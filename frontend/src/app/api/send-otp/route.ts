// app/api/send-otp/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Неверный email' }, { status: 400 });
    }
    
    // Генерируем код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Отправляем письмо — сохраняем в БД только после успешной отправки
    try {
      await transporter.sendMail({
        from: `"Pizzaro" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Код входа',
        text: `Ваш код: ${code}\nДействителен 5 минут.`,
        html: `<h2>Ваш код: <b>${code}</b></h2><p>Действителен 5 минут</p>`,
      });
    } catch (sendErr) {
      console.error('Ошибка отправки email (sendMail):', sendErr);
      // Не сохраняем код в БД, возвращаем ошибку отправки
      return NextResponse.json({ error: 'Ошибка отправки email' }, { status: 500 });
    }

    // Успешно отправлено — сохраняем/обновляем код в базе
    try {
      await prisma.otpCode.upsert({
        where: { email },
        update: { code, expiresAt },
        create: { email, code, expiresAt },
      });
    } catch (dbError) {
      console.error('Ошибка Prisma при сохранении OTP:', dbError);
      // Тут можно рассмотреть откат (удалить запись), но тк отправка уже прошла — вернём 500
      return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Код отправлен' });
  } catch (err) {
    console.error('Unexpected error in /api/send-otp:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
