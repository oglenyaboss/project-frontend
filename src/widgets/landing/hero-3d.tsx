"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

interface AnimatedSphereProps {
  position: [number, number, number];
  scale: number;
  color: string;
  speed?: number;
}

function AnimatedSphere({
  position,
  scale,
  color,
  speed = 1,
}: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Simple ambient rotation can be added if needed, but Float text handles most movement
      // meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          envMapIntensity={0.8}
          clearcoat={0.8}
          clearcoatRoughness={0}
          metalness={0.2}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Sber green sphere */}
          <AnimatedSphere
            position={[4, 1, 0]}
            scale={1.8}
            color="#2ebf4e"
            speed={1.5}
          />

          {/* Accent secondary sphere */}
          <AnimatedSphere
            position={[-4, -2, -2]}
            scale={1.2}
            color="#3b82f6"
            speed={2}
          />

          {/* Small decorative sphere */}
          <AnimatedSphere
            position={[3, -3, -1]}
            scale={0.8}
            color="#a855f7"
            speed={1.2}
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
