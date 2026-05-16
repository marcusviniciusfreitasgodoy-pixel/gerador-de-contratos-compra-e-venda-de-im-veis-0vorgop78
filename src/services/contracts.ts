import pb from '@/lib/pocketbase/client'
import type { ContractFormValues } from '@/lib/schemas'
import { parseCurrency } from '@/lib/formatters'

const toPbDate = (dateStr?: string | null) => {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toISOString()
  } catch (e) {
    return null
  }
}

export const generateContractDocx = async (data: any) => {
  return await pb.send('/backend/v1/gerar-contrato-docx', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const saveContractDraft = async (
  data: Partial<ContractFormValues>,
  id?: string,
  minutaTexto?: string,
) => {
  const formData = new FormData()

  const safeDate = (val: string | undefined | null) => {
    if (!val) return ''
    return toPbDate(val) || ''
  }

  const payload: Record<string, any> = {
    ...data,
    minuta_texto: minutaTexto,
    user: pb.authStore.record?.id,
    area_total: Number(data.area_total) || 0,
    area_privativa: Number(data.area_privativa) || 0,
    vagas_garagem: Number(data.vagas_garagem) || 0,
    valor_total: parseCurrency(String(data.valor_total || 0)),
    valor_sinal: parseCurrency(String(data.valor_sinal || 0)),
    valor_financiamento: parseCurrency(String(data.valor_financiamento || 0)),
    valor_fgts: parseCurrency(String(data.valor_fgts || 0)),
    valor_recursos_proprios: parseCurrency(String(data.valor_recursos_proprios || 0)),
    valor_parcela: parseCurrency(String(data.valor_parcela || 0)),
    valor_comissao: parseCurrency(String(data.valor_comissao || 0)),
    multa_desocupacao: parseCurrency(String(data.multa_desocupacao || 0)),
    quantidade_parcelas: Number(data.quantidade_parcelas) || 0,
    prazo_financiamento: Number(data.prazo_financiamento) || 0,
    multa_inadimplencia: Number(data.multa_inadimplencia) || 0,
    prazo_desocupacao: Number(data.prazo_desocupacao) || 0,
    percentual_comissao: Number(data.percentual_comissao) || 0,
    data_pagamento_sinal: safeDate(data.data_pagamento_sinal),
    prazo_escritura: safeDate(data.prazo_escritura),
    data_posse: safeDate(data.data_posse),
    entrega_chaves: safeDate(data.entrega_chaves),
    data_pagamento_comissao: safeDate(data.data_pagamento_comissao),
    data_nascimento_comprador: safeDate(data.data_nascimento_comprador),
    data_nascimento_vendedor: safeDate(data.data_nascimento_vendedor),
    data_assinatura: safeDate(data.data_assinatura),
    data_quitacao: safeDate(data.data_quitacao),
  }

  // Add files
  if (data.matricula_file instanceof File) formData.append('matricula_file', data.matricula_file)
  if (data.iptu_file instanceof File) formData.append('iptu_file', data.iptu_file)

  // Omit file fields from payload before iterating
  delete payload.matricula_file
  delete payload.iptu_file

  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (typeof v === 'boolean') {
      formData.append(k, String(v))
    } else if (typeof v === 'object' && !(v instanceof File)) {
      formData.append(k, JSON.stringify(v))
    } else {
      formData.append(k, String(v))
    }
  })

  if (id) {
    return await pb.collection('contracts').update(id, formData)
  }
  return await pb.collection('contracts').create(formData)
}
