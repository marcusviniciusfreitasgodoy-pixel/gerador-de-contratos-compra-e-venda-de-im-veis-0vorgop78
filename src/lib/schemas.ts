import { z } from 'zod'
import { parseCurrency } from './formatters'

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

const parseCurrencySafe = (val: string | undefined | null) => {
  if (!val) return 0
  return parseCurrency(val) || 0
}

export const contractSchema = z
  .object({
    tipo: z.enum(['a_vista', 'financiado']),
    status: z.string().default('gerado'),

    nome_vendedor: z.string().min(1, 'Obrigatório'),
    cpf_vendedor: z.string().regex(cpfRegex, 'CPF inválido. Use o formato 000.000.000-00'),
    rg_vendedor: z.string().min(1, 'RG é obrigatório'),
    orgao_emissor_vendedor: z.string().min(1, 'Obrigatório'),
    nacionalidade_vendedor: z.string().min(1, 'Obrigatório'),
    estado_civil_vendedor: z.string().min(1, 'Obrigatório'),
    profissao_vendedor: z.string().min(1, 'Obrigatório'),
    endereco_vendedor: z.string().min(1, 'Obrigatório'),
    email_vendedor: z.string().email('Email inválido'),
    telefone_vendedor: z
      .string()
      .regex(phoneRegex, 'Telefone inválido. Use o formato (00) 00000-0000'),

    nome_comprador: z.string().min(1, 'Obrigatório'),
    cpf_comprador: z.string().regex(cpfRegex, 'CPF inválido. Use o formato 000.000.000-00'),
    rg_comprador: z.string().min(1, 'RG é obrigatório'),
    orgao_emissor_comprador: z.string().min(1, 'Obrigatório'),
    nacionalidade_comprador: z.string().min(1, 'Obrigatório'),
    estado_civil_comprador: z.string().min(1, 'Obrigatório'),
    profissao_comprador: z.string().min(1, 'Obrigatório'),
    endereco_comprador: z.string().min(1, 'Obrigatório'),
    email_comprador: z.string().email('Email inválido'),
    telefone_comprador: z
      .string()
      .regex(phoneRegex, 'Telefone inválido. Use o formato (00) 00000-0000'),

    endereco_imovel: z.string().min(1, 'Obrigatório'),
    matricula_imovel: z.string().min(1, 'Obrigatório'),
    rgi_imovel: z.string().min(1, 'Obrigatório'),
    inscricao_municipal: z.string().min(1, 'Obrigatório'),
    area_total: z.string().min(1, 'Obrigatório'),
    vagas_garagem: z.string().min(1, 'Obrigatório'),

    valor_total: z
      .string()
      .min(1, 'Obrigatório')
      .refine((v) => parseCurrencySafe(v) > 0, 'Valor deve ser maior que zero'),
    vendedor_banco: z.string().optional(),
    vendedor_agencia: z.string().optional(),
    vendedor_conta: z.string().optional(),
    vendedor_pix: z.string().optional(),

    valor_sinal: z
      .string()
      .min(1, 'Obrigatório')
      .refine((v) => parseCurrencySafe(v) > 0, 'Valor deve ser maior que zero'),
    comissao: z
      .string()
      .min(1, 'Obrigatório')
      .refine((v) => parseCurrencySafe(v) > 0, 'Valor deve ser maior que zero'),

    valor_reforco: z.string().optional(),
    valor_complemento: z.string().optional(),
    valor_saldo: z.string().optional(),
    valor_financiado: z.string().optional(),

    instituicao_financeira: z.string().optional(),
    data_pagamento_saldo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const total = parseCurrencySafe(data.valor_total)
    const sinal = parseCurrencySafe(data.valor_sinal)

    if (data.tipo === 'a_vista') {
      const saldo = parseCurrencySafe(data.valor_saldo)
      const reforco = parseCurrencySafe(data.valor_reforco)
      const complemento = parseCurrencySafe(data.valor_complemento)

      if (data.valor_saldo && saldo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_saldo'],
        })
      }
      if (data.valor_reforco && reforco <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_reforco'],
        })
      }
      if (data.valor_complemento && complemento <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_complemento'],
        })
      }

      if (sinal + reforco + complemento + saldo !== total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sinal + Reforço + Complemento + Saldo deve ser igual ao Valor Total',
          path: ['valor_saldo'],
        })
      }

      if (data.data_pagamento_saldo) {
        const [year, month, day] = data.data_pagamento_saldo.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date <= today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Data deve ser no futuro',
            path: ['data_pagamento_saldo'],
          })
        }
      }
    }

    if (data.tipo === 'financiado') {
      const reforco = parseCurrencySafe(data.valor_reforco)
      const complemento = parseCurrencySafe(data.valor_complemento)
      const financiado = parseCurrencySafe(data.valor_financiado)

      if (data.valor_reforco && reforco <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_reforco'],
        })
      }
      if (data.valor_complemento && complemento <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_complemento'],
        })
      }
      if (data.valor_financiado && financiado <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valor deve ser maior que zero',
          path: ['valor_financiado'],
        })
      }

      if (sinal + reforco + complemento + financiado !== total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sinal + Reforço + Complemento + Financiado deve ser igual ao Valor Total',
          path: ['valor_financiado'],
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
  comissao_padrao_percentual: z.coerce
    .number()
    .min(0, 'Valor mínimo é 0')
    .max(100, 'Valor máximo é 100'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
