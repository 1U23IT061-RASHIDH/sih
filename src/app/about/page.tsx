'use client';

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { Info, Target, Shield, Users, Leaf, Navigation, Mail, Phone } from "lucide-react";

export default function AboutPage() {
    const [contact, setContact] = useState({ name: '', email: '', message: '' });
    const [contactStatus, setContactStatus] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const sendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        setSending(true);
        setContactStatus(null);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to send message.');
            setContact({ name: '', email: '', message: '' });
            setContactStatus('Message sent. Our administrator will get back to you.');
        } catch (error) {
            setContactStatus(error instanceof Error ? error.message : 'Unable to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#051c14] text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                        >
                            <Info size={16} />
                            About the Project
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tight"
                        >
                            Sustainable Tourism <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                                for the Nilgiris
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 text-lg max-w-2xl mx-auto"
                        >
                            Nilgiri Smart Pass is an AI-powered initiative to manage tourism flow,
                            preserve the fragile ecosystem of the Blue Mountains, and provide
                            a seamless experience for every traveler.
                        </motion.p>
                    </div>

                    {/* Mission Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        <MissionCard
                            icon={<Target className="text-emerald-400" />}
                            title="Our Vision"
                            description="To transform Nilgiris into a world-class example of sustainable and tech-driven tourism management."
                            delay={0.3}
                        />
                        <MissionCard
                            icon={<Shield className="text-blue-400" />}
                            title="Safe & Secure"
                            description="AI-driven crowd monitoring and real-time traffic updates ensure your journey is safe and predictable."
                            delay={0.4}
                        />
                        <MissionCard
                            icon={<Leaf className="text-green-400" />}
                            title="Eco-Preservation"
                            description="By controlling vehicle inflow, we reduce the carbon footprint and protect the unique flora and fauna."
                            delay={0.5}
                        />
                        <MissionCard
                            icon={<Navigation className="text-purple-400" />}
                            title="Smart Navigation"
                            description="Hyper-local data and parking-first routing to help you spend more time exploring and less time in traffic."
                            delay={0.6}
                        />
                    </div>

                    {/* Narrative Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6"
                    >
                        <h2 className="text-2xl font-bold">The Problem We're Solving</h2>
                        <div className="space-y-4 text-white/70 leading-relaxed text-lg">
                            <p>
                                Every year, millions of tourists visit Ooty and the surrounding Nilgiris.
                                While tourism is vital for the local economy, the sudden surge in traffic
                                often leads to massive congestion, lack of parking, and environmental strain.
                            </p>
                            <p>
                                Nilgiri Smart Pass solves this by integrating an <strong>E-Pass system</strong> with
                                <strong> Real-time Crowd Analytics</strong>. We don't just issue passes; we guide
                                you to spots that are less crowded, recommend optimal travel times, and even
                                help you book parking before you arrive.
                            </p>
                        </div>
                    </motion.div>

                    {/* Values */}
                    <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 font-bold tracking-widest text-xs uppercase">
                            <Users size={18} />
                            Community First
                        </div>
                        <div className="flex items-center gap-2 font-bold tracking-widest text-xs uppercase">
                            <Leaf size={18} />
                            100% Sustainable
                        </div>
                        <div className="flex items-center gap-2 font-bold tracking-widest text-xs uppercase">
                            <Shield size={18} />
                            Data Privacy
                        </div>
                    </div>

                    <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
                        <h2 className="text-2xl font-bold">Contact Us</h2>
                        <p className="mt-2 text-white/60">Need help with your pass, booking, or visit?</p>
                        <div className="mt-6 flex flex-col justify-center gap-4 text-emerald-300 sm:flex-row sm:gap-8">
                            <a href="mailto:support@nilgiripass.com" className="flex items-center justify-center gap-2 font-bold hover:text-white"><Mail size={18} /> support@nilgiripass.com</a>
                            <a href="tel:+914232445678" className="flex items-center justify-center gap-2 font-bold hover:text-white"><Phone size={18} /> +91 423 244 5678</a>
                        </div>
                        <form onSubmit={sendMessage} className="mx-auto mt-8 max-w-2xl space-y-4 text-left">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input required value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} placeholder="Your name" className="rounded-xl border border-white/20 bg-black/20 p-3 text-white outline-none placeholder:text-white/40 focus:border-emerald-300" />
                                <input required type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} placeholder="Your email" className="rounded-xl border border-white/20 bg-black/20 p-3 text-white outline-none placeholder:text-white/40 focus:border-emerald-300" />
                            </div>
                            <textarea required rows={4} value={contact.message} onChange={event => setContact({ ...contact, message: event.target.value })} placeholder="How can we help?" className="w-full resize-none rounded-xl border border-white/20 bg-black/20 p-3 text-white outline-none placeholder:text-white/40 focus:border-emerald-300" />
                            <button disabled={sending} className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50">{sending ? 'Sending...' : 'Send Message'}</button>
                            {contactStatus && <p className="text-sm font-bold text-white/80">{contactStatus}</p>}
                        </form>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/20 text-center text-white/40 text-sm">
                <p>© 2024 Nilgiri E-Pass & Smart Tourism Management System.</p>
            </footer>
        </div>
    );
}

function MissionCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/50 leading-relaxed">{description}</p>
        </motion.div>
    );
}
