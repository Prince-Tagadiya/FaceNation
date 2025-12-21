import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParticleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color('#00f0ff') },
    uTime: { value: 0 },
    uOpacity: { value: 0.6 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aSize;
    attribute float aRandom;
    varying float vDist;

    void main() {
      vec3 pos = position;
      
      // Idle pulse animation
      float pulse = sin(uTime * 1.5 + aRandom * 10.0) * 0.02;
      pos.x += pulse;
      pos.y += pulse;
      pos.z += pulse;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mvPosition.z;
      vDist = dist;

      gl_PointSize = aSize * uPixelRatio * (450.0 / dist);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vDist;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      glow = pow(glow, 2.0);

      float visibility = smoothstep(25.0, 5.0, vDist);
      float alpha = glow * uOpacity * (0.3 + 0.7 * visibility);

      gl_FragColor = vec4(uColor * 2.2, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const MorphingParticles = () => {
  const meshRef = useRef<THREE.Points>(null);
  const count = 16000; 
  
  const shapes = useMemo(() => {
    const head = new Float32Array(count * 3);
    const spread = new Float32Array(count * 3);
    const ring = new Float32Array(count * 3);
    const cloud = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Slightly smaller particles for a more refined digital look
      sizes[i] = Math.random() * 0.035 + 0.01; 
      randoms[i] = Math.random();

      // --- 1. VOLUMETRIC 3D ROUND FACE ---
      const roll = Math.random();
      let hx = 0, hy = 0, hz = 0;

      if (roll < 0.6) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const rX = 2.1, rY = 2.8, rZ = 1.9;
        hx = rX * Math.sin(v) * Math.cos(u);
        hy = rY * Math.cos(v);
        hz = rZ * Math.sin(v) * Math.sin(u);
      } else if (roll < 0.75) {
        const t = Math.random() * Math.PI * 2;
        const isLeft = Math.random() > 0.5;
        const r = Math.sqrt(Math.random()) * 0.35;
        hx = (isLeft ? -0.8 : 0.8) + Math.cos(t) * r;
        hy = 0.6 + Math.sin(t) * r;
        hz = 1.8 + Math.cos(r * 2.0) * 0.2; 
      } else if (roll < 0.85) {
        const t = Math.PI + (Math.random() * 1.0 - 0.5);
        const r = 0.85;
        hx = Math.sin(t) * r;
        hy = -1.1 + Math.cos(t) * 0.35;
        hz = 1.6 + Math.abs(hx) * 0.1;
      } else {
        hx = (Math.random() - 0.5) * 3.5;
        hy = (Math.random() - 0.5) * 4.5;
        hz = (Math.random() - 0.5) * 3.0;
      }

      head[i3] = hx;
      head[i3 + 1] = hy;
      head[i3 + 2] = hz;

      let sx = (Math.random() - 0.5) * 28;
      let sy = (Math.random() - 0.5) * 20;
      let sz = (Math.random() - 0.5) * 6;
      const snap = 0.7;
      spread[i3] = Math.round(sx / snap) * snap;
      spread[i3 + 1] = Math.round(sy / snap) * snap;
      spread[i3 + 2] = Math.round(sz / snap) * snap;

      const rRing = 4.8 + Math.random() * 0.6;
      const tRing = Math.random() * Math.PI * 2;
      ring[i3] = rRing * Math.cos(tRing);
      ring[i3 + 1] = (Math.random() - 0.5) * 18;
      ring[i3 + 2] = rRing * Math.sin(tRing);

      const rCloud = Math.random() * 11;
      const tCloud = Math.random() * Math.PI * 2;
      cloud[i3] = rCloud * Math.cos(tCloud);
      cloud[i3 + 1] = (Math.random() - 0.5) * 14;
      cloud[i3 + 2] = rCloud * Math.sin(tCloud);
    }

    return { head, spread, ring, cloud, sizes, randoms };
  }, []);

  const morphTarget = useRef({ value: 0 });

  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });

    tl.to(morphTarget.current, { value: 1, ease: "power2.inOut", duration: 1 }, 0); 
    tl.to(morphTarget.current, { value: 2, ease: "power2.inOut", duration: 1 }, 2.5); 
    tl.to(morphTarget.current, { value: 3, ease: "sine.inOut", duration: 1 }, 5);
    tl.to(morphTarget.current, { value: 4, ease: "power4.inOut", duration: 1 }, 6.5);

    return () => tl.kill();
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    ParticleMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    const posAttr = meshRef.current.geometry.attributes.position.array as Float32Array;
    const mt = morphTarget.current.value;

    let targetArr = shapes.head;
    let blend = 0;
    let lerpSpeed = 0.12; 

    const colorCyan = new THREE.Color('#00f0ff');
    const colorBlue = new THREE.Color('#0044ff');
    const colorWhite = new THREE.Color('#ffffff');

    if (mt < 1) { 
      targetArr = shapes.spread;
      blend = mt;
      ParticleMaterial.uniforms.uColor.value.lerpColors(colorCyan, colorBlue, blend);
    } else if (mt < 2) { 
      targetArr = shapes.ring;
      blend = mt - 1;
      ParticleMaterial.uniforms.uColor.value.lerp(colorCyan, 0.05);
    } else if (mt < 3) { 
      targetArr = shapes.cloud;
      blend = mt - 2;
      ParticleMaterial.uniforms.uColor.value.lerp(colorWhite, 0.05);
      lerpSpeed = 0.06;
    } else { 
      targetArr = shapes.head;
      blend = mt - 3;
      ParticleMaterial.uniforms.uColor.value.lerpColors(colorWhite, colorCyan, blend);
      lerpSpeed = 0.14;
    }

    const prevArr = mt < 1 ? shapes.head : (mt < 2 ? shapes.spread : (mt < 3 ? shapes.ring : shapes.cloud));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const tx = prevArr[i3] + (targetArr[i3] - prevArr[i3]) * blend;
      const ty = prevArr[i3+1] + (targetArr[i3+1] - prevArr[i3+1]) * blend;
      const tz = prevArr[i3+2] + (targetArr[i3+2] - prevArr[i3+2]) * blend;
      posAttr[i3] += (tx - posAttr[i3]) * lerpSpeed;
      posAttr[i3+1] += (ty - posAttr[i3+1]) * lerpSpeed;
      posAttr[i3+2] += (tz - posAttr[i3+2]) * lerpSpeed;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    const scanAngle = Math.sin(state.clock.elapsedTime * 0.5) * (Math.PI / 4);
    meshRef.current.rotation.y = scanAngle;
    meshRef.current.rotation.x += (state.mouse.y * 0.15 - meshRef.current.rotation.x) * 0.05;

    const targetPosX = state.mouse.x * 0.4;
    const targetPosY = -state.mouse.y * 0.4;
    const dist = Math.sqrt(state.mouse.x * state.mouse.x + state.mouse.y * state.mouse.y);
    const targetPosZ = dist * -0.8; 

    meshRef.current.position.x += (targetPosX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetPosY - meshRef.current.position.y) * 0.05;
    meshRef.current.position.z += (targetPosZ - meshRef.current.position.z) * 0.05;
  });

  return (
    <points ref={meshRef} material={ParticleMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={shapes.head} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={shapes.sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={shapes.randoms} itemSize={1} />
      </bufferGeometry>
    </points>
  );
};

const Scene: React.FC = () => {
  return (
    <>
      {/* Increased Z from 9 to 11.5 for a less zoomed feel */}
      <PerspectiveCamera makeDefault position={[0, 0, 11.5]} fov={35} />
      <group>
        <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.4}>
          <MorphingParticles />
        </Float>
      </group>
      <Environment preset="city" />
    </>
  );
};

export default Scene;