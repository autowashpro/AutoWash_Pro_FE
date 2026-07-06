'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Mercedes-Benz Luxury SUV — downloaded to public/models (high-poly national symbol)
const CAR_GLB_URL = '/models/suv.glb'

// 1. Obsidian Black Car Paint — PBR scientifically calibrated
const CAR_PAINT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#030406'),
  metalness: 0.9,
  roughness: 0.04,
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  reflectivity: 1.0,
  envMapIntensity: 2.2,
})

// 2. Ruby Neon Glass Taillights — authentic glowing rear depth
const TAILLIGHT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#ff0022'),
  emissive: new THREE.Color('#ff0011'),
  emissiveIntensity: 2.2,
  roughness: 0.08,
  clearcoat: 1.0,
  transmission: 0.35,
  thickness: 0.4,
  envMapIntensity: 1.8,
})

// 3. Pure Chrome Mirror — exhaust pipes, Mercedes star badge & emblems
const CHROME_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#ffffff'),
  metalness: 1.0,
  roughness: 0.04,
  clearcoat: 1.0,
  reflectivity: 1.0,
  envMapIntensity: 3.0,
})

// 4. Tinted Privacy Glass — cabin windows
const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#03060a'),
  metalness: 0.0,
  roughness: 0.0,
  transmission: 0.9,
  thickness: 0.5,
  ior: 1.52,
  clearcoat: 1.0,
  clearcoatRoughness: 0.0,
  envMapIntensity: 1.8,
  transparent: true,
  opacity: 0.88,
})

// 5. Forged Alloy Rims
const RIM_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#cbd5e1'),
  metalness: 0.95,
  roughness: 0.08,
  clearcoat: 0.8,
  clearcoatRoughness: 0.05,
  envMapIntensity: 2.0,
})

// 6. Gold Ceramic Brake Calipers
const CALIPER_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#f59e0b'),
  metalness: 0.75,
  roughness: 0.2,
  clearcoat: 0.5,
})

// 7. Aerodynamic Matte Carbon / Diffuser Plastic
const DIFFUSER_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#0e1117'),
  metalness: 0.15,
  roughness: 0.65,
  envMapIntensity: 0.8,
})

// 8. Laser Cyberpunk Turn Signal LEDs
const LED_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#00f8ff',
  emissive: '#00f8ff',
  emissiveIntensity: 2.5,
  toneMapped: false,
})

/* =========================================================================
   ZONE 01: SNOW FOAM SOFT MIST SHROUD (progress < 0.28)
   ========================================================================= */
function SnowFoamShroud({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const foamParticles = useMemo(() => {
    return Array.from({ length: 120 }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 1.5 - 1.2,
        Math.random() * 0.45 + 0.15,
        (Math.random() - 0.5) * 1.4,
      ] as [number, number, number],
      size: Math.random() * 0.016 + 0.006,
      wobbleSpeed: Math.random() * 3 + 1,
    }))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const p = foamParticles[i]
      if (p && child) {
        child.position.y = p.pos[1] + Math.sin(t * p.wobbleSpeed) * 0.02
      }
    })
  })

  const opacity = progress < 0.22 ? 0.95 : progress < 0.28 ? (0.28 - progress) / 0.06 : 0
  if (opacity <= 0) return null

  return (
    <group ref={groupRef}>
      {foamParticles.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.size, 8, 8]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.05}
            transmission={0.95}
            thickness={0.02}
            transparent
            opacity={opacity * 0.75}
          />
        </mesh>
      ))}
      <pointLight position={[-1.2, 0.4, 0]} color="#00f8ff" intensity={opacity * 3.5} distance={2.0} />
    </group>
  )
}

/* =========================================================================
   ZONE 02: HIGH-TECH DIGITAL CALIBRATION SCANNERS (0.22 <= progress < 0.52)
   ========================================================================= */
function RupesPolisherTool({ progress }: { progress: number }) {
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const containerRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (outerRingRef.current) outerRingRef.current.rotation.z = t * 4
    if (innerRingRef.current) innerRingRef.current.rotation.z = -t * 6
    if (containerRef.current) {
      containerRef.current.position.x = -0.75 + Math.sin(t * 2.5) * 0.2
      containerRef.current.position.z = 0.9 + Math.cos(t * 2.5) * 0.15
      containerRef.current.position.y = 0.5 + Math.sin(t * 5) * 0.01
    }
  })

  const opacity =
    progress < 0.22 ? 0 : progress < 0.26 ? (progress - 0.22) / 0.04 : progress < 0.48 ? 1 : progress < 0.52 ? (0.52 - progress) / 0.04 : 0

  if (opacity <= 0) return null

  return (
    <group ref={containerRef} position={[-0.75, 0.5, 0.9]}>
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.18, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={opacity * 0.8} side={2} />
      </mesh>
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.1, 0.12, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={opacity * 0.9} side={2} />
      </mesh>
      <mesh ref={beamRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.3, 16, 1, true]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={opacity * 0.15}
          blending={THREE.AdditiveBlending}
          side={2}
        />
      </mesh>
      <pointLight position={[0, -0.3, 0]} color="#f59e0b" intensity={opacity * 4.5} distance={1.2} />
    </group>
  )
}

/* =========================================================================
   ZONE 03: STEAM SPA MIST & INTERIOR GLOW (0.48 <= progress < 0.78)
   ========================================================================= */
function SteamSpaCloud({ progress }: { progress: number }) {
  const steamRef = useRef<THREE.Group>(null)
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 0.7,
        Math.random() * 0.3 + 0.35,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      size: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 1.5 + 0.5,
    }))
  }, [])

  useFrame((state) => {
    if (!steamRef.current) return
    const t = state.clock.getElapsedTime()
    steamRef.current.children.forEach((child, i) => {
      const p = particles[i]
      if (p && child) {
        child.position.y = p.pos[1] + Math.sin(t * p.speed) * 0.03
      }
    })
  })

  const opacity =
    progress < 0.48 ? 0 : progress < 0.52 ? (progress - 0.48) / 0.04 : progress < 0.74 ? 1 : progress < 0.78 ? (0.78 - progress) / 0.04 : 0

  if (opacity <= 0) return null

  return (
    <group ref={steamRef} position={[0, 0.2, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.size, 12, 12]} />
          <meshBasicMaterial
            color="#fef3c7"
            transparent
            opacity={opacity * 0.18}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0.4, 0]} color="#fbbf24" intensity={opacity * 5} distance={2.5} />
    </group>
  )
}

/* =========================================================================
   ZONE 04: 9H CERAMIC ARMOR SHIELD & CRYSTAL BEADS (progress >= 0.72)
   ========================================================================= */
function HydrophobicArmorShield({ progress }: { progress: number }) {
  const shieldRef = useRef<THREE.Mesh>(null)
  const beads = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      pos: [
        0.8 + Math.random() * 0.8,
        0.35 + Math.random() * 0.2,
        (Math.random() - 0.5) * 1.0,
      ] as [number, number, number],
      size: Math.random() * 0.012 + 0.006,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (shieldRef.current) {
      shieldRef.current.rotation.z = t * 0.3
      shieldRef.current.rotation.y = t * 0.2
    }
  })

  const opacity = progress < 0.72 ? 0 : progress < 0.76 ? (progress - 0.72) / 0.04 : 1
  if (opacity <= 0) return null

  return (
    <group position={[1.1, 0.45, 0]}>
      <mesh ref={shieldRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#ff0022" wireframe transparent opacity={opacity * 0.35} />
      </mesh>
      {beads.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.size, 8, 8]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.98} roughness={0.01} ior={1.33} transparent opacity={opacity} />
        </mesh>
      ))}
      <pointLight position={[0, 0.2, 0]} color="#ff0022" intensity={opacity * 5.5} distance={2.5} />
    </group>
  )
}

interface CarPaintSceneProps {
  ignitionActive?: boolean
  progress?: number
}

export function FullSupercarModel({ ignitionActive = false, progress = 0 }: CarPaintSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(CAR_GLB_URL)

  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      const nameLc = mesh.name.toLowerCase()
      const matName = (
        mesh.material && !Array.isArray(mesh.material)
          ? (mesh.material as THREE.Material).name
          : ''
      ).toLowerCase()

      // Mercedes-Benz Specific Material Map
      if (nameLc.includes('lights_red') || matName.includes('r_lights') || matName.includes('r_glass') || nameLc.includes('tail')) {
        mesh.material = TAILLIGHT_MATERIAL
      } else if (nameLc.includes('chrome') || matName.includes('chrome') || nameLc.includes('exhaust') || matName.includes('silver')) {
        mesh.material = CHROME_MATERIAL
      } else if (nameLc.includes('led') || matName.includes('lights')) {
        mesh.material = LED_MATERIAL
      } else if (nameLc.includes('glass') || matName.includes('glass') || matName.includes('d_glass') || matName.includes('vd_glass')) {
        mesh.material = GLASS_MATERIAL
      } else if (nameLc.includes('rim') || nameLc.includes('wheel') || matName.includes('silver_d')) {
        mesh.material = RIM_MATERIAL
      } else if (nameLc.includes('brake') || nameLc.includes('caliper') || matName.includes('brakes2')) {
        mesh.material = CALIPER_MATERIAL
      } else if (nameLc.includes('tire') || nameLc.includes('tyre') || matName.includes('tire')) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#08080a',
          roughness: 0.9,
          metalness: 0.01,
        })
      } else if (nameLc.includes('plastic') || nameLc.includes('grill') || nameLc.includes('carbon') || matName.includes('black_matt')) {
        mesh.material = DIFFUSER_MATERIAL
      } else if (nameLc.includes('body') || matName.includes('body') || nameLc.includes('paint')) {
        mesh.material = CAR_PAINT_MATERIAL
      } else {
        mesh.material = DIFFUSER_MATERIAL
      }
    })
  }, [scene])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      // Smooth breathing float
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.008 - 0.55
    }

    if (progress < 0.25) {
      CAR_PAINT_MATERIAL.roughness = THREE.MathUtils.lerp(CAR_PAINT_MATERIAL.roughness, 0.2, 0.1)
      GLASS_MATERIAL.opacity = THREE.MathUtils.lerp(GLASS_MATERIAL.opacity, 0.88, 0.1)
    } else if (progress < 0.5) {
      CAR_PAINT_MATERIAL.roughness = THREE.MathUtils.lerp(CAR_PAINT_MATERIAL.roughness, 0.02, 0.1)
      GLASS_MATERIAL.opacity = THREE.MathUtils.lerp(GLASS_MATERIAL.opacity, 0.88, 0.1)
    } else if (progress < 0.75) {
      CAR_PAINT_MATERIAL.roughness = THREE.MathUtils.lerp(CAR_PAINT_MATERIAL.roughness, 0.04, 0.1)
      GLASS_MATERIAL.opacity = THREE.MathUtils.lerp(GLASS_MATERIAL.opacity, 0.32, 0.1)
    } else {
      CAR_PAINT_MATERIAL.roughness = THREE.MathUtils.lerp(CAR_PAINT_MATERIAL.roughness, 0.01, 0.1)
      GLASS_MATERIAL.opacity = THREE.MathUtils.lerp(GLASS_MATERIAL.opacity, 0.88, 0.1)
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.55, 0]} rotation={[0, Math.PI * 0.15, 0]} scale={[0.82, 0.82, 0.82]}>
      {/* 4-Part Visual Transformation Overlays */}
      <SnowFoamShroud progress={progress} />
      <RupesPolisherTool progress={progress} />
      <SteamSpaCloud progress={progress} />
      <HydrophobicArmorShield progress={progress} />

      {/* Realistic Soft Contact Shadows Grounding the Car */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.85}
        scale={7.5}
        blur={2.5}
        far={1.5}
      />

      {/* Polished Concrete Solid Stage Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial
          color="#06080c"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(CAR_GLB_URL)
