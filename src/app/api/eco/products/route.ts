import { NextResponse } from 'next/server';
import { EcoStoreService } from '@/services/eco/EcoStoreService';

export async function GET() {
    if (!process.env.DATABASE_URL) return NextResponse.json([]);

    try {
        const products = await EcoStoreService.getProducts();
        return NextResponse.json(products || []);
    } catch (error: any) {
        return NextResponse.json([]);
    }
}
