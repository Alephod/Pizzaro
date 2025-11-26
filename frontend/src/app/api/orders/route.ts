import { prisma } from '@/lib/prisma';
import { clientAuthOptions } from '@/lib/auth/client';
import { generateOrderId } from '@/utils';
import { getServerSession } from 'next-auth';
import type { UserProfileData } from '@/types/profile';

export async function POST(request: Request) {
  const body = await request.json();
  const session = await getServerSession(clientAuthOptions);

  const id = generateOrderId();

  const order = await prisma.order.create({
    data: {
      id,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      deliveryTime: body.deliveryTime,
      paymentMethod: body.paymentMethod,
      items: body.items,
      total: body.total,
      status: 'Принято',
      createdAt: new Date(),
    },
  });

  if (session?.user?.id) {
    const userId = Number(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { data: true },
    });

    if (user) {
      const currentData = user.data as UserProfileData;

      await prisma.user.update({
        where: { id: userId },
        data: {
          data: {
            ...currentData,
            orders: [...(currentData.orders ?? []), id],
          },
        },
      });
    }
  }

  return Response.json({ id }, { status: 201 });
}