"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

// Процедурная геометрия галочки Сбера
function createSberCheckmarkGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();

  // Чистая галочка
  shape.moveTo(-3, 0);
  shape.lineTo(-1.8, 0);
  shape.lineTo(0.5, 2.8);
  shape.lineTo(5.5, -3);
  shape.lineTo(6.5, -2);
  shape.lineTo(0.5, 4.5);
  shape.lineTo(-3, 0);

  const extrudeSettings = {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 5,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// Хук для отслеживания позиции мыши
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mouse;
}

// Орбитальные частицы вокруг логотипа
function OrbitalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 5 + Math.random() * 4;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  const bufferGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  return (
    <points ref={particlesRef} geometry={bufferGeometry}>
      <pointsMaterial
        size={0.05}
        color="#21A038"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Фоновые кольца
function BackgroundRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={ringsRef}>
      {[6, 8, 10].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.02, radius, 64]} />
          <meshBasicMaterial
            color="#21A038"
            transparent
            opacity={0.1 - i * 0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Основной логотип с glass материалом
function AnimatedLogo({ mouse }: { mouse: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const geo = createSberCheckmarkGeometry();
    geo.center();
    // Отзеркаливаем по X (горизонтально) и по Y (вертикали)
    geo.scale(1, -1, 1);
    return geo;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Плавное следование за курсором
      targetRotation.current.y = mouse.x * 0.5;
      targetRotation.current.x = mouse.y * 0.3;

      // Интерполяция для плавности
      groupRef.current.rotation.y +=
        (targetRotation.current.y - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x +=
        (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} scale={0.5}>
        {/* Glass основной меш */}
        <mesh geometry={geometry}>
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.95}
            roughness={0.1}
            thickness={0.5}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            color="#21A038"
            attenuationColor="#21A038"
            attenuationDistance={0.5}
          />
        </mesh>

        {/* Внутренний светящийся меш */}
        <mesh geometry={geometry} scale={0.95}>
          <meshStandardMaterial
            color="#21A038"
            emissive="#21A038"
            emissiveIntensity={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Основной компонент сцены
function Scene({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      {/* Освещение */}
      <ambientLight intensity={0.4} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#ffffff"
      />
      <pointLight position={[-5, 5, 5]} intensity={1} color="#21A038" />
      <pointLight position={[5, -5, -5]} intensity={0.5} color="#2ecc71" />

      {/* Фоновые элементы */}
      <BackgroundRings />
      <OrbitalParticles />

      {/* Sparkles */}
      <Sparkles
        count={100}
        scale={12}
        size={2}
        speed={0.4}
        opacity={0.6}
        color="#21A038"
      />

      {/* Основной логотип */}
      <AnimatedLogo mouse={mouse} />

      {/* Environment для отражений */}
      <Environment preset="city" />
    </>
  );
}

export interface Sber3DLogoProps {
  className?: string;
}

export function Sber3DLogo({ className }: Sber3DLogoProps) {
  const mouse = useMousePosition();

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
