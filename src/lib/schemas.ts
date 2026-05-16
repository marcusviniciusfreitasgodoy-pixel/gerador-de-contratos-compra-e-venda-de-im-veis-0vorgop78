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

    nome_vendedor: z.string().min(1, 'Obrigatório'),
    cpf_vendedor: z.string().regex(cpfRegex, 'CPF inválido. Use o formato 000.000.000-00'),
    rg_vendedor: z.string().min(1, 'Obrigatório'),
    orgao_emissor_vendedor: z.string().min(1, 'Obrigatório'),
    nacionalidade_vendedor: z.string().min(1, 'Obrigatório'),
    estado_civil_vendedor: z.string().min(1, 'Obrigatório'),
    profissao_vendedor: z.string().min(1, 'Obrigatório'),
    endereco_vendedor: z.string().min(1, 'Obrigatório'),
    email_vendedor: z.string().email('Email inválido'),
    telefone_vendedor: z.string().regex(phoneRegex, 'Telefone inválido'),

    nome_comprador: z.string().min(1, 'Obrigatório'),
    cpf_comprador: z.string().regex(cpfRegex, 'CPF inválido. Use o formato 000.000.000-00'),
    rg_comprador: z.string().min(1, 'Obrigatório'),
    orgao_emissor_comprador: z.string().min(1, 'Obrigatório'),
    nacionalidade_comprador: z.string().min(1, 'Obrigatório'),
    estado_civil_comprador: z.string().min(1, 'Obrigatório'),
    profissao_comprador: z.string().min(1, 'Obrigatório'),
    endereco_comprador: z.string().min(1, 'Obrigatório'),
    email_comprador: z.string().email('Email inválido'),
    telefone_comprador: z.string().regex(phoneRegex, 'Telefone inválido'),

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
