import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ContractForm } from '@/components/ContractForm'

export default function NewContract() {
  const navigate = useNavigate()
  const location = useLocation()

  const [type, setType] = useState<'a_vista' | 'financiado'>('a_vista')

  useEffect(() => {
    if (location.state?.type) {
      setType(location.state.type)
    }
  }, [location])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Novo Contrato</h1>
        <p className="text-slate-600">
          Preencha os dados para gerar a minuta do contrato de compra e venda.
        </p>
      </div>
      <ContractForm type={type} onBack={() => navigate('/')} />
    </div>
  )
}
