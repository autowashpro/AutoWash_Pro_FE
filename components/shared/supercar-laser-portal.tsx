"use client"

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SupercarLaserPortalProps {
  laserZ: number
  ignitionActive?: boolean
}

export function SupercarLaserPortal({ laserZ, ignitionActive = false }: SupercarLaserPortalProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const planeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (ringRef.current && ringRef.current.material instanceof THREE.MeshStandardMaterial) {
      ringRef.current.material.emissiveIntensity = ignitionActive
        ? 3.5
        : Math.sin(time * 8) * 0.5 + 2.0
    }
    if (planeRef.current && planeRef.current.material instanceof THREE.MeshBasicMaterial) {
      planeRef.current.material.opacity = ignitionActive
        ? 0.4
        : Math.sin(time * 12) * 0.1 + 0.25
    }
  })

  // Hide portal if outside car bounds or during climax ignition fade out
  if (laserZ < -2.6 || laserZ > 2.6) return null

  return (
    <group position={[0, 0.3, laserZ]}>
      {/* Outer Hexagonal Scanner Frame Ring */}
      <mesh ref={ringRef}>
        <boxGeometry args={[2.5, 1.4, 0.04]} />
        <meshStandardMaterial
          color="#00f8ff"
          emissive="#00f8ff"
          emissiveIntensity={2.0}
          wireframe
        />
      </mesh>

      {/* Inner Semi-transparent Laser Curtain Plane */}
      <mesh ref={planeRef}>
        <planeGeometry args={[2.46, 1.36]} />
        <meshBasicMaterial
          color="#00f8ff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floor Scanner Glow Bar */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.15]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
