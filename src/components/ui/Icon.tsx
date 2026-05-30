const p = (stroke = 1.6) => ({
  fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
})

const PATHS: Record<string, (s: number) => React.ReactNode> = {
  grid:     s => <><rect x="3" y="3" width="7" height="7" rx="1.5" {...p(s)}/><rect x="14" y="3" width="7" height="7" rx="1.5" {...p(s)}/><rect x="3" y="14" width="7" height="7" rx="1.5" {...p(s)}/><rect x="14" y="14" width="7" height="7" rx="1.5" {...p(s)}/></>,
  people:   s => <><circle cx="9" cy="8" r="3.2" {...p(s)}/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...p(s)}/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19c0-2.2-1-3.8-2.5-4.6" {...p(s)}/></>,
  columns:  s => <><rect x="3" y="4" width="5" height="16" rx="1.5" {...p(s)}/><rect x="9.5" y="4" width="5" height="11" rx="1.5" {...p(s)}/><rect x="16" y="4" width="5" height="14" rx="1.5" {...p(s)}/></>,
  search:   s => <><circle cx="11" cy="11" r="7" {...p(s)}/><path d="m20 20-3.2-3.2" {...p(s)}/></>,
  plus:     s => <><path d="M12 5v14M5 12h14" {...p(s)}/></>,
  bell:     s => <><path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8M9.5 21a2.5 2.5 0 0 0 5 0" {...p(s)}/></>,
  arrowUp:  s => <><path d="M12 19V6M6 11l6-6 6 6" {...p(s)}/></>,
  arrowDn:  s => <><path d="M12 5v13M6 13l6 6 6-6" {...p(s)}/></>,
  chevR:    s => <><path d="m9 6 6 6-6 6" {...p(s)}/></>,
  chevL:    s => <><path d="m15 6-6 6 6 6" {...p(s)}/></>,
  chevD:    s => <><path d="m6 9 6 6 6-6" {...p(s)}/></>,
  sort:     s => <><path d="M8 4v16M8 4 5 7M8 4l3 3M16 20V4M16 20l-3-3M16 20l3-3" {...p(s)}/></>,
  close:    s => <><path d="M6 6l12 12M18 6 6 18" {...p(s)}/></>,
  phone:    s => <><path d="M5 4h3l1.5 4.5L7.5 10a12 12 0 0 0 5.5 5.5l1.5-2L19 15v3a2 2 0 0 1-2.2 2A15 15 0 0 1 4 7.2 2 2 0 0 1 5 4Z" {...p(s)}/></>,
  mail:     s => <><rect x="3" y="5" width="18" height="14" rx="2.5" {...p(s)}/><path d="m4 7 8 6 8-6" {...p(s)}/></>,
  calendar: s => <><rect x="3" y="5" width="18" height="16" rx="2.5" {...p(s)}/><path d="M3 9h18M8 3v4M16 3v4" {...p(s)}/></>,
  note:     s => <><path d="M5 3h10l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...p(s)}/><path d="M14 3v4h4M8 13h8M8 17h5" {...p(s)}/></>,
  deal:     s => <><path d="M12 2v20M17 5.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.8 5 3.3 5 1.4 5 3.4-2.2 3.3-5 3.3-5-1.4-5-3.3" {...p(s)}/></>,
  meeting:  s => <><circle cx="12" cy="13" r="5" {...p(s)}/><path d="M12 8V3M9 3h6" {...p(s)}/></>,
  pin:      s => <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" {...p(s)}/><circle cx="12" cy="10" r="2.6" {...p(s)}/></>,
  spark:    s => <><path d="M13 2 4.5 13H11l-1 9 9-11.5H12l1-8.5Z" {...p(s)}/></>,
  dots:     s => <><circle cx="5" cy="12" r="1.4" {...p(s)}/><circle cx="12" cy="12" r="1.4" {...p(s)}/><circle cx="19" cy="12" r="1.4" {...p(s)}/></>,
  check:    s => <><path d="m5 12 5 5 9-11" {...p(s)}/></>,
  drag:     s => <><circle cx="9" cy="6" r="1.3" {...p(s)}/><circle cx="15" cy="6" r="1.3" {...p(s)}/><circle cx="9" cy="12" r="1.3" {...p(s)}/><circle cx="15" cy="12" r="1.3" {...p(s)}/><circle cx="9" cy="18" r="1.3" {...p(s)}/><circle cx="15" cy="18" r="1.3" {...p(s)}/></>,
  external: s => <><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" {...p(s)}/></>,
  activity: s => <><path d="M3 12h3.4l2.3-7 4.2 14 2.4-7H21" {...p(s)}/></>,
  bars:     s => <><path d="M3 21h18M6 21V12M12 21V5M18 21v-7" {...p(s)}/></>,
  tune:     s => <><circle cx="8" cy="7" r="2.2" {...p(s)}/><path d="M3 7h2.8M10.2 7H21" {...p(s)}/><circle cx="16" cy="17" r="2.2" {...p(s)}/><path d="M3 17h10.8M18.2 17H21" {...p(s)}/></>,
  inbox:    s => <><path d="M3 13h4.5l1.4 2.6h6.2L16.5 13H21" {...p(s)}/><path d="M3 13 5.4 5.3A1.4 1.4 0 0 1 6.7 4.4h10.6a1.4 1.4 0 0 1 1.3.9L21 13v5.2a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 18.2Z" {...p(s)}/></>,
  trash:    s => <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" {...p(s)}/></>,
  edit:     s => <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" {...p(s)}/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" {...p(s)}/></>,
}

interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
  style?: React.CSSProperties
}

export default function Icon({ name, size = 18, stroke = 1.6, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      {PATHS[name]?.(stroke)}
    </svg>
  )
}
