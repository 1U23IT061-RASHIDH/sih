import { NextResponse } from 'next/server';
import { checkAdmin, unauthorized } from '@/lib/auth-check';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const admin = await checkAdmin();
    if (!admin) return unauthorized();

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: admin.id },
            orderBy: { createdAt: 'desc' },
            take: 25
        });
        return NextResponse.json({ notifications });
    } catch {
        return NextResponse.json({ notifications: [] });
    }
}
