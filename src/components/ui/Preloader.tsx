import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Scan, Cpu } from 'lucide-react';
import gsap from 'gsap';

const Preloader: React.FC = () => {
  const { active, progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        const tl = gsap.timeline({
          onComplete: () => setFinished(true)
        });

        tl.to(".preloader-text", { 
          opacity: 0, 
          y: -15, 
          stagger: 0.1, 
          duration: 0.4, 
          ease: "power2.in" 
        });

        tl.to(".preloader-shutter-top", { 
          yPercent: -100, 
          duration: 0.8, 
          ease: "power4.inOut" 
        }, "-=0.2");
        
        tl.to(".preloader-shutter-bottom", { 
          yPercent: 100, 
          duration: 0.8, 
          ease: "power4.inOut" 
        }, "<");
        
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (finished) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center font-mono">
      <div className="preloader-shutter-top absolute top-0 left-0 w-full h-1/2 bg-[#020205] border-b border-white/5 z-0" />
      <div className="preloader-shutter-bottom absolute bottom-0 left-0 w-full h-1/2 bg-[#020205] border-t border-white/5 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full scale-90 md:scale-100">
        
        <div className="preloader-text flex items-center gap-3 mb-5 text-primary">
          <Scan size={40} className="animate-spin-slow" strokeWidth={1} />
          <h1 className="text-4xl font-bold tracking-[0.15em] text-white">FACENATION</h1>
        </div>
        
        <div className="preloader-text flex items-center gap-3 w-56 mb-2">
            <div className="h-[1px] bg-primary/20 flex-1"></div>
            <Cpu size={12} className="text-primary/40" />
            <div className="h-[1px] bg-primary/20 flex-1"></div>
        </div>

        <div className="preloader-text w-56 h-0.5 bg-gray-900 rounded-none overflow-hidden relative mb-4">
          <div 
            className="h-full bg-primary shadow-[0_0_8px_#00f0ff] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="preloader-text text-[10px] text-primary/60 flex flex-col items-center gap-1 uppercase tracking-widest">
           <span>Initializing... {Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="preloader-text absolute top-8 left-8 w-12 h-12 border-t border-l border-white/10" />
      <div className="preloader-text absolute bottom-8 right-8 w-12 h-12 border-b border-r border-white/10" />
    </div>
  );
};

export default Preloader;