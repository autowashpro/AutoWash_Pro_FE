'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HydrophobicWaterBeadsProps {
  progress: number
  mousePos: { x: number; y: number }
}

const COUNT = 220

export function HydrophobicWaterBeads({ progress, mousePos }: HydrophobicWaterBeadsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Precompute rest positions and scales for beads scattered on the hood surface
  const beads = useMemo(() => {
    const data: Array<{ restX: number; restY: number; restZ: number; currX: number; currY: number; scale: number }> = []
    const dummy = new THREE.Object3D()
    for (let i = 0; i < COUNT; i++) {
      // Scatter within width [-2.5, 2.5] and height [-1.6, 1.6]
      const rx = (Math.random() - 0.5) * 5.0
      const ry = (Math.random() - 0.5) * 3.2
      // Approximate surface Z curvature
      const u = rx / 2.8
      const v = ry / 1.9
      let rz = 0.08
      if (v < 0) rz -= Math.pow(Math.abs(v), 2.2) * 0.75
      rz -= Math.pow(Math.abs(u), 2.4) * 0.45

      const s = 0.015 + Math.random() * 0.035
      data.push({ restX: rx, restY: ry, restZ: rz, currX: rx, currY: ry, scale: s })
    }
    return data
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Convert mouse normalized coordinate to approximate world space X, Y
    const mx = mousePos.x * 3.2
    const my = mousePos.y * 2.2

    // Fade opacity based on progress (visible when ceramic layer is explored or fully merged)
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
    const targetOpacity = progress < 0.2 ? 0.2 : progress > 0.75 ? 0.95 : 0.6
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 3)

    for (let i = 0; i < COUNT; i++) {
      const b = beads[i]
      const dx = b.currX - mx
      const dy = b.currY - my
      const distSq = dx * dx + dy * dy
      const radius = 1.4

      // Lotus leaf hydrophobic repulsion force when mouse passes nearby
      if (distSq < radius * radius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq)
        const force = (1.0 - dist / radius) * 0.8
        b.currX += (dx / dist) * force * delta * 8
        b.currY += (dy / dist) * force * delta * 8
      } else {
        // Spring back gently towards rest position
        b.currX = THREE.MathUtils.lerp(b.currX, b.restX, delta * 3)
        b.currY = THREE.MathUtils.lerp(b.currY, b.restY, delta * 3)
      }

      dummy.position.set(b.currX, b.currY, b.restZ)
      // Slight scale pulsation simulating surface tension
      const tensionScale = b.scale * (1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.1)
      dummy.scale.set(tensionScale, tensionScale, tensionScale * 0.6)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 12]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.95}
        opacity={0.8}
        transparent
        roughness={0.02}
        ior={1.333}
        thickness={0.5}
        specularIntensity={1.0}
      />
    </instancedMesh>
  )
}
