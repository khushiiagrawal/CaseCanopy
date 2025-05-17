import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Explicitly type the props
interface ScaleOfJusticeProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function ScaleOfJustice({ position, rotation }: ScaleOfJusticeProps) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t / 1.5) / 6;
      group.current.position.y = Math.sin(t / 1.5) / 10;
    }
  });

  // Increase the overall scale of the model
  const scale = 1.24;
  // Decrease the gap between the rod and the weights (move them closer to the rod)
  const sideOffset = 0.36 * scale;
  const coneOffset = 1.0 * scale;

  return (
    <Float speed={1.9} rotationIntensity={0.18} floatIntensity={0.28}>
      <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
        {/* Base */}
        <mesh position={[0, -2.0, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 0.3, 32]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Central Column */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 32]} />
          <meshStandardMaterial
            color="#1B2B44"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[4, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#1B2B44"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Left Scale */}
        <group position={[-1.96, 0.5, 0]}>
          <mesh position={[0, -sideOffset, 0]}>
            <cylinderGeometry args={[0.08, 0.08, coneOffset, 32]} />
            <meshStandardMaterial
              color="#1B2B44"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -coneOffset, 0]}>
            <coneGeometry args={[0.5, 1, 32]} />
            <meshStandardMaterial
              color="#D4AF37"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
        {/* Right Scale */}
        <group position={[1.96, 0.5, 0]}>
          <mesh position={[0, -sideOffset, 0]}>
            <cylinderGeometry args={[0.08, 0.08, coneOffset, 32]} />
            <meshStandardMaterial
              color="#1B2B44"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -coneOffset, 0]}>
            <coneGeometry args={[0.5, 1, 32]} />
            <meshStandardMaterial
              color="#D4AF37"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
        {/* Top Ornament */}
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingScales() {
  // Adjust all scale positions upward to keep them visually balanced and towards the top
  const scales: ScaleOfJusticeProps[] = [
    {
      position: [0, 2.2, 0], // was 1.5
      rotation: [0, 0, 0],
    },
    {
      position: [-7, 3.2, -2], // was 2.5
      rotation: [0, Math.PI / 4, 0],
    },
    {
      position: [7, 1.2, -2], // was 0.5
      rotation: [0, -Math.PI / 4, 0],
    },
  ];

  return (
    <>
      {scales.map((props, i) => (
        <ScaleOfJustice key={i} {...props} />
      ))}
    </>
  );
}

export default function LegalBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <FloatingScales />
      </Canvas>
    </div>
  );
} 