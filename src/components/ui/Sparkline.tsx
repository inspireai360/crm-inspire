'use client'

import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  w?: number
  h?: number
  color?: string
}

export default function Sparkline({ data, w = 116, h = 38, color = 'var(--accent)' }: SparklineProps) {
  const { line, area, lastPt } = useMemo(() => {
    const min = Math.min(...data), max = Math.max(...data), span = max - min || 1
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 6) - 3] as [number, number])
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
    const area = `${line} L${w} ${h} L0 ${h} Z`
    return { line, area, lastPt: pts[pts.length - 1] }
  }, [data, w, h])

  const gid = useMemo(() => 'sg' + Math.random().toString(36).slice(2, 7), [])

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.8" fill={color} />
    </svg>
  )
}
