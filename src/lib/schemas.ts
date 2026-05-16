import { z } from 'zod'
import { parseCurrency } from './formatters'

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

const parseCurrencySafe = (val: string | number | undefined | null) => {
  if (!val) return 0
  if (typeof val === 'number') return val
  return parseCurrency(String(val)) || 0
}

const currencyToNumber = z.preprocess((val) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseCurrencySafe(val)
  return 0
}, z.number())

export const contractSchema = z
  .object({
    tipo: z.enum(['a_vista', 'financiado']),
    status: z.string().default('pendente'),
    tipo_documento: z.string().optional(),
    tipo_negociacao: z.string().optional(),

    tipo_vendedor: z.enum(['pf', 'pj']).default('pf'),
    tipo_comprador: z.enum(['pf', 'pj']).default('pf'),
    cnpj_vendedor: z.string().optional(),
    cnpj_comprador: z.string().optional(),
    representante_vendedor: z.string().optional(),
    representante_comprador: z.string().optional(),

    clausula_arrependimento: z.boolean().default(false),
    possui_financiamento: z.boolean().default(false),
    uso_fgts: z.boolean().default(false),
    imovel_ocupado: z.boolean().default(false),
    possui_torna: currencyToNumber.optional(),
    vendedor_casado: z.boolean().default(false),
    checklist_compliance: z.record(z.boolean()).optional(),

    regime_bens: z.string().optional(),
    nome_conjuge: z.string().optional(),
    imovel_financiado: z.boolean().default(false),
    imovel_locado: z.boolean().default(false),
    imovel_inventario: z.boolean().default(false),
    possui_onus: z.boolean().default(false),
    valor_fgts: currencyToNumber.optional(),
    parcelas: z.coerce.number().optional(),
    prazo_pagamento: z.string().optional(),
    prazo_desocupacao: z.string().optional(),
    ocupacao_imovel: z.string().optional(),
    pep: z.boolean().default(false),
    procurador: z.boolean().default(false),
    matricula_atualizada: z.boolean().default(false),
    debitos_condominio: z.boolean().default(false),

    nome_vendedor: z.string().min(1, 'Obrigatório'),
    cpf_vendedor: z.string().optional(),
    rg_vendedor: z.string().optional(),
    orgao_emissor_vendedor: z.string().optional(),
    nacionalidade_vendedor: z.string().optional(),
    estado_civil_vendedor: z.string().optional(),
    profissao_vendedor: z.string().optional(),
    endereco_vendedor: z.string().min(1, 'Obrigatório'),
    email_vendedor: z.string().email('Email inválido'),
    telefone_vendedor: z.string().optional(),

    nome_comprador: z.string().min(1, 'Obrigatório'),
    cpf_comprador: z.string().optional(),
    rg_comprador: z.string().optional(),
    orgao_emissor_comprador: z.string().optional(),
    nacionalidade_comprador: z.string().optional(),
    estado_civil_comprador: z.string().optional(),
    profissao_comprador: z.string().optional(),
    endereco_comprador: z.string().min(1, 'Obrigatório'),
    email_comprador: z.string().email('Email inválido'),
    telefone_comprador: z.string().optional(),

    endereco_imovel: z.string().min(1, 'Obrigatório'),
    matricula_imovel: z.string().min(1, 'Obrigatório'),
    rgi_imovel: z.string().min(1, 'Obrigatório'),
    inscricao_municipal: z.string().min(1, 'Obrigatório'),
    area_total: z.coerce.number().min(1, 'Obrigatório'),
    vagas_garagem: z.coerce.number().min(0, 'Obrigatório'),

    valor_sinal: currencyToNumber.refine((v) => v > 0, 'Valor deve ser maior que zero'),
    comissao: currencyToNumber.refine((v) => v > 0, 'Valor deve ser maior que zero'),

    valor_reforco: currencyToNumber.optional(),
    valor_complemento: currencyToNumber.optional(),
    valor_saldo: currencyToNumber.optional(),
    valor_financiado: currencyToNumber.optional(),
    valor_total: currencyToNumber.optional(),
    valor_recursos_proprios: currencyToNumber.optional(),

    instituicao_financeira: z.string().optional(),
    taxa_juros: z.coerce.number().optional(),
    prazo_meses: z.coerce.number().optional(),

    data_liberacao_credito: z.string().optional(),
    data_pagamento_saldo: z.string().optional(),

    vendedor_banco: z.string().optional(),
    vendedor_agencia: z.string().optional(),
    vendedor_conta: z.string().optional(),
    vendedor_pix: z.string().optional(),
    user: z.string().optional(),

    // Advanced fields
    cartorio: z.string().optional(),
    prazo_acordo: z.string().optional(),
    responsavel_comissao: z.string().optional(),
    prazo_escritura: z.string().optional(),
    data_posse: z.string().optional(),
    percentual_multa: z.coerce.number().optional(),
    cidade: z.string().optional(),
    situacao_juridica_imovel: z.string().optional(),
    condicao_suspensiva: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'financiado') {
      const financiado = data.valor_financiado || 0
      if (financiado <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório e deve ser maior que zero',
          path: ['valor_financiado'],
        })
      }
      if (!data.instituicao_financeira) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório',
          path: ['instituicao_financeira'],
        })
      }
    } else {
      const saldo = data.valor_saldo || 0
      if (saldo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório para contratos à vista',
          path: ['valor_saldo'],
        })
      }
    }
  })

export type ContractFormValues = z.infer<typeof contractSchema>

export const profileSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  imobiliaria_nome: z.string().min(1, 'Obrigatório'),
  imobiliaria_documento: z.string().min(1, 'Obrigatório'),
  creci: z.string().min(1, 'Obrigatório'),
  banco_nome: z.string().min(1, 'Obrigatório'),
  agencia: z.string().min(1, 'Obrigatório'),
  conta: z.string().min(1, 'Obrigatório'),
  chave_pix: z.string().min(1, 'Obrigatório'),
  comissao_padrao_percentual: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      return Number(val)
    },
    z.number().min(0, 'Valor mínimo é 0').max(100, 'Valor máximo é 100'),
  ),
  openai_api_key: z.string().optional(),
  anthropic_api_key: z.string().optional(),
  gemini_api_key: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
