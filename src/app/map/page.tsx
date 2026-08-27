'use client';

/**
 * Ooty Navigation Map Page
 * Full navigation experience with GraphHopper routing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    MapPin, Navigation, Layers, ParkingCircle,
    AlertTriangle, RefreshCw, Compass, ChevronUp, ChevronDown,
    Car, Bike, Footprints, Filter, X, LayoutGrid, Image as ImageIcon, TreePine
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/navigation/SearchBar';
import NavigationUI from '@/components/navigation/NavigationUI';
import BigIconMode from '@/components/navigation/BigIconMode';
import ImageSelector from '@/components/navigation/ImageSelector';
import { VoiceGuide } from '@/services/navigation/VoiceGuide';
import { HillSafety } from '@/services/navigation/HillSafety';
import { OOTY_SPOTS } from '@/data/ootyMapData';
import { RedirectAdvisor, SuggestionCard } from '@/services/redirect/RedirectAdvisor';
import { ThumbnailUI } from '@/components/traffic/ThumbnailUI';
import { LiveConsent } from '@/components/eco/LiveConsent';
import { GoogleMapContainer } from '@/components/maps/GoogleMapContainer';
import CrowdAnalysisPanel from '@/components/admin/CrowdAnalysisPanel';
import CrowdHeatmap from '@/components/analytics/CrowdHeatmap';

// Dynamic import for MapContainer (Leaflet doesn't work well with SSR)
const MapContainer = dynamic(
    () => import('@/components/navigation/MapContainer'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <Compass className="w-12 h-12 mx-auto mb-2 animate-spin" />
                    <p>Loading Map...</p>
                </div>
            </div>
        )
    }
);

interface RouteData {
    distance: number;
    duration: number;
    polyline: [number, number][];
    instructions: any[];
    hillAlerts: any[];
    source: string;
}

type VehicleType = 'car' | 'bike' | 'foot';

// Haversine formula for proximity tracking
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function MapPage() {
    // Location state
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [destination, setDestination] = useState<{ lat: number; lng: number; name: string; id: string } | null>(null);

    // Route state
    const [route, setRoute] = useState<RouteData | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
    const [vehicle, setVehicle] = useState<VehicleType>('car');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showParking, setShowParking] = useState(true);
    const [showHazards, setShowHazards] = useState(false);
    const [language, setLanguage] = useState<'en' | 'ta'>('en');
    const [bottomSheetExpanded, setBottomSheetExpanded] = useState(true);
    const [showBigIconMode, setShowBigIconMode] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [redirectSuggestion, setRedirectSuggestion] = useState<SuggestionCard | null>(null);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [ecoConsent, setEcoConsent] = useState(false);
    const [isEcoMode, setIsEcoMode] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const watchIdRef = useRef<number | null>(null);
    const instructionIndexRef = useRef(0);
    const routeRef = useRef<RouteData | null>(null);

    // Keep refs in sync for geolocation callback
    useEffect(() => {
        instructionIndexRef.current = currentInstructionIndex;
    }, [currentInstructionIndex]);

    useEffect(() => {
        routeRef.current = route;
    }, [route]);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    setUserLocation({ lat: 11.4102, lng: 76.6950 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserLocation({ lat: 11.4102, lng: 76.6950 });
        }

        VoiceGuide.init();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Calculate route
    const calculateRoute = useCallback(async () => {
        if (!userLocation || !destination) return;

        setIsLoading(true);
        setError(null);

        try {
            // STEP 1: VALIDATE DESTINATION
            const validationRes = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spotId: destination.id })
            });
            const validation = await validationRes.json();

            if (validation.action === 'REDIRECT' || validation.action === 'BLOCK') {
                setError(validation.message);
                if (validation.suggestion) {
                    setRedirectSuggestion(validation.suggestion);
                }
                setIsLoading(false);
                return;
            }

            // STEP 2: CALCULATE ROUTE
            const response = await fetch('/api/navigation/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: userLocation,
                    destinationId: destination.id,
                    vehicle,
                    options: {
                        avoidCrowds: true,
                        parkingFirst: vehicle === 'car'
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate route');
            }

            if (data.type === 'parking-first') {
                setRoute({
                    distance: data.totalDistance,
                    duration: data.totalDuration,
                    polyline: data.route.polyline,
                    instructions: [
                        ...data.route.instructions,
                        {
                            text: 'Park your vehicle',
                            tamil: 'வாகனத்தை நிறுத்தவும்',
                            distance: 0,
                            time: 0,
                            coordinate: [data.parking.coordinates.lat, data.parking.coordinates.lng]
                        },
                        ...data.walking.instructions
                    ],
                    hillAlerts: data.hillAlerts || [],
                    source: data.route.source
                });
            } else {
                setRoute({
                    distance: data.route.distance,
                    duration: data.route.duration,
                    polyline: data.route.polyline,
                    instructions: data.route.instructions,
                    hillAlerts: data.hillAlerts || [],
                    source: data.route.source
                });
            }

            if (data.reroute?.shouldReroute) {
                VoiceGuide.announceReroute(data.reroute.reason);
            }
        } catch (err: any) {
            console.error('Route calculation error:', err);
            setError(err.message || 'Failed to calculate route. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    }, [userLocation, destination, vehicle]);

    useEffect(() => {
        if (destination) {
            calculateRoute();
        }
    }, [destination, vehicle, calculateRoute]);

    const handleSpotSelect = useCallback((spot: any) => {
        setDestination({
            lat: spot.latitude,
            lng: spot.longitude,
            name: spot.name,
            id: spot.id
        });
        setBottomSheetExpanded(true);

        RedirectAdvisor.checkAndSuggest(spot.id).then((suggestion) => {
            if (suggestion) {
                setRedirectSuggestion(suggestion);
                VoiceGuide.announceReroute("Crowd alert: ${spot.name} is busy. Suggesting ${suggestion.suggestedSpot.name} instead.");
            } else {
                setRedirectSuggestion(null);
            }
        });
    }, []);

    const handleMapSpotClick = useCallback((spotId: string) => {
        const spot = OOTY_SPOTS.find((s) => s.id === spotId);
        if (spot) {
            handleSpotSelect(spot);
        }
    }, [handleSpotSelect]);

    // Start navigation with proximity tracking
    const startNavigation = useCallback(() => {
        if (!route) return;

        setIsNavigating(true);
        setCurrentInstructionIndex(0);
        instructionIndexRef.current = 0;
        HillSafety.startTrip();

        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(newLocation);

                    // Check hill hazards
                    HillSafety.checkLocation(newLocation.lat, newLocation.lng);

                    // Turn-by-turn proximity step update
                    const currentRoute = routeRef.current;
                    const currentIndex = instructionIndexRef.current;

                    if (currentRoute?.instructions && currentRoute.instructions[currentIndex]) {
                        const stepCoord = currentRoute.instructions[currentIndex].coordinate;
                        if (stepCoord) {
                            const dist = getDistanceInMeters(
                                newLocation.lat,
                                newLocation.lng,
                                stepCoord[0],
                                stepCoord[1]
                            );

                            // Progress to next instruction if within 25 meters
                            if (dist < 25 && currentIndex < currentRoute.instructions.length - 1) {
                                const nextIndex = currentIndex + 1;
                                setCurrentInstructionIndex(nextIndex);
                                instructionIndexRef.current = nextIndex;
                                VoiceGuide.announceInstruction(currentRoute.instructions[nextIndex]);
                            }
                        }
                    }
                },
                (err) => console.warn('Location watch error:', err),
                { enableHighAccuracy: true, maximumAge: 1000 }
            );
        }

        if (route.instructions[0]) {
            VoiceGuide.announceInstruction(route.instructions[0]);
        }
    }, [route]);

    const endNavigation = useCallback(() => {
        setIsNavigating(false);
        setCurrentInstructionIndex(0);
        instructionIndexRef.current = 0;
        HillSafety.endTrip();

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        VoiceGuide.stop();
    }, []);

    const clearDestination = useCallback(() => {
        setDestination(null);
        setRoute(null);
        setIsNavigating(false);
        endNavigation();
    }, [endNavigation]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 relative">
                {/* Map */}
                <div className="absolute inset-0">
                    {isEcoMode ? (
                        <GoogleMapContainer spots={OOTY_SPOTS} userId="user_session_id" />
                    ) : (
                        <MapContainer
                            center={[11.4102, 76.6950]}
                            zoom={13}
                            userLocation={userLocation}
                            destination={destination}
                            route={route?.polyline}
                            onSpotClick={handleMapSpotClick}
                            showParking={showParking}
                            showHazards={showHazards}
                            className="w-full h-full"
                        />
                    )}
                </div>

                {/* Navigation UI */}
                {isNavigating && route && (
                    <NavigationUI
                        instructions={route.instructions}
                        hillAlerts={route.hillAlerts}
                        currentIndex={currentInstructionIndex}
                        distance={route.distance}
                        duration={route.duration}
                        isNavigating={isNavigating}
                        onClose={endNavigation}
                        language={language}
                        onLanguageChange={setLanguage}
                    />
                )}

                {/* Search Bar */}
                {!isNavigating && (
                    <div className="absolute top-24 left-4 right-4 z-[500]">
                        <SearchBar
                            onSelect={handleSpotSelect}
                            placeholder="Where would you like to go?"
                        />
                    </div>
                )}

                {/* Layer Filter Button */}
                {!isNavigating && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="absolute top-44 right-4 z-[500] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition"
                        title="Map Layers"
                    >
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {/* Visual Navigation & Mode Triggers */}
                {!isNavigating && (
                    <div className="absolute top-44 left-4 z-[500] flex flex-col gap-2">
                        {/* Admin Crowd Control */}
                        <button
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition"
                            title="Crowd Control Panel"
                        >
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </button>

                        {/* Big Icon Mode Trigger */}
                        <button
                            onClick={() => setShowBigIconMode(true)}
                            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition text-blue-600"
                            title="Big Icon Mode"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>

                        {/* Visual Image Selector Trigger */}
                        <button
                            onClick={() => setShowImageSelector(true)}
                            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition text-indigo-600"
                            title="Image Selector"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        {/* Eco Mode Toggle */}
                        <button
                            onClick={() => setIsEcoMode(!isEcoMode)}
                            className={`p-3 rounded-full shadow-lg transition ${
                                isEcoMode ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'
                            }`}
                            title="Toggle Eco Mode"
                        >
                            <TreePine className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Panels & Overlays */}
                {showAdminPanel && !isNavigating && (
                    <CrowdAnalysisPanel onClose={() => setShowAdminPanel(false)} />
                )}

                {showHeatmap && <CrowdHeatmap />}

                {/* Filter Panel */}
                {showFilters && !isNavigating && (
                    <div className="absolute top-56 right-4 z-[500] bg-slate-950 border border-white/20 rounded-2xl shadow-2xl p-4 w-72 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-base">Map Layers</span>
                            <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-white/10" aria-label="Close map layers">
                                <X className="w-5 h-5 text-white/80" />
                            </button>
                        </div>
                        <label className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer text-white">
                            <input
                                type="checkbox"
                                checked={showParking}
                                onChange={(e) => setShowParking(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-500"
                            />
                            <ParkingCircle className="w-5 h-5 text-green-500" />
                            <span className="font-semibold">Parking</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer text-white">
                            <input
                                type="checkbox"
                                checked={showHazards}
                                onChange={(e) => setShowHazards(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-500"
                            />
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <span className="font-semibold">Hill Alerts</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer text-white">
                            <input
                                type="checkbox"
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-500"
                            />
                            <Layers className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">Crowd Heatmap</span>
                        </label>
                    </div>
                )}

                {/* Bottom Sheet */}
                {destination && !isNavigating && (
                    <div
                        className={`absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
                            bottomSheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
                        }`}
                    >
                        <button
                            onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
                            className="w-full py-3 flex items-center justify-center"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </button>

                        {!bottomSheetExpanded && (
                            <div className="px-6 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{destination.name}</p>
                                        {route && (
                                            <p className="text-sm text-gray-500">
                                                {route.distance.toFixed(1)} km • {Math.round(route.duration)} min
                                            </p>
                                        )}
                                    </div>
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        )}

                        {bottomSheetExpanded && (
                            <div className="px-6 pb-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">{destination.name}</h2>
                                            <button onClick={clearDestination} className="p-2 hover:bg-gray-100 rounded-full">
                                                <X className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        {route ? (
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-gray-600">{route.distance.toFixed(1)} km</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600">{Math.round(route.duration)} min</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    via {route.source}
                                                </span>
                                            </div>
                                        ) : isLoading ? (
                                            <p className="text-sm text-gray-400">Calculating route...</p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-6">
                                    {[
                                        { id: 'car' as const, icon: Car, label: 'Car' },
                                        { id: 'bike' as const, icon: Bike, label: 'Bike' },
                                        { id: 'foot' as const, icon: Footprints, label: 'Walk' }
                                    ].map(({ id, icon: Icon, label }) => (
                                        <button
                                            key={id}
                                            onClick={() => setVehicle(id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition ${
                                                vehicle === id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {route?.hillAlerts && route.hillAlerts.length > 0 && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            <span className="font-medium text-amber-800">Route Warnings</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {route.hillAlerts.slice(0, 2).map((alert, idx) => (
                                                <li key={idx} className="text-sm text-amber-700">
                                                    • {alert.name}
                                                </li>
                                            ))}
                                            {route.hillAlerts.length > 2 && (
                                                <li className="text-sm text-amber-500">
                                                    +{route.hillAlerts.length - 2} more alerts
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={startNavigation}
                                    disabled={!route || isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition shadow-lg shadow-blue-500/30"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="w-5 h-5" />
                                            Start Navigation
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Default placeholder */}
                {!destination && !isNavigating && (
                    <div className="absolute bottom-8 left-4 right-4 z-[500]">
                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <Navigation className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Ooty Navigation</h3>
                            <p className="text-sm text-gray-500">
                                Search for a destination or tap on a spot to start navigating
                            </p>
                        </div>
                    </div>
                )}

                {/* Accessibility Components */}
                <BigIconMode
                    active={showBigIconMode}
                    onClose={() => setShowBigIconMode(false)}
                    onSelectDestination={(id) => {
                        handleMapSpotClick(id);
                        setShowBigIconMode(false);
                    }}
                    onStartNavigation={() => {
                        setShowBigIconMode(false);
                        startNavigation();
                    }}
                    onGoSafe={() => {
                        setShowHazards(true);
                        setShowBigIconMode(false);
                    }}
                />

                <ImageSelector
                    active={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={(id) => {
                        handleMapSpotClick(id);
                        setShowImageSelector(false);
                    }}
                />

                {/* Suggestion Overlay */}
                {redirectSuggestion && !isNavigating && (
                    <ThumbnailUI
                        suggestion={redirectSuggestion}
                        onNavigate={(spotId) => {
                            handleMapSpotClick(spotId);
                            setRedirectSuggestion(null);
                        }}
                        onDismiss={() => setRedirectSuggestion(null)}
                        onBook={(spotId) => {
                            handleMapSpotClick(spotId);
                            setRedirectSuggestion(null);
                        }}
                    />
                )}

                <LiveConsent
                    onConsent={(granted) => {
                        setEcoConsent(granted);
                        if (granted) {
                            fetch('/api/eco/location', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: 'active-user', consent: true })
                            }).then(() => {
                                fetch('/api/eco/points', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: 'active-user', action: 'SHARE_LOCATION' })
                                });
                            });
                        }
                    }}
                />
            </main>
        </div>
    );
}