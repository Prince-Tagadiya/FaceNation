import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, Navigation, Radio, Target } from 'lucide-react';
import { MOCK_OFFICERS } from '../constants';
import { DashboardAlert } from '../types';

interface GeoMockProps {
    onClose: () => void;
    initialFocusId?: string | null;
    alerts: DashboardAlert[];
}

interface MapPoint {
    id: string;
    lat: number;
    lng: number;
    type: 'unit' | 'incident' | 'camera';
    status: 'active' | 'idle' | 'warning' | 'critical';
    label: string;
}

// Center around Kodinar, Gujarat, India
const CENTER_LAT = 20.792;
const CENTER_LNG = 70.702;

// Static cameras for ambience around Kodinar
const STATIC_CAMERAS: MapPoint[] = [
    { id: 'c1', lat: 20.7940, lng: 70.7040, type: 'camera', status: 'active', label: 'Cam-01 (Main Bazaar)' },
    { id: 'c2', lat: 20.7900, lng: 70.6980, type: 'camera', status: 'warning', label: 'Cam-04 (Sugar Factory Rd)' },
];

// Helper to handle map movement
const MapController: React.FC<{ target: MapPoint | null }> = ({ target }) => {
    const map = useMap();

    useEffect(() => {
        if (target) {
            map.flyTo([target.lat, target.lng], 16, { duration: 1.5 });
        }
    }, [target, map]);

    return null;
};

const createCustomIcon = (type: string, status: string) => {
    const colorClass = type === 'incident' ? 'text-red-500' : type === 'unit' ? 'text-blue-500' : 'text-green-500';
    const bgClass = type === 'incident' ? 'bg-red-500/20 border-red-500' : type === 'unit' ? 'bg-blue-500/20 border-blue-500' : 'bg-green-500/20 border-green-500';

    return L.divIcon({
        className: 'custom-icon',
        html: `<div class="w-8 h-8 rounded-full border-2 ${bgClass} ${colorClass} flex items-center justify-center shadow-lg backdrop-blur-sm relative">
                <div class="${status === 'critical' || status === 'active' ? 'animate-ping absolute inset-0 rounded-full opacity-50 ' + (status === 'critical' ? 'bg-red-500' : 'bg-blue-500') : 'hidden'}"></div>
                <div class="font-bold text-xs pointer-events-none">
                    ${type === 'incident' ? '!' : type === 'unit' ? 'U' : 'C'}
                </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const GeoMap: React.FC<GeoMockProps> = ({ onClose, initialFocusId, alerts }) => {
    const [points, setPoints] = useState<MapPoint[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

    // Sync points with alerts and constants
    useEffect(() => {
        const incidentPoints: MapPoint[] = alerts
            .filter(a => a.lat && a.lng && a.status !== 'resolved') // Only show active/assigned alerts with location
            .map(a => ({
                id: a.id,
                lat: a.lat!,
                lng: a.lng!,
                type: 'incident',
                status: a.severity === 'critical' ? 'critical' : 'active',
                label: `${a.type}: ${a.location}`
            }));

        const officerPoints: MapPoint[] = MOCK_OFFICERS.map(o => {
            // Check if officer is assigned to any active alert
            const assignedAlert = alerts.find(a => a.assignedTo === o.name && a.status !== 'resolved');
            return {
                id: o.id,
                lat: o.lat,
                lng: o.lng,
                type: 'unit',
                status: assignedAlert ? 'active' : 'idle',
                label: o.name
            };
        });

        setPoints([...incidentPoints, ...officerPoints, ...STATIC_CAMERAS]);
    }, [alerts]);

    // Initial Focus Effect
    useEffect(() => {
        if (initialFocusId && points.length > 0) {
            const target = points.find(p => p.id === initialFocusId);
            if (target) {
                setSelectedPoint(target);
            }
        }
    }, [initialFocusId, points]);

    // Simulate movement for active units
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints(prev => prev.map(p => {
                if (p.type === 'unit' && p.status === 'active') {
                    return {
                        ...p,
                        lat: p.lat + (Math.random() - 0.5) * 0.0005,
                        lng: p.lng + (Math.random() - 0.5) * 0.0005
                    };
                }
                return p;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a] z-[1000] relative shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Navigation className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">GEO-SPATIAL TRACKING</h1>
                        <p className="text-xs text-gray-500 font-mono">SECTOR: KODINAR, GUJARAT // REAL-TIME DEPLOYMENT</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                    <X className="text-white w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar Info */}
                <div className="w-80 bg-[#0a0a0a] border-r border-white/10 p-4 overflow-y-auto hidden md:block z-[400] relative">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Active Assets</h3>
                    <div className="space-y-2">
                        {points.map(point => (
                            <div
                                key={point.id}
                                onClick={() => setSelectedPoint(point)}
                                className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${selectedPoint?.id === point.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {point.type === 'unit' && <Navigation size={14} className="text-blue-400" />}
                                    {point.type === 'incident' && <Target size={14} className="text-red-400" />}
                                    {point.type === 'camera' && <Radio size={14} className="text-green-400" />}
                                    <span className="text-sm font-bold">{point.label}</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${point.status === 'active' ? 'bg-green-500 animate-pulse' : point.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded border border-white/10">
                        <h4 className="text-xs font-mono text-gray-400 mb-2">SECTOR STATUS</h4>
                        <div className="flex justify-between text-xs mb-1">
                            <span>THREAT LEVEL</span>
                            <span className="text-orange-500">ELEVATED</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 mt-1">
                            <div className="bg-orange-500 h-1 w-[60%]" />
                        </div>
                    </div>
                </div>

                {/* Real Map Area */}
                <div className="flex-1 relative bg-[#111] overflow-hidden">
                    <MapContainer
                        center={[CENTER_LAT, CENTER_LNG]}
                        zoom={15}
                        style={{ height: '100%', width: '100%', background: '#050505' }}
                        zoomControl={false}
                    >
                        {/* Sci-Fi Dark Mode Filter for OSM Tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            className="map-tiles"
                        />
                        <style>{`
                            .map-tiles {
                                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                            }
                            .leaflet-container {
                                background: #050505;
                            }
                        `}</style>

                        {points.map(point => (
                            <Marker
                                key={point.id}
                                position={[point.lat, point.lng]}
                                icon={createCustomIcon(point.type, point.status)}
                                eventHandlers={{
                                    click: () => setSelectedPoint(point),
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="text-black p-1">
                                        <strong className="block text-sm mb-1">{point.label}</strong>
                                        <span className="text-xs uppercase font-mono px-1 py-0.5 bg-black text-white rounded">{point.status}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        <MapController target={selectedPoint} />
                    </MapContainer>

                    {/* Radar Sweep Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 w-[100vh] h-[100vh] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent to-green-500/5 origin-bottom-left animate-spin-slow rounded-full opacity-50" style={{ animationDuration: '6s', transformOrigin: 'center' }} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40"></div>
                    </div>

                    {/* Selection Detail Overlay */}
                    {selectedPoint && (
                        <div className="absolute bottom-8 right-8 w-72 bg-black/90 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-2xl animate-in slide-in-from-right z-[500]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`text-[10px] font-mono px-1 py-0.5 rounded border ${selectedPoint.type === 'incident' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
                                        }`}>{selectedPoint.type.toUpperCase()}</span>
                                    <h3 className="text-lg font-bold mt-1 text-white">{selectedPoint.label}</h3>
                                </div>
                                <button onClick={() => setSelectedPoint(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                            </div>

                            <div className="space-y-2 text-xs font-mono text-gray-400">
                                <div className="flex justify-between">
                                    <span>STATUS:</span>
                                    <span className="text-white uppercase">{selectedPoint.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>COORDINATES:</span>
                                    <span className="text-white">{selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={() => alert(`Dispatching nearest unit to ${selectedPoint.lat}, ${selectedPoint.lng}...`)}
                                    className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded text-xs text-white font-bold uppercase tracking-wider"
                                >
                                    DISPATCH
                                </button>
                                <button
                                    onClick={() => alert(`Establishing channel...`)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-xs text-black font-bold uppercase tracking-wider"
                                >
                                    CONTACT
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeoMap;
