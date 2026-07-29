'use client'

import React, { useEffect, useRef } from 'react'

interface BlockSlice {
  x: number
  y: number
  w: number
  h: number
  offsetX: number
  targetOffsetX: number
}

export function GiantGlitchFooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 350
    let blocks: BlockSlice[] = []

    const blockWidth = 24 // 24px wide rectangular blocks
    const blockHeight = 20 // 20px tall rectangular blocks for 350px canvas

    let mouseX = -1000
    let mouseY = -1000
    let prevMouseX = -1000
    let mouseVx = 0

    const resize = () => {
      width = container.clientWidth || window.innerWidth
      height = 350 // Fixed 350px height

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.scale(dpr, dpr)

      // Create 2D grid of discrete rectangular blocks
      blocks = []
      const cols = Math.ceil(width / blockWidth)
      const rows = Math.ceil(height / blockHeight)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          blocks.push({
            x: c * blockWidth,
            y: r * blockHeight,
            w: blockWidth,
            h: blockHeight,
            offsetX: 0,
            targetOffsetX: 0,
          })
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const currentMouseX = e.clientX - rect.left
      const currentMouseY = e.clientY - rect.top

      if (prevMouseX !== -1000) {
        mouseVx = currentMouseX - prevMouseX
      }

      mouseX = currentMouseX
      mouseY = currentMouseY
      prevMouseX = currentMouseX

      // Flat Ellipse Scope around mouse (radiusX = 160, radiusY = 60)
      const radiusX = 160
      const radiusY = 60

      blocks.forEach((b) => {
        const cx = b.x + b.w / 2
        const cy = b.y + b.h / 2

        const dx = (cx - mouseX) / radiusX
        const dy = (cy - mouseY) / radiusY
        const normDist = Math.sqrt(dx * dx + dy * dy)

        if (normDist < 1.0) {
          const intensity = Math.cos(normDist * (Math.PI / 2))
          const pushForce = mouseVx * intensity * 2.4 + (Math.random() - 0.5) * 20 * intensity
          b.targetOffsetX += pushForce
        }
      })
    }

    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
      prevMouseX = -1000
      mouseVx = 0
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Offscreen canvas for pristine text rendering
    const textCanvas = document.createElement('canvas')
    const textCtx = textCanvas.getContext('2d')

    const render = () => {
      if (!textCtx) return

      textCanvas.width = width
      textCanvas.height = height

      // Background: Aerowash Primary Blue #1470af
      textCtx.fillStyle = '#1470af'
      textCtx.fillRect(0, 0, width, height)

      // Fit giant text "AUTOWASH PRO" 100% fully inside canvas bounds with safety margins
      const text1 = 'AUTOWASH'
      const text2 = 'PRO'

      // Calculate font size to fit ALL 12 characters cleanly without left/right overflow
      const fontSizeByWidth = (width * 0.94) / 8.2
      const fontSizeByHeight = height * 0.86
      const fontSize = Math.min(fontSizeByWidth, fontSizeByHeight)

      textCtx.font = `900 ${fontSize}px "Plus Jakarta Sans", sans-serif`
      textCtx.textBaseline = 'middle'

      // Measure text widths for exact side-by-side centering
      const w1 = textCtx.measureText(text1).width
      const wSpace = textCtx.measureText(' ').width
      const w2 = textCtx.measureText(text2).width
      const totalWidth = w1 + wSpace + w2

      const startX = (width - totalWidth) / 2
      const centerY = height / 2 + 8

      // 1. Draw "AUTOWASH" in Pure White (#ffffff)
      textCtx.fillStyle = '#ffffff'
      textCtx.textAlign = 'left'
      textCtx.fillText(text1, startX, centerY)

      // 2. Draw "PRO" in Dark Metallic Silver-Gray (#374151) with zero blue tint
      textCtx.fillStyle = '#374151'
      textCtx.fillText(text2, startX + w1 + wSpace, centerY)

      // Clear main canvas with #1470af
      ctx.fillStyle = '#1470af'
      ctx.fillRect(0, 0, width, height)

      // Draw displaced 2D rectangular blocks onto main canvas
      blocks.forEach((b) => {
        b.offsetX += (b.targetOffsetX - b.offsetX) * 0.22
        b.targetOffsetX *= 0.85

        const sx = b.x
        const sy = b.y
        const sw = b.w
        const sh = b.h

        const dx = Math.round(b.x + b.offsetX)
        const dy = b.y
        const dw = b.w
        const dh = b.h

        ctx.drawImage(textCanvas, sx, sy, sw, sh, dx, dy, dw, dh)
      })

      mouseVx *= 0.85

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height: '350px', minHeight: '350px', maxHeight: '350px' }}
      className="relative w-full overflow-hidden select-none cursor-default bg-[#1470af] shrink-0"
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-default" />
    </div>
  )
}
