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

export const createContract = async (data: ContractFormValues, minutaTexto?: string) => {
  const payload = {
    ...data,
    minuta_texto: minutaTexto,
    user: pb.authStore.record?.id,
    area_total: Number(data.area_total) || 0,
    vagas_garagem: Number(data.vagas_garagem) || 0,
    valor_total: parseCurrency(data.valor_total),
    valor_sinal: parseCurrency(data.valor_sinal),
    valor_reforco: parseCurrency(data.valor_reforco),
    valor_complemento: parseCurrency(data.valor_complemento),
    valor_saldo: parseCurrency(data.valor_saldo),
    valor_financiado: parseCurrency(data.valor_financiado),
    valor_recursos_proprios: parseCurrency(data.valor_recursos_proprios),
    comissao: parseCurrency(data.comissao),
    taxa_juros: Number(data.taxa_juros) || 0,
    prazo_meses: Number(data.prazo_meses) || 0,
    percentual_multa: Number(data.percentual_multa) || 0,
    instituicao_financeira: data.instituicao_financeira,
    data_liberacao_credito: toPbDate(data.data_liberacao_credito),
    data_pagamento_saldo: toPbDate(data.data_pagamento_saldo),
    prazo_escritura: toPbDate(data.prazo_escritura),
    data_posse: toPbDate(data.data_posse),
    vendedor_banco: data.vendedor_banco,
    vendedor_agencia: data.vendedor_agencia,
    vendedor_conta: data.vendedor_conta,
    vendedor_pix: data.vendedor_pix,
    tipo_vendedor: data.tipo_vendedor,
    tipo_comprador: data.tipo_comprador,
    cnpj_vendedor: data.cnpj_vendedor,
    cnpj_comprador: data.cnpj_comprador,
    representante_vendedor: data.representante_vendedor,
    representante_comprador: data.representante_comprador,
    clausula_arrependimento: data.clausula_arrependimento,
    possui_financiamento: data.possui_financiamento,
    uso_fgts: data.uso_fgts,
    imovel_ocupado: data.imovel_ocupado,
    possui_torna: data.possui_torna,
    vendedor_casado: data.vendedor_casado,
    checklist_compliance: data.checklist_compliance,
    regime_bens: data.regime_bens,
    nome_conjuge: data.nome_conjuge,
    imovel_financiado: data.imovel_financiado,
    imovel_locado: data.imovel_locado,
    imovel_inventario: data.imovel_inventario,
    possui_onus: data.possui_onus,
    valor_fgts: data.valor_fgts,
    parcelas: data.parcelas,
    prazo_pagamento: data.prazo_pagamento,
    prazo_desocupacao: data.prazo_desocupacao,
    ocupacao_imovel: data.ocupacao_imovel,
    pep: data.pep,
    procurador: data.procurador,
    matricula_atualizada: data.matricula_atualizada,
    debitos_condominio: data.debitos_condominio,
  }

  return await pb.collection('contracts').create(payload)
}
