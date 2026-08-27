import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim();
        const message = String(body.message || '').trim();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }
        if (message.length > 2000) {
            return NextResponse.json({ error: 'Message must be 2000 characters or fewer.' }, { status: 400 });
        }
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ error: 'Contact notifications require the configured database.' }, { status: 503 });
        }

        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
        if (admins.length === 0) {
            return NextResponse.json({ error: 'No administrator is configured yet.' }, { status: 503 });
        }

        const notificationMessage = `Contact from ${name} (${email}): ${message}`;
        await prisma.notification.createMany({
            data: admins.map((admin) => ({ userId: admin.id, message: notificationMessage }))
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 500 });
    }
}
