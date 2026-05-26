"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { useLocale } from "next-intl";
import { localizedPath } from "@/lib/routing/localizedPath";
import type { PortfolioExperienceItem } from "@/services/portfolio/contentLoaders";

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
      <mesh ref={glowRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.25, 32, 32]} />
        <meshBasicMaterial color="#0f766e" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 28, 28]} />
        <meshBasicMaterial color="#14b8a6" wireframe transparent opacity={0.32} />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 24, 24]} />
        <meshBasicMaterial color="#062a28" transparent opacity={0.55} />
      </mesh>
      <points ref={dotsRef} geometry={dotGeometry}>
        <pointsMaterial size={0.028} color="#5eead4" transparent opacity={0.55} sizeAttenuation />
      </points>
    </group>
  );
}

function Card3D({ item, position }: { item: PortfolioExperienceItem; position: [number, number, number] }) {
  const len = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
  const d: [number, number, number] = [position[0] / len, position[1] / len, position[2] / len];
  const surfacePos: [number, number, number] = [d[0] * GLOBE_RADIUS, d[1] * GLOBE_RADIUS, d[2] * GLOBE_RADIUS];
  const lineEnd: [number, number, number] = [d[0] * CARD_DISTANCE * 0.97, d[1] * CARD_DISTANCE * 0.97, d[2] * CARD_DISTANCE * 0.97];
  const linePoints: [number, number, number][] = useMemo(() => [
    [surfacePos[0] * 1.02, surfacePos[1] * 1.02, surfacePos[2] * 1.02],
    [lineEnd[0], lineEnd[1], lineEnd[2]],
  ], []);

  return (
    <group>
      <mesh position={surfacePos}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5eead4" />
      </mesh>
      <Line points={linePoints} color="#14b8a6" transparent opacity={0.18} lineWidth={1} />
    </group>
  );
}

/* ── Projette les positions 3D en pixels 2D et met à jour le DOM directement ── */
function CardUpdater({ positions }: { positions: [number, number, number][] }) {
  const vec = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const els = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    els.current = positions.map((_, i) => document.querySelector(`[data-card="${i}"]`));
  }, [positions.length]);

  useFrame(({ camera, size }) => {
    const list = els.current;
    camPos.copy(camera.position);
    for (let i = 0; i < positions.length; i++) {
      const el = list[i];
      if (!el) continue;
      vec.set(positions[i][0], positions[i][1], positions[i][2]);
      vec.project(camera);
      if (vec.z > 1) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "";
      const x = (vec.x * 0.5 + 0.5) * size.width;
      const y = (-vec.y * 0.5 + 0.5) * size.height;
      // NOTE: distanceFactor-based scaling is intentionally disabled.
      // Re-scaling every frame based on camera distance caused micro-jitter
      // because the cards were continuously zooming in/out as the orbit
      // changed each card's distance to the camera. The visual improvement
      // from the perspective effect did not justify the loss of smoothness.
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    }
  });

  return null;
}

/* ── Card HTML — rendue HORS du Canvas (plus de conflit R3F) ── */
function CardHtml({ item, index }: { item: PortfolioExperienceItem; index: number }) {
  const locale = useLocale();

  return (
    <div
      data-card={index}
      className="globe-card"
      style={{ position: "absolute", left: 0, top: 0, transform: "translate3d(-9999px, -9999px, 0)" }}
    >
      <Link href={localizedPath(`/experiences/${item.id}`, locale)} onClick={(e) => e.stopPropagation()}>
        <span className="globe-card-dot" aria-hidden="true" />
        <div className="globe-card-body">
          <strong className="globe-card-company">{item.company}</strong>
          <span className="globe-card-role">{item.role}</span>
          <span className="globe-card-period">{item.period}</span>
        </div>
      </Link>
    </div>
  );
}

export function GlobeScene({ experiences }: { experiences: PortfolioExperienceItem[] }) {
  const positions = useMemo(
    () => fibonacciSphere(experiences.length, CARD_DISTANCE),
    [experiences.length],
  );

  return (
    <section className="globe-section" aria-labelledby="experiences-title">
      <Canvas
        camera={{ position: [0, 0.4, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Stars />
        <Globe />
        {experiences.map((item, i) => (
          <Card3D key={item.id} item={item} position={positions[i]} />
        ))}
        <CardUpdater positions={positions} />
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
      <div className="globe-cards-overlay">
        {experiences.map((item, i) => (
          <CardHtml key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
