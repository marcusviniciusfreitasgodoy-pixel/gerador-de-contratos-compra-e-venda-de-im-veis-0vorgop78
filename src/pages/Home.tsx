import { useState } from 'react'
import { ContractTypeSelector } from '@/components/ContractTypeSelector'
import { ContractForm } from '@/components/ContractForm'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const [contractType, setContractType] = useState<'A_VISTA' | 'FINANCIADO' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = (type: 'A_VISTA' | 'FINANCIADO') => {
    setIsLoading(true)
    setTimeout(() => {
      setContractType(type)
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">
          Gerador de Contratos
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
          Preencha os dados estruturados e gere minutas profissionais e validadas em poucos
          segundos.
        </p>
      </div>

      {isLoading ? (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
          <Skeleton className="h-[90px] w-full rounded-xl bg-slate-200" />
          <Skeleton className="h-[450px] w-full rounded-xl bg-slate-200" />
          <Skeleton className="h-[450px] w-full rounded-xl bg-slate-200" />
        </div>
      ) : !contractType ? (
        <ContractTypeSelector onSelect={handleSelect} />
      ) : (
        <ContractForm type={contractType} onBack={() => setContractType(null)} />
      )}
    </div>
  )
}
