'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Deal, STAGE_PROB, fmtMoney } from '@/lib/types'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import { PageHead } from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = useCallback(async () => {
    const sb = createClient()
    const { data } = await sb.from('deals')
      .select('*, contact:contacts(id,name,type,company:companies(name))')
      .order('position')
    setDeals(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const sb = createClient()
    const ch = sb.channel('pipeline-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [load])

  const handleStageChange = async (dealId: string, newStage: string) => {
    // Optimistic update
    setDeals(ds => ds.map(d => d.id === dealId ? { ...d, stage: newStage as any } : d))
    const sb = createClient()
    await sb.from('deals').update({ stage: newStage }).eq('id', dealId)
  }

  const total = deals.reduce((a, d) => a + d.value, 0)
  const weighted = deals.reduce((a, d) => a + d.value * (STAGE_PROB[d.stage] / 100), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="animate-fade-up h-full flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <PageHead
        title="Pipeline"
        sub={`${deals.length} deals · ${fmtMoney(total)} total · ${fmtMoney(weighted)} weighted`}
        right={<span className="text-[12.5px] flex items-center gap-1.5" style={{ color: 'var(--t3)' }}><Icon name="drag" size={15} />Drag cards to move stages</span>}
      />
      <div className="flex-1 min-h-0">
        <KanbanBoard
          deals={deals}
          onStageChange={handleStageChange}
          onOpenContact={id => router.push(`/contacts/${id}`)}
        />
      </div>
    </div>
  )
}
