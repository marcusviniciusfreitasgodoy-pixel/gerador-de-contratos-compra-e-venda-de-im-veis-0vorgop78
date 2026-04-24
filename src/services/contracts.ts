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

export const createContract = async (data: ContractFormValues) => {
  const payload = {
    ...data,
    user: pb.authStore.record?.id,
    area_total: Number(data.area_total) || 0,
    vagas_garagem: Number(data.vagas_garagem) || 0,
    valor_total: parseCurrency(data.valor_total),
    valor_sinal: parseCurrency(data.valor_sinal),
    valor_reforco: parseCurrency(data.valor_reforco),
    valor_complemento: parseCurrency(data.valor_complemento),
    valor_saldo: parseCurrency(data.valor_saldo),
    valor_financiado: parseCurrency(data.valor_financiado),
    comissao: parseCurrency(data.comissao),
    data_pagamento_saldo: toPbDate(data.data_pagamento_saldo),
  }

  return await pb.collection('contracts').create(payload)
}
