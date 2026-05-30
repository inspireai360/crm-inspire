import { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  pad?: number
  style?: CSSProperties
  className?: string
}

export default function Card({ children, pad = 20, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{ background: 'var(--s1)', borderRadius: 16, boxShadow: 'inset 0 0 0 1px var(--line)', padding: pad, ...style }}
    >
      {children}
    </div>
  )
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-[26px]">
      <div>
        <h1 className="text-[25px] font-[650] tracking-tight">{title}</h1>
        {sub && <p className="text-[14px] mt-[5px]" style={{ color: 'var(--t3)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}
