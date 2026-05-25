"use client";

import { useRef, useMemo, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import type { PortfolioExperienceItem } from "@/services/portfolio/contentLoaders";

/**
 * Distribue `count` points sur une sphère, mais en limitant la latitude à
 * ±Y_RANGE pour garder toutes les cartes dans la frustum de la caméra
 * (sinon les points aux pôles sortent verticalement de l'écran et les
 * cartes correspondantes deviennent invisibles ou clippées).
 *
 * Avec Y_RANGE = 0.55, on couvre une bande équatoriale visible quel que
 * soit le nombre d'expériences, tout en gardant une vraie répartition 3D.
 */
function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  if (count === 0) return [];
  if (count === 1) return [[0, 0, radius]];
  const Y_RANGE = 0.55;
  const positions: [number, number, number][] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const y = Y_RANGE - (i / (count - 1)) * (Y_RANGE * 2);
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = 2 * Math.PI * i / goldenRatio;
    positions.push([
      Math.cos(theta) * radiusAtY * radius,
      y * radius,
      Math.sin(theta) * radiusAtY * radius,
    ]);
  }
  return positions;
}

const GLOBE_RADIUS = 2.4;
const CARD_DISTANCE = 5.2;

function Stars() {
  const geometry = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 800; i++) {
      const r = 15 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos.push(r * Math.sin(phi) * Math.cos(theta));
      pos.push(r * Math.cos(phi));
      pos.push(r * Math.sin(phi) * Math.sin(theta));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.05} color="#5eead4" transparent opacity={0.18} sizeAttenuation />
    </points>
  );
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const dotsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const speed = delta * 0.1;
    if (meshRef.current) meshRef.current.rotation.y += speed;
    if (dotsRef.current) dotsRef.current.rotation.y += speed;
    if (glowRef.current) glowRef.current.rotation.y += speed * 0.4;
  });

  const dotGeometry = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = GLOBE_RADIUS * 1.005;
      pos.push(r * Math.sin(phi) * Math.cos(theta));
      pos.push(r * Math.cos(phi));
      pos.push(r * Math.sin(phi) * Math.sin(theta));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <group>
      {/* Halo atmosphérique extérieur — fait briller le globe sur la page */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.25, 32, 32]} />
        <meshBasicMaterial color="#0f766e" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {/* Wireframe principal teal */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 28, 28]} />
        <meshBasicMaterial color="#14b8a6" wireframe transparent opacity={0.32} />
      </mesh>
      {/* Surface intérieure très translucide — donne du volume sans masquer ce qui est derrière */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 24, 24]} />
        <meshBasicMaterial color="#062a28" transparent opacity={0.55} />
      </mesh>
      {/* Lumières de surface */}
      <points ref={dotsRef} geometry={dotGeometry}>
        <pointsMaterial size={0.028} color="#5eead4" transparent opacity={0.55} sizeAttenuation />
      </points>
    </group>
  );
}

interface CardProps {
  item: PortfolioExperienceItem;
  position: [number, number, number];
  portalRef: RefObject<HTMLElement | null>;
}

function Card({ item, position, portalRef }: CardProps) {
  const len = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
  const d: [number, number, number] = [position[0] / len, position[1] / len, position[2] / len];
  const surfacePos: [number, number, number] = [d[0] * GLOBE_RADIUS, d[1] * GLOBE_RADIUS, d[2] * GLOBE_RADIUS];
  const lineEnd: [number, number, number] = [d[0] * CARD_DISTANCE * 0.9, d[1] * CARD_DISTANCE * 0.9, d[2] * CARD_DISTANCE * 0.9];

  const linePoints: [number, number, number][] = useMemo(() => [
    [surfacePos[0] * 1.1, surfacePos[1] * 1.1, surfacePos[2] * 1.1],
    [lineEnd[0], lineEnd[1], lineEnd[2]],
  ], []);

  return (
    <group>
      <mesh position={surfacePos}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5eead4" />
      </mesh>
      <Line points={linePoints} color="#14b8a6" transparent opacity={0.18} lineWidth={1} />
      <Float speed={1.2 + Math.random() * 0.5} rotationIntensity={0.05} floatIntensity={0.4}>
        <Html
          position={position}
          center
          distanceFactor={12}
          occlude={false}
          portal={portalRef as RefObject<HTMLElement>}
          zIndexRange={[10, 0]}
        >
          <Link
            href={`/experiences/${item.id}`}
            className="globe-card"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="globe-card-dot" aria-hidden="true" />
            <div className="globe-card-body">
              <strong className="globe-card-company">{item.company}</strong>
              <span className="globe-card-role">{item.role}</span>
              <span className="globe-card-period">{item.period}</span>
            </div>
          </Link>
        </Html>
      </Float>
    </group>
  );
}

export function GlobeScene({ experiences }: { experiences: PortfolioExperienceItem[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const positions = useMemo(
    () => fibonacciSphere(experiences.length, CARD_DISTANCE),
    [experiences.length],
  );

  return (
    <section
      ref={sectionRef}
      className="globe-section"
      aria-labelledby="experiences-title"
    >
      <Canvas
        camera={{ position: [0, 0.4, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Stars />
        <Globe />
        {experiences.map((item, i) => (
          <Card key={item.id} item={item} position={positions[i]} portalRef={sectionRef} />
        ))}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.35}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 2 - 0.35}
          maxPolarAngle={Math.PI / 2 + 0.35}
        />
      </Canvas>
    </section>
  );
}
