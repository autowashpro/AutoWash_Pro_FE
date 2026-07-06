'use client'

import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { FullSupercarModel } from './full-supercar-model'
import { SupercarHudHotspots } from './supercar-hud-hotspots'

interface CinematicLightingProps {
  ignitionActive?: boolean
  progress?: number
}

/**
 * Cinematic Lighting Rig — 3-point PBR setup as directed:
 *   1. DirectionalLight "Scangrip Strip" — 6500K cold white, overhead
 *   2. RectAreaLight "Rim Fill" — wraps the rear silhouette in warm neon
 *   3. RectAreaLight "Front Accent" — subtle blue cyberpunk rim from front-left
 *   NO random PointLights — every photon is intentional
 */
function CinematicLightingRig({ ignitionActive = false, progress = 0 }: CinematicLightingProps) {
  const rearRimRef = useRef<THREE.RectAreaLight>(null)
  const frontAccentRef = useRef<THREE.RectAreaLight>(null)

  // Fixed pure professional daylight studio lighting to maintain high-end physical realism
  const zoneColor1 = '#ffffff'
  const zoneColor2 = '#e2e8f0'

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (rearRimRef.current) {
      rearRimRef.current.intensity = ignitionActive ? 7.5 + Math.sin(t * 6) * 1.5 : 5.0
    }
    if (frontAccentRef.current) {
      frontAccentRef.current.intensity = ignitionActive ? 5.5 + Math.sin(t * 4) * 1.0 : 3.5
    }
  })

  return (
    <>
      {/* KEY LIGHT: Scangrip daylight white strip overhead */}
      <directionalLight
        position={[0, 5, 1.5]}
        intensity={ignitionActive ? 2.5 : 1.8}
        color={new THREE.Color(0.9, 0.93, 1.0)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* FILL LIGHT: Soft ambient fill */}
      <ambientLight intensity={0.2} color="#0a0d14" />

      {/* RIM LIGHT 1: Dynamic Zone 1 Accent */}
      <rectAreaLight
        ref={rearRimRef}
        position={[0, 1.2, -3.5]}
        rotation={[0, Math.PI, 0]}
        width={4.0}
        height={1.5}
        intensity={5.5}
        color={zoneColor1}
      />

      {/* RIM LIGHT 2: Dynamic Zone 2 Accent */}
      <rectAreaLight
        ref={frontAccentRef}
        position={[-4, 1.5, 2.0]}
        rotation={[0, Math.PI * 0.45, 0]}
        width={2.5}
        height={1.2}
        intensity={4.0}
        color={zoneColor2}
      />
    </>
  )
}

interface SupercarShowroomSceneProps {
  progress: number
  mousePos: { x: number; y: number }
  onSelectPackage?: (serviceId: number) => void
}

function SupercarShowroomScene({ progress, mousePos, onSelectPackage }: SupercarShowroomSceneProps) {
  const groupRef = useRef<THREE.Group>(null)

  const laserZ = progress <= 0.05 ? -2.5 : progress >= 0.85 ? 2.5 : -2.5 + ((progress - 0.05) / 0.8) * 5.0
  const ignitionActive = progress >= 0.85

  useFrame(() => {
    if (!groupRef.current) return

    // Scroll-driven 360° turntable choreography
    const baseRotY = -Math.PI * 0.15 + progress * Math.PI * 1.5
    const targetRotY = baseRotY + (mousePos.x - 0.5) * 0.42
    const targetRotX = Math.sin(progress * Math.PI) * 0.08 + (mousePos.y - 0.5) * 0.12
    const targetPosY = Math.sin(progress * Math.PI * 2) * 0.1
    const targetScale = progress >= 0.88 ? 0.84 : 1.0

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.07)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.07)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.07)
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.07)
  })

  return (
    <>
      {/* HDRI Environment — mandatory for PBR car paint reflections to look real
          Studio preset gives clean, high-contrast reflections like a showroom */}
      <Environment preset="studio" />

      {/* Cinematic 3-point lighting rig dynamic 4-stage color choreography */}
      <CinematicLightingRig ignitionActive={ignitionActive} progress={progress} />

      {/* Main rotating supercar showroom group */}
      <group ref={groupRef} position={[0, -0.05, 0]}>
        <Suspense fallback={null}>
          <FullSupercarModel ignitionActive={ignitionActive} progress={progress} />
        </Suspense>
        <SupercarHudHotspots
          laserZ={laserZ}
          onSelectPackage={(id) => onSelectPackage?.(id)}
        />
      </group>
    </>
  )
}

interface Cinematic3DCanvasProps {
  progress: number
  mousePos: { x: number; y: number }
  onSelectPackage?: (serviceId: number) => void
}

export function Cinematic3DCanvas({ progress, mousePos, onSelectPackage }: Cinematic3DCanvasProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-10">
      <Canvas
        camera={{ position: [0, 0.45, 5.2], fov: 40 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
      >
        <SupercarShowroomScene
          progress={progress}
          mousePos={mousePos}
          onSelectPackage={onSelectPackage}
        />
      </Canvas>
    </div>
  )
}
