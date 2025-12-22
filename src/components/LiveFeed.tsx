import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Video, VideoOff } from 'lucide-react';

interface LiveFeedProps {
    onClose: () => void;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

    // Camera Device Management
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Fetch available devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                }
            } catch (err) {
                console.error("Error fetching devices:", err);
            }
        };
        getDevices();
    }, []);

    // Start Camera Stream
    useEffect(() => {
        if (!selectedDeviceId) return;

        let currentStream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            setLoading(true);
            try {
                // Stop previous stream if any
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: { exact: selectedDeviceId },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                });

                if (isMounted) {
                    currentStream = mediaStream;
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    setError('');
                } else {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error accessing camera:", err);
                    setError("Unable to access camera feed. Please check permissions.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [selectedDeviceId]); // Re-run when device changes

    // Update timestamp
    useEffect(() => {
        const timer = setInterval(() => {
            setTimestamp(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden relative shadow-2xl">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-red-600 font-mono font-bold tracking-widest text-xs">LIVE FEED</span>
                        </div>
                        <p className="text-white/50 text-[10px] font-mono mt-1">{timestamp}</p>
                    </div>

                    {/* Camera Selector */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={selectedDeviceId}
                                onChange={(e) => setSelectedDeviceId(e.target.value)}
                                className="bg-black/50 text-white text-xs font-mono border border-white/20 rounded px-2 py-1 outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                {devices.map((device, index) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Video size={12} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm"
                            >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full transition-all backdrop-blur-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Feed */}
                <div className="aspect-video bg-black relative flex items-center justify-center">
                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                            <div className="text-blue-500 font-mono text-xs animate-pulse">CONNECTING TO FEED...</div>
                        </div>
                    )}

                    {error ? (
                        <div className="text-center p-8">
                            <VideoOff size={48} className="text-red-500 mx-auto mb-4" />
                            <p className="text-red-400 font-mono text-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {/* Reticle / HUD Overlay */}
                            <div className="absolute inset-0 border-[20px] border-transparent pointer-events-none">
                                <div className="w-8 h-8 border-t-2 border-l-2 border-white/20 absolute top-4 left-4" />
                                <div className="w-8 h-8 border-t-2 border-r-2 border-white/20 absolute top-4 right-4" />
                                <div className="w-8 h-8 border-b-2 border-l-2 border-white/20 absolute bottom-4 left-4" />
                                <div className="w-8 h-8 border-b-2 border-r-2 border-white/20 absolute bottom-4 right-4" />

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono tracking-[0.5em]">
                                    SECURE FEED ENCRYPTED
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls (Mock) */}
                <div className="bg-[#111] p-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                    <div className="flex gap-4">
                        <span className="text-green-500">SIGNAL: STRONG</span>
                        <span>BITRATE: 4096 KBPS</span>
                        <span>LATENCY: 24MS</span>
                    </div>
                    <div>
                        FACENATION SURVEILLANCE SYSTEMS v2.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveFeed;
