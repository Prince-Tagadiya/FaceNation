import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Scan, Lock, Users, Activity, EyeOff, Binary, CheckCircle } from 'lucide-react';
import Magnetic from '../components/ui/Magnetic';
import { SECTIONS, NAV_LINKS } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {

  useEffect(() => {
    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const items = el.querySelectorAll('.animate-item');
      const container = el.querySelector('.content-container');
      const bgLabel = el.querySelector('.bg-label');
      
      gsap.fromTo(items, 
        { y: 40, opacity: 0, scale: 0.98, skewY: 0.5 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          skewY: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      if (container) {
        gsap.to(container, {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }

      if (bgLabel) {
        gsap.to(bgLabel, {
          y: -120,
          opacity: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }
    });

    gsap.from(".nav-reveal", {
        y: -80,
        opacity: 0,
        duration: 1.2,
        delay: 0.8,
        ease: "expo.out"
    });

  }, []);

  return (
    <main className="relative w-full z-10 font-sans text-sm md:text-base">
      
      {/* HUD Header */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-dark/90 backdrop-blur-xl border-b border-white/5 px-6 py-2 flex justify-between items-center text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-gray-500 font-mono">
        <span className="flex items-center gap-3 text-alert">
            <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse shadow-[0_0_6px_#ff3333]" />
            LIVE // IDENTITY_CORE: STABLE
        </span>
        <span className="hidden lg:block opacity-50">NODE: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span className="flex items-center gap-2">
            <Activity size={10} className="text-primary" />
            V.2.5.0_ALPHA
        </span>
      </div>

      {/* Main Nav */}
      <nav className="fixed top-10 left-0 w-full px-8 py-4 flex justify-between items-center z-50 text-white pointer-events-none nav-reveal">
        <Magnetic>
          <div className="text-xl md:text-2xl font-bold tracking-tighter cursor-pointer flex items-center gap-2 pointer-events-auto group">
            <div className="relative">
                <Scan size={22} className="text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span>FACE<span className="font-light text-gray-500">NATION</span></span>
          </div>
        </Magnetic>
        <div className="hidden md:flex gap-8 pointer-events-auto bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/10 hover:border-primary/30 transition-colors">
          {NAV_LINKS.map((link) => (
            <Magnetic key={link.name}>
              <a href={link.href} className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all duration-300">
                {link.name}
              </a>
            </Magnetic>
          ))}
        </div>
      </nav>

      <div className="w-full">
        {SECTIONS.map((section, index) => {
          const isHero = index === 0;
          const isCTA = index === SECTIONS.length - 1;
          
          return (
            <section 
              key={section.id} 
              id={section.id}
              className={`min-h-[105vh] w-full flex flex-col justify-center px-6 md:px-24 relative overflow-hidden
                ${section.align === 'center' ? 'items-center text-center' : ''}
                ${section.align === 'right' ? 'items-end text-right' : ''}
                ${section.align === 'left' ? 'items-start text-left' : ''}
              `}
            >
              {/* Background Ghost Label */}
              <div className="bg-label absolute text-[16vw] font-bold text-white/[0.015] pointer-events-none select-none uppercase tracking-tighter z-0 -translate-y-10">
                {section.id}
              </div>

              {/* Parallax Vertical Line */}
              <div className="absolute left-6 md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden md:block" />
              
              <div className={`content-container max-w-2xl pointer-events-auto relative z-10 ${!isHero && 'bg-black/70 backdrop-blur-2xl p-10 md:p-12 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] rounded-xl'}`}>
                
                {/* Visual Identity Marker */}
                <div className="animate-item mb-8 text-primary flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-md group hover:border-primary/50 transition-colors">
                        {section.id === 'capture' && <Scan size={28} />}
                        {section.id === 'vault' && <Lock size={28} />}
                        {section.id === 'verify' && <Binary size={28} />}
                        {section.id === 'compliance' && <Activity size={28} />}
                        {section.id === 'status' && <Users size={28} />}
                        {section.id === 'privacy' && <EyeOff size={28} />}
                        {section.id === 'cta' && <Shield size={28} />}
                        {isHero && <Scan size={40} className="animate-pulse shadow-[0_0_15px_#00f0ff]" />}
                    </div>
                    {!isHero && (
                        <div className="flex flex-col">
                            <span className="font-mono text-[8px] text-primary/60 uppercase tracking-[0.4em] mb-0.5">STREAM_PHASE</span>
                            <span className="font-mono text-[10px] text-white uppercase tracking-[0.15em]">{section.subtitle}</span>
                        </div>
                    )}
                </div>

                <h2 className={`animate-item font-bold tracking-tighter mb-8 leading-[0.95]
                  ${isHero ? 'text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20' : 'text-4xl md:text-5xl text-white'}
                `}>
                  {section.title}
                </h2>
                
                {isHero && <p className="animate-item text-primary font-mono text-xs tracking-[0.6em] mb-12 uppercase">{section.subtitle}</p>}

                <p className={`animate-item text-gray-400 leading-relaxed font-mono font-light
                   ${isHero ? 'text-lg md:text-xl max-w-xl mx-auto opacity-70' : 'text-base md:text-lg opacity-90 max-w-lg'}
                `}>
                  {section.description}
                </p>

                {/* Verification Interaction UI */}
                {section.id === 'verify' && (
                  <div className="animate-item mt-10 w-full bg-dark/60 border border-success/30 p-6 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[30%] bg-success/10 blur-2xl animate-scan pointer-events-none opacity-40" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-success/20 flex items-center justify-center bg-success/5 group-hover:border-success/60 transition-colors">
                          <CheckCircle className="text-success w-8 h-8" />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-success opacity-20 animate-ping" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-success/60 uppercase tracking-[0.3em] flex items-center gap-2">
                          <span className="w-1 h-1 bg-success rounded-full animate-pulse" />
                          BIOMETRIC_HANDSHAKE: OK
                        </span>
                        <span className="text-4xl font-bold text-success tracking-tight drop-shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                          VALIDATED
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isHero && (
                    <div className="animate-item mt-24 flex flex-col items-center gap-5 text-gray-600 font-mono text-[9px]">
                        <div className="w-[1px] h-16 bg-gradient-to-b from-primary via-primary/10 to-transparent animate-shimmer" />
                        <span className="tracking-[0.6em] animate-pulse">SCROLL_TO_INITIALIZE</span>
                    </div>
                )}

                {isCTA && (
                    <div className="animate-item mt-12 flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Magnetic strength={0.3}>
                            <button className="relative group bg-primary text-black px-10 py-5 font-bold uppercase tracking-[0.25em] text-[10px] transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(0,240,255,0.3)]">
                                <span className="relative z-10">Launch Protocol</span>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        </Magnetic>
                        <Magnetic strength={0.2}>
                            <button className="text-white px-10 py-5 border border-white/10 font-mono text-[10px] uppercase tracking-[0.25em] hover:bg-white/5 transition-all duration-300 backdrop-blur-xl">
                                Whitepaper
                            </button>
                        </Magnetic>
                    </div>
                )}

                {!isHero && !isCTA && (
                    <div className="animate-item mt-12 flex items-center gap-4">
                        <div className="flex gap-1.5">
                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/20" />)}
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
                        <div className="font-mono text-[9px] text-gray-600 uppercase tracking-[0.4em]">BLOCK_ID: {index.toString().padStart(4, '0')}</div>
                    </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-6 left-6 z-50 pointer-events-none hidden lg:block">
          <div className="font-mono text-[8px] text-primary/25 uppercase tracking-[0.2em] flex flex-col gap-1">
              <div className="flex items-center gap-2">
                  <div className="w-0.5 h-0.5 bg-primary/30 rounded-full" />
                  LATENCY: 12ms
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-0.5 h-0.5 bg-primary/30 rounded-full" />
                  UPTIME: 99.9982%
              </div>
          </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-1.5 font-mono text-[9px] text-primary pointer-events-none uppercase tracking-[0.3em]">
        <div className="flex items-center gap-3">
            <span className="opacity-30 text-[8px]">ENCRYPTION:</span>
            <span>AES_256_GCM</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="opacity-30 text-[8px]">SYNC_STATUS:</span>
            <span className="animate-pulse">SYNCHRONIZED</span>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;