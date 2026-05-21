import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ContractForm } from '@/components/ContractForm'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { DocumentContext } from '@/contexts/DocumentContext'

export default function NewContract() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user } = useAuth()

  const [tipoDocumento, setTipoDocumento] = useState(() => {
    let tipo = location.state?.tipo_documento || 'ficha_cadastral'
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

  const infoMap: Record<string, { title: string; gender: string }> = {
    ficha_cadastral: { title: 'Ficha Cadastral', gender: 'a' },
    checklist_documental: { title: 'Checklist Documental', gender: 'o' },
    recibo_sinal: { title: 'Recibo de Sinal', gender: 'o' },
    promessa_compra_venda: { title: 'Promessa de Compra e Venda', gender: 'a' },
    contrato_particular: { title: 'Contrato Particular', gender: 'o' },
    termo_entrega_chaves: { title: 'Termo de Entrega de Chaves', gender: 'o' },
    termo_posse: { title: 'Termo de Posse', gender: 'o' },
    declaracoes_complementares: { title: 'Declarações Complementares', gender: 'as' },
    autorizacao_intermediacao: { title: 'Autorização de Intermediação', gender: 'a' },
    distrato: { title: 'Distrato', gender: 'o' },
  }

  const docInfo = infoMap[tipoDocumento] || { title: 'Documento', gender: 'o' }
  const documentName = docInfo.title
  const documentGender = docInfo.gender

  // Ouve a criação do documento via realtime para garantir a notificação de sucesso
  // caso o ContractForm gerencie a submissão internamente sem expor callbacks.
  useRealtime('contracts', (e) => {
    if (e.action === 'create' && user && e.record.user === user.id) {
      const gerado =
        documentGender === 'as' ? 'geradas' : documentGender === 'a' ? 'gerada' : 'gerado'
      toast({
        title: 'Sucesso!',
        description: `${documentName} ${gerado} com sucesso!`,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      })
    }
  })

  return (
    <DocumentContext.Provider value={documentName}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight animate-in fade-in slide-in-from-bottom-2">
            Gerar {documentName}
          </h1>
          <p className="text-slate-600 mt-2 text-lg animate-in fade-in slide-in-from-bottom-3">
            Preencha os dados da negociação abaixo. O sistema estruturará as cláusulas específicas
            baseadas na estratégia escolhida e adicionará automaticamente regras de Compliance
            (LGPD, Assinaturas Digitais).
          </p>
        </div>
        <ContractForm
          tipoDocumento={tipoDocumento}
          onBack={() => navigate('/')}
          documentName={documentName}
          documentGender={documentGender}
        />
      </div>
    </DocumentContext.Provider>
  )
}
