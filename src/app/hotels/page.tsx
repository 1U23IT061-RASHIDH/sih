'use client';

import Navbar from '@/components/Navbar';
import { CalendarDays, CheckCircle2, MapPin, Star, Users } from 'lucide-react';
import { useState } from 'react';

const hotels = [
    { id: 'mountain-view', name: 'Mountain View Resort', location: 'Lovedale, Ooty', room: 'Deluxe Valley Room', price: 5200, rating: 4.8, rooms: 6, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=85&w=1200' },
    { id: 'nilgiri-hills', name: 'Nilgiri Hills Hotel', location: 'Charing Cross, Ooty', room: 'Heritage King Room', price: 3900, rating: 4.6, rooms: 9, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=85&w=1200' },
    { id: 'lake-view', name: 'Ooty Lake View Rooms', location: 'Boat House Road', room: 'Lake View Suite', price: 6100, rating: 4.9, rooms: 3, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=85&w=1200' },
    { id: 'tea-garden', name: 'Tea Garden Stay', location: 'Coonoor Road', room: 'Estate Cottage', price: 4700, rating: 4.7, rooms: 5, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=85&w=1200' },
    { id: 'forest-cottage', name: 'Forest View Cottage', location: 'Avalanche Road', room: 'Forest Cabin', price: 5600, rating: 4.8, rooms: 2, image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=85&w=1200' },
];

export default function HotelsPage() {
    const [selected, setSelected] = useState<typeof hotels[number] | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: '2', roomType: '', rooms: '1' });

    const openBooking = (hotel: typeof hotels[number]) => {
        setSelected(hotel);
        setConfirmed(false);
        setForm((current) => ({ ...current, roomType: hotel.room }));
    };

    return <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar />
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
            <header className="mb-10 max-w-2xl"><p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Stay in the hills</p><h1 className="text-4xl font-black tracking-tight md:text-6xl">Hotels &amp; Rooms</h1><p className="mt-4 text-lg font-medium leading-relaxed text-slate-500">Choose a quiet base for your Nilgiri escape, from lake views to tea estate cottages.</p></header>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => <article key={hotel.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <img src={hotel.image} alt={hotel.name} className="h-56 w-full object-cover" />
                    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">{hotel.name}</h2><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{hotel.location}</p></div><span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700"><Star size={14} fill="currentColor" />{hotel.rating}</span></div>
                        <p className="mt-5 text-sm font-semibold text-emerald-700">{hotel.room}</p><div className="mt-3 flex items-end justify-between"><div><span className="text-2xl font-black">₹{hotel.price.toLocaleString('en-IN')}</span><span className="text-sm text-slate-500"> / night</span><p className="mt-1 text-xs font-bold text-slate-400">{hotel.rooms} rooms available</p></div><button onClick={() => openBooking(hotel)} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800">Book Now</button></div>
                    </div></article>)}
            </div>
        </main>
        {selected && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">{confirmed ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={56} /><h2 className="text-2xl font-black">Booking confirmed</h2><p className="mt-2 text-slate-500">Your stay at {selected.name} is reserved.</p><button onClick={() => setSelected(null)} className="mt-7 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white">Done</button></div> : <><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Reserve your stay</p><h2 className="mt-1 text-2xl font-black">{selected.name}</h2></div><button onClick={() => setSelected(null)} className="text-2xl text-slate-400" aria-label="Close">&times;</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Check-in<input required type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-200 p-3 text-slate-900" /></label><label className="text-sm font-bold">Check-out<input required type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-200 p-3 text-slate-900" /></label><label className="text-sm font-bold">Guests<select value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-200 p-3"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label className="text-sm font-bold">Rooms<select value={form.rooms} onChange={e => setForm({ ...form, rooms: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-200 p-3"><option>1</option><option>2</option></select></label><label className="text-sm font-bold sm:col-span-2">Room type<select value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-200 p-3"><option>{selected.room}</option><option>Premium Suite</option><option>Family Room</option></select></label></div><button onClick={() => setConfirmed(true)} disabled={!form.checkIn || !form.checkOut} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><CalendarDays size={18} />Confirm Booking</button></>}</div></div>}
    </div>;
}
