import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ContractForm } from '@/components/ContractForm'

export default function NewContract() {
  const navigate = useNavigate()
  const location = useLocation()

  const [tipoDocumento, setTipoDocumento] = useState(() => {
    let tipo = location.state?.tipo_documento || 'promessa_compra_venda'
    if (tipo === 'promessa_cv') tipo = 'promessa_compra_venda'
    if (tipo === 'checklist') tipo = 'checklist_documental'
    if (tipo === 'termo_chaves') tipo = 'termo_entrega_chaves'
    if (tipo === 'declaracoes') tipo = 'declaracoes_complementares'
    if (tipo === 'autorizacao') tipo = 'autorizacao_intermediacao'
    return tipo
  })

  useEffect(() => {
    if (location.state?.tipo_documento) {
      let tipo = location.state.tipo_documento
      if (tipo === 'promessa_cv') tipo = 'promessa_compra_venda'
      if (tipo === 'checklist') tipo = 'checklist_documental'
      if (tipo === 'termo_chaves') tipo = 'termo_entrega_chaves'
      if (tipo === 'declaracoes') tipo = 'declaracoes_complementares'
      if (tipo === 'autorizacao') tipo = 'autorizacao_intermediacao'
      setTipoDocumento(tipo)
    }
  }, [location])

  const titleMap: Record<string, string> = {
    ficha_cadastral: 'Ficha Cadastral',
    checklist_documental: 'Checklist Documental',
    recibo_sinal: 'Recibo de Sinal',
    promessa_compra_venda: 'Promessa de Compra e Venda',
    contrato_particular: 'Contrato Particular',
    termo_entrega_chaves: 'Termo de Entrega de Chaves',
    termo_posse: 'Termo de Posse',
    declaracoes_complementares: 'Declarações Complementares',
    autorizacao_intermediacao: 'Autorização de Intermediação',
    distrato: 'Distrato de Contrato',
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Gerar {titleMap[tipoDocumento] || 'Documento'}
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Preencha os dados da negociação abaixo. O sistema estruturará as cláusulas específicas
          baseadas na estratégia escolhida e adicionará automaticamente regras de Compliance (LGPD,
          Assinaturas Digitais).
        </p>
      </div>
      <ContractForm tipoDocumento={tipoDocumento} onBack={() => navigate('/')} />
    </div>
  )
}
