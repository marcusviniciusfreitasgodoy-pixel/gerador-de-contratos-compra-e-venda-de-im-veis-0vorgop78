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

export const createContract = async (
  data: ContractFormValues & { used_clauses?: any },
  minutaTexto?: string,
) => {
  const payload = {
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

    data_pagamento_sinal: toPbDate(data.data_pagamento_sinal),
    prazo_escritura: toPbDate(data.prazo_escritura),
    data_posse: toPbDate(data.data_posse),
    entrega_chaves: toPbDate(data.entrega_chaves),
    data_pagamento_comissao: toPbDate(data.data_pagamento_comissao),
  }

  return await pb.collection('contracts').create(payload)
}
