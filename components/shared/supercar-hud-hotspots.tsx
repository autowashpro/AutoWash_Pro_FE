"use client"

import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import { Sparkles, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react'

export interface HotspotNodeData {
  id: string
  title: string
  category: string
  position: [number, number, number]
  metrics: { label: string; value: string }[]
  serviceId: number
}

const HOTSPOTS: HotspotNodeData[] = [
  {
    id: 'hood',
    title: 'CERAMIC 9H SHIELD ARMOR',
    category: 'SƠN & PHỦ BẢO VỆ CAPO',
    position: [0, 0.48, -1.0],
    metrics: [
      { label: 'Surface Gloss Meter', value: '98.4 GU (Mirrored)' },
      { label: 'Hydrophobic Angle', value: '115° Repulsion' },
      { label: 'UV Armor Shield', value: '5 Years Warranty' },
    ],
    serviceId: 101,
  },
  {
    id: 'wheel',
    title: 'FORGED RIM & CALIPER ARMOR',
    category: 'MÂM & HỆ THỐNG PHANH',
    position: [0.95, 0.05, -1.35],
    metrics: [
      { label: 'Iron Dust Contamination', value: '0.00% Purified' },
      { label: 'Heat Ceramic Barrier', value: '800°C Thermal Guard' },
      { label: 'Brake Dust Repel', value: 'Active Hydrophobic' },
    ],
    serviceId: 102,
  },
  {
    id: 'cabin',
    title: 'CLIMATE STEAM & LEATHER SPA',
    category: 'KHOANG LÁI & KÍNH TINTED',
    position: [-0.65, 0.58, 0.15],
    metrics: [
      { label: 'Air Bacteria Level', value: '0.0% Sterilized' },
      { label: 'Leather Hydration', value: 'Premium Nappa Conditioner' },
      { label: 'Glass Clarity Index', value: '99.9% Ultra Clear' },
    ],
    serviceId: 103,
  },
]

interface SupercarHudHotspotsProps {
  onSelectPackage: (serviceId: number) => void
  laserZ: number
}

export function SupercarHudHotspots({ onSelectPackage, laserZ }: SupercarHudHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <group>
      {HOTSPOTS.map((node) => {
        const isClean = laserZ >= node.position[2]
        const isActive = activeId === node.id

        return (
          <group key={node.id} position={node.position}>
            {/* Pulsing 3D Sphere Marker */}
            <mesh
              onClick={() => setActiveId(isActive ? null : node.id)}
              onPointerOver={() => setActiveId(node.id)}
              onPointerOut={() => setActiveId(null)}
            >
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={isActive ? '#00f8ff' : isClean ? '#10b981' : '#f59e0b'}
                emissive={isActive ? '#00f8ff' : isClean ? '#10b981' : '#f59e0b'}
                emissiveIntensity={isActive ? 2.5 : 1.2}
              />
            </mesh>

            {/* Outer Ring Animation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.11, 32]} />
              <meshBasicMaterial
                color={isActive ? '#00f8ff' : '#f59e0b'}
                transparent
                opacity={isActive ? 0.9 : 0.4}
                side={2}
              />
            </mesh>

            {/* Compact Double-Bezel Glass Telemetry Card Overlay via <Html> */}
            {isActive && (
              <Html
                position={[0.2, 0.2, 0]}
                distanceFactor={7}
                zIndexRange={[100, 0]}
              >
                <div className="w-64 select-none animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  {/* Outer Bezel Shell */}
                  <div className="rounded-xl p-1 bg-black/85 backdrop-blur-2xl border border-cyan-500/50 shadow-[0_10px_30px_rgba(0,248,255,0.25)]">
                    {/* Inner Core */}
                    <div className="rounded-lg p-3 bg-slate-950/95 border border-white/10 flex flex-col gap-2">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-400 font-semibold">
                            {node.category}
                          </span>
                        </div>
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-xs text-white tracking-tight">
                        {node.title}
                      </h4>

                      {/* Telemetry Metrics */}
                      <div className="space-y-1 bg-black/50 rounded p-2 border border-white/5 font-mono text-[10px]">
                        {node.metrics.map((m, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-400">{m.label}:</span>
                            <span className="font-semibold text-cyan-300">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
