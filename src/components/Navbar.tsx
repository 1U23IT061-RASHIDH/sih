'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    ChevronDown,
    MapPin,
    Compass,
    ParkingSquare,
    Leaf,
    Hotel,
    UtensilsCrossed,
    Glasses,
    CloudSun,
    ShieldAlert,
    QrCode,
    Sparkles,
    LayoutDashboard,
    FileCheck,
    Info,
    Globe
} from "lucide-react";
import { VoiceGuide } from "@/services/navigation/VoiceGuide";

export default function Navbar() {
    const pathname = usePathname();
    const { user } = useUser();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [lang, setLang] = useState<'EN' | 'TA'>('EN');
    const [isAdmin, setIsAdmin] = useState(false);

    const exploreRef = useRef<HTMLDivElement>(null);
    const servicesRef = useRef<HTMLDivElement>(null);

    // Initialize Language from localStorage & VoiceGuide
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('nilgiri_lang') as 'EN' | 'TA' | null;
            if (savedLang === 'EN' || savedLang === 'TA') {
                setLang(savedLang);
                VoiceGuide.setSettings({ language: savedLang.toLowerCase() as 'en' | 'ta' });
            }
        }
    }, []);

    // Toggle Language with localStorage persistence and system event dispatch
    const setLanguage = (newLang: 'EN' | 'TA') => {
        setLang(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('nilgiri_lang', newLang);
            VoiceGuide.setSettings({ language: newLang.toLowerCase() as 'en' | 'ta' });
            window.dispatchEvent(new CustomEvent('nilgiri-lang-change', { detail: { lang: newLang } }));
        }

    };

    const toggleLang = () => {
        setLanguage(lang === 'EN' ? 'TA' : 'EN');
    };

    // Scroll state listener
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setExploreOpen(false);
        setServicesOpen(false);
    }, [pathname]);

    // Check Admin Role
    useEffect(() => {
        if (!user) {
            setIsAdmin(false);
            return;
        }

        fetch('/api/user/role')
            .then(res => res.json())
            .then(data => {
                setIsAdmin(data.role === 'ADMIN');
            })
            .catch(() => setIsAdmin(false));
    }, [user]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
                setExploreOpen(false);
            }
            if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
                setServicesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isLightPage = ['/hotels', '/food', '/tourism', '/eco-store', '/parking', '/validator', '/about'].includes(pathname);
    const isDashboard = pathname === '/dashboard';

    // Theme adaptive styles
    const navBackground = scrolled || isDashboard || isLightPage
        ? 'bg-slate-900/90 backdrop-blur-xl border-slate-800/80 shadow-xl shadow-black/20'
        : 'bg-slate-950/40 backdrop-blur-md border-white/10 shadow-lg shadow-black/10';

    const exploreItems = [
        {
            href: '/tourism',
            title: lang === 'EN' ? 'Tourist Attractions' : 'சுற்றுலா தலங்கள்',
            desc: lang === 'EN' ? 'Top spots, gardens & peaks' : 'பிரபலமான இடங்கள் & பூங்காக்கள்',
            icon: Compass,
            badge: 'Popular',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        {
            href: '/hotels',
            title: lang === 'EN' ? 'Hotels & Resorts' : 'ஹோட்டல்கள் & தங்குமிடம்',
            desc: lang === 'EN' ? 'Verified eco-stays in Nilgiris' : 'சரிபார்க்கப்பட்ட சூழல் தங்குமிடங்கள்',
            icon: Hotel
        },
        {
            href: '/food',
            title: lang === 'EN' ? 'Food & Cafes' : 'உணவகங்கள் & கஃபேக்கள்',
            desc: lang === 'EN' ? 'Authentic Badaga & hill cuisines' : 'பாரம்பரிய மலை உணவுகள்',
            icon: UtensilsCrossed
        },
        {
            href: '/virtual-tour',
            title: lang === 'EN' ? '360° Virtual Tour' : '360° மெய்நிகர் பயணம்',
            desc: lang === 'EN' ? 'Immersive panoramic experience' : 'முழுமையான காட்சி அனுபவம்',
            icon: Glasses,
            badge: '360° VR',
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        },
        {
            href: '/weather',
            title: lang === 'EN' ? 'Weather & Forecast' : 'வானிலை & பனி எச்சரிக்கை',
            desc: lang === 'EN' ? 'Live hill temperature & fog alerts' : 'நேரலை வானிலை தகவல்கள்',
            icon: CloudSun
        }
    ];

    const servicesItems = [
        {
            href: '/parking',
            title: lang === 'EN' ? 'Smart Parking' : 'வாகன நிறுத்துமிடம்',
            desc: lang === 'EN' ? 'Pre-book allocated slots' : 'முன்பதிவு செய்யப்பட்ட இடங்கள்',
            icon: ParkingSquare,
            badge: 'Live Slots',
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
        {
            href: '/eco-store',
            title: lang === 'EN' ? 'Eco Store & Rewards' : 'சுற்றுச்சூழல் அங்காடி',
            desc: lang === 'EN' ? 'Redeem points for eco-goods' : 'ஈகோ புள்ளிகள் பரிசுகள்',
            icon: Leaf,
            badge: 'Points',
            badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30'
        },
        {
            href: '/validator',
            title: lang === 'EN' ? 'E-Pass Validator' : 'பாஸ் சரிபார்ப்பு',
            desc: lang === 'EN' ? 'Gate checkpost scanner' : 'செக்போஸ்ட் சோதனை',
            icon: FileCheck
        },
        {
            href: '/scan',
            title: lang === 'EN' ? 'QR Code Scanner' : 'QR ஸ்கேனர்',
            desc: lang === 'EN' ? 'Instant offline/online pass check' : 'விரைவு சரிபார்ப்பு',
            icon: QrCode
        }
    ];

    const isExploreActive = exploreItems.some(item => pathname === item.href);
    const isServicesActive = servicesItems.some(item => pathname === item.href);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 transition-all duration-300">
            <nav className={`max-w-7xl mx-auto rounded-2xl border transition-all duration-300 ${navBackground}`}>
                <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">

                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/40 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <span className="text-xl select-none">🏔️</span>
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 leading-none">
                                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                                    Nilgiri
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                                    {lang === 'EN' ? 'E-Pass' : 'இ-பாஸ்'}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                                {lang === 'EN' ? 'Govt. of Tamil Nadu' : 'தமிழ்நாடு அரசு'}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-1 xl:gap-2">

                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${pathname === '/dashboard'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{lang === 'EN' ? 'Dashboard' : 'டாஷ்போர்டு'}</span>
                        </Link>

                        {/* Apply Pass */}
                        <Link
                            href="/apply"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${pathname === '/apply'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'EN' ? 'Apply Pass' : 'பாஸ் பெறுக'}</span>
                        </Link>

                        {/* Smart Map */}
                        <Link
                            href="/map"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${pathname === '/map'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>{lang === 'EN' ? 'Smart Map' : 'ஸ்மார்ட் மேப்'}</span>
                        </Link>

                        {/* Explore Dropdown */}
                        <div className="relative" ref={exploreRef}>
                            <button
                                onClick={() => {
                                    setExploreOpen(!exploreOpen);
                                    setServicesOpen(false);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isExploreActive || exploreOpen
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Compass className="w-3.5 h-3.5 text-teal-400" />
                                <span>{lang === 'EN' ? 'Explore' : 'சுற்றுலா'}</span>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {exploreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="absolute top-full left-0 mt-2 w-72 p-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 z-50"
                                    >
                                        <div className="space-y-1">
                                            {exploreItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${isActive
                                                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-white'
                                                                : 'hover:bg-white/5 text-slate-200 hover:text-white'
                                                            }`}
                                                    >
                                                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 mt-0.5">
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold leading-snug">{item.title}</span>
                                                                {item.badge && (
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Services Dropdown */}
                        <div className="relative" ref={servicesRef}>
                            <button
                                onClick={() => {
                                    setServicesOpen(!servicesOpen);
                                    setExploreOpen(false);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isServicesActive || servicesOpen
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <ParkingSquare className="w-3.5 h-3.5 text-blue-400" />
                                <span>{lang === 'EN' ? 'Services' : 'சேவைகள்'}</span>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {servicesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="absolute top-full left-0 mt-2 w-72 p-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 z-50"
                                    >
                                        <div className="space-y-1">
                                            {servicesItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${isActive
                                                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-white'
                                                                : 'hover:bg-white/5 text-slate-200 hover:text-white'
                                                            }`}
                                                    >
                                                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 mt-0.5">
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold leading-snug">{item.title}</span>
                                                                {item.badge && (
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* About */}
                        <Link
                            href="/about"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${pathname === '/about'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lang === 'EN' ? 'About' : 'பற்றி'}</span>
                        </Link>

                        {/* Admin Badge if Admin */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all shadow-sm"
                            >
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                <span>ADMIN</span>
                            </Link>
                        )}
                    </div>

                    {/* Right Controls & Auth */}
                    <div className="hidden lg:flex items-center gap-3">

                        {/* Live Traffic Density Pill */}
                        <Link
                            href="/map"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/40 transition-colors shadow-inner"
                            title="Live traffic shaping active"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Live Traffic</span>
                        </Link>

                        {/* Premium Dual Language Selector Capsule */}
                        <div className="flex items-center p-0.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-inner">
                            <button
                                onClick={() => setLanguage('EN')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'EN'
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                title="English"
                            >
                                <span>EN</span>
                            </button>
                            <button
                                onClick={() => setLanguage('TA')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'TA'
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                title="தமிழ் (Tamil)"
                            >
                                <span>தமிழ்</span>
                            </button>
                        </div>

                        {/* Clerk Authentication */}
                        <SignedOut>
                            <div className="flex items-center gap-2">
                                <SignInButton mode="modal">
                                    <button className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/80 rounded-xl transition-all">
                                        {lang === 'EN' ? 'Sign In' : 'உள்நுழைக'}
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-md shadow-emerald-950 transition-all hover:scale-105 active:scale-95">
                                        {lang === 'EN' ? 'Register' : 'பதிவு செய்க'}
                                    </button>
                                </SignUpButton>
                            </div>
                        </SignedOut>

                        <SignedIn>
                            <div className="flex items-center gap-2 pl-1">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: 'w-8 h-8 rounded-xl border border-emerald-500/40 shadow-sm',
                                            userButtonPopoverCard: 'bg-slate-900 border border-slate-800 shadow-2xl text-slate-100'
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button & Language */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                            <button
                                onClick={() => setLanguage('EN')}
                                className={`px-1.5 py-0.5 rounded font-bold ${lang === 'EN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('TA')}
                                className={`px-1.5 py-0.5 rounded font-bold ${lang === 'TA' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                            >
                                தமிழ்
                            </button>
                        </div>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white transition-colors"
                            aria-label="Toggle navigation"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>

                {/* Mobile Drawer Sheet */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-slate-800/80 bg-slate-900/98 backdrop-blur-2xl rounded-b-2xl"
                        >
                            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">

                                {/* Quick Primary Links */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/dashboard"
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${pathname === '/dashboard'
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                                            }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        href="/apply"
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${pathname === '/apply'
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                                            }`}
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>Apply Pass</span>
                                    </Link>
                                    <Link
                                        href="/map"
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${pathname === '/map'
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                                            }`}
                                    >
                                        <MapPin className="w-4 h-4 text-rose-400" />
                                        <span>Smart Map</span>
                                    </Link>
                                    <Link
                                        href="/parking"
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${pathname === '/parking'
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                                            }`}
                                    >
                                        <ParkingSquare className="w-4 h-4 text-blue-400" />
                                        <span>Parking</span>
                                    </Link>
                                </div>

                                {/* Explore Section */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                                        {lang === 'EN' ? 'Explore Nilgiris' : 'சுற்றுலா இடங்கள்'}
                                    </div>
                                    <div className="space-y-1">
                                        {exploreItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-4 h-4 text-emerald-400" />
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Services Section */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                                        {lang === 'EN' ? 'Travel Services' : 'சேவைகள்'}
                                    </div>
                                    <div className="space-y-1">
                                        {servicesItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-4 h-4 text-emerald-400" />
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Admin Portal (if Admin) */}
                                {isAdmin && (
                                    <div className="pt-2 border-t border-slate-800">
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold justify-center"
                                        >
                                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                                            <span>ADMIN CONTROL PANEL</span>
                                        </Link>
                                    </div>
                                )}

                                {/* User / Auth Area */}
                                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <SignedOut>
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <SignInButton mode="modal">
                                                <button className="w-full py-2 text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-xl">
                                                    Sign In
                                                </button>
                                            </SignInButton>
                                            <SignUpButton mode="modal">
                                                <button className="w-full py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl shadow">
                                                    Register
                                                </button>
                                            </SignUpButton>
                                        </div>
                                    </SignedOut>

                                    <SignedIn>
                                        <div className="flex items-center justify-between w-full p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
                                            <div className="flex items-center gap-3">
                                                <UserButton />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">
                                                        {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User Account'}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-400 font-medium">Logged In</span>
                                                </div>
                                            </div>
                                            <Link href="/about" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>About</span>
                                            </Link>
                                        </div>
                                    </SignedIn>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
