import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';

const App: React.FC = () => {
  return (
    <>
      <Cursor />
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ 
            antialias: true, 
            powerPreference: "high-performance",
            alpha: true 
          }}
        >
          <AdaptiveDpr pixelated />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Professional Loading Screen */}
      <Preloader />

      {/* HTML Content */}
      <UIOverlay />
    </>
  );
};

export default App;