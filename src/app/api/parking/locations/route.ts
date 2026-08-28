import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OOTY_SPOTS } from '@/data/ootyMapData';

export async function GET() {
    try {
        let locations: any[] = [];

        if (process.env.DATABASE_URL) {
            locations = await prisma.location.findMany({
                where: {
                    parkingFacilities: {
                        some: {}
                    }
                },
                include: {
                    parkingFacilities: true
                },
                orderBy: {
                    name: 'asc'
                }
            });
        }

        // If no locations with facilities are in the DB yet, use ground-truth OOTY_SPOTS
        if (!locations || locations.length === 0) {
            locations = OOTY_SPOTS.map((spot) => ({
                id: spot.id,
                name: spot.name,
                description: spot.description,
                latitude: spot.latitude,
                longitude: spot.longitude,
                type: spot.type,
                parkingFacilities: [
                    {
                        id: `${spot.id}-car`,
                        locationId: spot.id,
                        vehicleType: 'CAR',
                        totalSlots: spot.parking === 'VERY_LIMITED' ? 30 : spot.parking === 'MODERATE' ? 120 : 250,
                        hourlyRate: 40,
                    },
                    {
                        id: `${spot.id}-bike`,
                        locationId: spot.id,
                        vehicleType: 'BIKE',
                        totalSlots: 300,
                        hourlyRate: 15,
                    },
                    {
                        id: `${spot.id}-bus`,
                        locationId: spot.id,
                        vehicleType: 'BUS',
                        totalSlots: spot.parking === 'VERY_LIMITED' ? 0 : 25,
                        hourlyRate: 100,
                    },
                ],
            }));
        }

        return NextResponse.json({
            success: true,
            count: locations.length,
            locations
        });
    } catch (error) {
        console.error("Failed to fetch parking locations:", error);
        
        // Fallback gracefully on any DB query error
        const fallbackLocations = OOTY_SPOTS.map((spot) => ({
            id: spot.id,
            name: spot.name,
            description: spot.description,
            latitude: spot.latitude,
            longitude: spot.longitude,
            type: spot.type,
            parkingFacilities: [
                {
                    id: `${spot.id}-car`,
                    locationId: spot.id,
                    vehicleType: 'CAR',
                    totalSlots: 120,
                    hourlyRate: 40,
                },
                {
                    id: `${spot.id}-bike`,
                    locationId: spot.id,
                    vehicleType: 'BIKE',
                    totalSlots: 300,
                    hourlyRate: 15,
                },
                {
                    id: `${spot.id}-bus`,
                    locationId: spot.id,
                    vehicleType: 'BUS',
                    totalSlots: 25,
                    hourlyRate: 100,
                },
            ],
        }));

        return NextResponse.json({
            success: true,
            count: fallbackLocations.length,
            locations: fallbackLocations
        });
    }
}
