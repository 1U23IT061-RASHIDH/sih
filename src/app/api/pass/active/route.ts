import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ passes: [] });

    try {
        const passes = await prisma.pass.findMany({
            where: {
                userId: user.id,
                status: { in: ['ACTIVE', 'USED', 'SUBMITTED', 'PENDING'] }
            },
            include: {
                parkingBookings: {
                    where: { status: { not: 'CANCELLED' } },
                    include: {
                        facility: {
                            include: { location: true }
                        }
                    }
                }
            },
            orderBy: {
                visitDate: 'desc'
            }
        });

        return NextResponse.json({ passes });
    } catch (error) {
        return NextResponse.json({ passes: [] });
    }
}
