'use client'

import { useState } from 'react'
import Card, { PageHead } from '@/components/ui/Card'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} style={{ width: 42, height: 24, borderRadius: 100, background: on ? 'var(--accent)' : 'var(--s3)', position: 'relative', transition: 'background .18s', flexShrink: 0, boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line2)' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .18s cubic-bezier(.3,1.4,.5,1)' }} />
    </button>
  )
}

export default function SettingsPage() {
  const [tg, setTg] = useState({ digest: true, mentions: true, deals: false, weekly: true })
  const set = (k: string) => (v: boolean) => setTg(s => ({ ...s, [k]: v }))

  const field = "w-full px-3.5 py-[10px] rounded-[10px] text-[14px] outline-none transition-shadow"
  const fStyle = { background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }

  const Row = ({ title, desc, k }: { title: string; desc: string; k: string }) => (
    <div className="flex items-center gap-4 py-[14px]" style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="flex-1">
        <div className="text-[13.5px] font-[500]">{title}</div>
        <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{desc}</div>
      </div>
      <Toggle on={(tg as any)[k]} set={set(k)} />
    </div>
  )

  return (
    <div className="animate-fade-up max-w-[760px]">
      <PageHead title="Settings" sub="Manage your profile and preferences" />
      <div className="flex flex-col gap-4">
        <Card pad={24}>
          <h3 className="text-[16px] font-[600] mb-[18px]">Profile</h3>
          <div className="flex items-center gap-4 mb-[22px]">
            <OwnerChip owner="AR" size={56} />
            <div>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>Change photo</button>
              <div className="text-[12px] mt-1.5" style={{ color: 'var(--t4)' }}>PNG or JPG, up to 2MB</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { label: 'Full name', value: 'Ana Reyes' },
              { label: 'Role', value: 'Account Executive' },
              { label: 'Email', value: 'ana@inspire.ai' },
              { label: 'Timezone', value: 'GMT−8 · Pacific' },
            ].map(f => (
              <label key={f.label}>
                <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>{f.label}</div>
                <input defaultValue={f.value} className={field} style={fStyle}
                  onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                  onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
              </label>
            ))}
          </div>
        </Card>

        <Card pad={24}>
          <h3 className="text-[16px] font-[600] mb-1">Notifications</h3>
          <Row title="Daily digest" desc="A morning summary of your pipeline and tasks" k="digest" />
          <Row title="Mentions & replies" desc="When a teammate mentions you or replies" k="mentions" />
          <Row title="Deal stage changes" desc="When any deal you own moves stage" k="deals" />
          <Row title="Weekly report" desc="Monday performance recap by email" k="weekly" />
        </Card>

        <div className="flex justify-end gap-2.5">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[550] transition-all hover:opacity-80"
            style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>Cancel</button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)' }}>
            <Icon name="check" size={15} stroke={2} />Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
