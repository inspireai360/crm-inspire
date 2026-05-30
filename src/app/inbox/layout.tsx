import CRMProvider from '@/components/layout/CRMProvider'
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CRMProvider fullHeight>{children}</CRMProvider>
}
