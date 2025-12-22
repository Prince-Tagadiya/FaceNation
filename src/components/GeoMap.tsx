import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Shield, Radio, Target, Layers } from 'lucide-react';

interface GeoMockProps {
    onClose: () => void;
    initialFocusId?: string | null;
}

interface MapPoint {
    id: string;
    x: number;
    y: number;
    type: 'unit' | 'incident' | 'camera';
    status: 'active' | 'idle' | 'warning' | 'critical';
    label: string;
}

const MOCK_POINTS: MapPoint[] = [
    { id: 'u1', x: 20, y: 30, type: 'unit', status: 'active', label: 'Unit Alpha' },
    { id: 'u2', x: 45, y: 60, type: 'unit', status: 'idle', label: 'Unit Bravo' },
    { id: 'u3', x: 70, y: 25, type: 'unit', status: 'active', label: 'Unit Charlie' },
    { id: 'i1', x: 50, y: 50, type: 'incident', status: 'critical', label: 'Suspicious Activity' },
    { id: 'c1', x: 10, y: 10, type: 'camera', status: 'active', label: 'Cam-01 (Main St)' },
    { id: 'c2', x: 80, y: 80, type: 'camera', status: 'warning', label: 'Cam-04 (Park)' },
    // Mock Incident Types matching those in AlertView
    { id: '1', x: 35, y: 40, type: 'incident', status: 'critical', label: 'Face Match: Subject 89' },
    { id: '2', x: 55, y: 15, type: 'incident', status: 'active', label: 'Perimeter Breach' },
    { id: '5', x: 25, y: 75, type: 'incident', status: 'critical', label: 'Face Match: Missing Person' },
];

const GeoMap: React.FC<GeoMockProps> = ({ onClose, initialFocusId }) => {
    const [points, setPoints] = useState<MapPoint[]>(MOCK_POINTS);
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const focusOnPoint = (point: MapPoint) => {
        setSelectedPoint(point);
        setZoom(2.5);
        // Calculate pan to center the point
        // We want the point (at point.x, point.y) to be at the center (50, 50)
        // Pan offset = Center - Point * Zoom ? No, simpler logic:
        // Textual representation: Translate moves the origin.
        // We want origin such that (x% + tx) * scale = 50% relative to viewport? 
        // Let's use standard CS translate:
        // Center of viewport is (0,0) conceptually for this math if we strictly center.
        // But map is 0-100%. Center is 50,50.
        // Target: 50 + (point.x - 50) * scale + translate = 50 -> translate = -(point.x - 50) * scale?

        // Let's stick to percentages for simplicity.
        // If point is at 20, 30. We want it at 50, 50.
        // We need to shift the map by (50 - 20) = +30% x, and (50 - 30) = +20% y.
        // Then apply zoom.
        setPan({
            x: (50 - point.x),
            y: (50 - point.y)
        });
    };

    // Initial Focus Effect
    useEffect(() => {
        if (initialFocusId) {
            const target = points.find(p => p.id === initialFocusId);
            if (target) {
                focusOnPoint(target);
            }
        }
    }, [initialFocusId]);

    // Handle Dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return; // Ignore clicks on buttons
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = (e.clientX - lastMousePos.x) / zoom * 0.1; // Scale down sensibility
        const dy = (e.clientY - lastMousePos.y) / zoom * 0.1;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Simulate movement for units
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints(prev => prev.map(p => {
                if (p.type === 'unit' && p.status === 'active') {
                    return {
                        ...p,
                        x: Math.max(0, Math.min(100, p.x + (Math.random() - 0.5) * 2)),
                        y: Math.max(0, Math.min(100, p.y + (Math.random() - 0.5) * 2))
                    };
                }
                return p;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col">
            {/* ... Header ... */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Navigation className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-[#00ccff]">GEO-SPATIAL TRACKING</h1>
                        <p className="text-xs text-gray-500 font-mono">SECTOR 7 // REAL-TIME UNIT DEPLOYMENT</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.2))} className="px-3 py-1 hover:bg-white/10 rounded">-</button>
                        <div className="px-3 py-1 text-xs font-mono border-x border-white/10 flex items-center">ZOOM {Math.round(zoom * 100)}%</div>
                        <button onClick={() => setZoom(Math.min(5, zoom + 0.2))} className="px-3 py-1 hover:bg-white/10 rounded">+</button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                        <X className="text-white w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Info */}
                <div className="w-80 bg-[#0a0a0a] border-r border-white/10 p-4 overflow-y-auto hidden md:block">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Active Assets</h3>
                    <div className="space-y-2">
                        {points.map(point => (
                            <div
                                key={point.id}
                                onClick={() => focusOnPoint(point)}
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

                    {/* ... Sector Status Widget ... */}
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

                {/* Map Area */}
                <div
                    className={`flex-1 relative bg-[#050505] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Map Transformation Container */}
                    <div
                        className="absolute inset-0 transition-transform duration-300 ease-out origin-center block"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`
                        }}
                    >
                        {/* Grid Background */}
                        <div className="absolute inset-[-100%] w-[300%] h-[300%] opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />

                        {/* Radar Sweep Effect (Centered on Map) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-green-500/10 rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-green-500/10 rounded-full" />
                        </div>

                        {/* Points Layer */}
                        <div className="absolute inset-0">
                            {points.map(point => (
                                <div
                                    key={point.id}
                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group/point"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag start
                                        focusOnPoint(point);
                                    }}
                                >
                                    {/* ... Point Rendering ... (same as before) */}
                                    <div className={`relative flex items-center justify-center w-8 h-8 transition-transform ${selectedPoint?.id === point.id ? 'scale-125' : 'group-hover/point:scale-110'}`}>
                                        <div className={`absolute inset-0 rounded-full opacity-50 animate-ping ${point.status === 'critical' ? 'bg-red-500' :
                                            point.status === 'active' ? 'bg-blue-500' : 'bg-transparent'
                                            }`} />

                                        <div className={`relative z-10 p-2 rounded-full border shadow-lg backdrop-blur-sm ${point.type === 'incident' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                            point.type === 'unit' ? 'bg-blue-500/20 border-blue-500 text-blue-500' :
                                                'bg-green-500/20 border-green-500 text-green-500'
                                            }`}>
                                            {point.type === 'incident' ? <Target size={16} /> :
                                                point.type === 'unit' ? <Navigation size={16} className="-rotate-45" /> :
                                                    <Radio size={16} />}
                                        </div>

                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded border border-white/20 whitespace-nowrap opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none z-20">
                                            <span className="text-[10px] font-mono uppercase font-bold">{point.label}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selection Detail Overlay */}
                    {selectedPoint && (
                        <div className="absolute bottom-8 right-8 w-72 bg-black/90 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-2xl animate-in slide-in-from-right">
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
                                    <span className="text-white">{selectedPoint.x.toFixed(4)}, {selectedPoint.y.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>LAST PING:</span>
                                    <span className="text-white">0.4s AGO</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={() => setZoom(2.5)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded text-xs text-white uppercase tracking-wider"
                                >
                                    Focus
                                </button>
                                <button
                                    onClick={() => alert(`Establishing encrypted channel with ${selectedPoint.label}...`)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-xs text-black font-bold uppercase tracking-wider"
                                >
                                    Contact
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
