import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OOTY_SPOTS } from '@/data/ootyMapData';

export async function GET() {
    if (!process.env.DATABASE_URL) {
        const locations = OOTY_SPOTS.map((spot) => ({
            id: spot.id,
            name: spot.name,
            description: spot.description,
            latitude: spot.latitude,
            longitude: spot.longitude,
            type: spot.type,
            parkingFacilities: ['CAR', 'BIKE', 'BUS'].map((vehicleType) => ({
                id: `${spot.id}-${vehicleType.toLowerCase()}`,
                locationId: spot.id,
                vehicleType,
                totalSlots: vehicleType === 'CAR' ? 40 : 20,
                hourlyRate: vehicleType === 'CAR' ? 30 : 20,
            })),
        }));
        return NextResponse.json({ locations });
    }

    try {
        const locations = await prisma.location.findMany({
            where: { type: "ATTRACTION" }, // Assuming parking is linked to attractions
            include: {
                parkingFacilities: true
            }
        });
        return NextResponse.json({ locations });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
