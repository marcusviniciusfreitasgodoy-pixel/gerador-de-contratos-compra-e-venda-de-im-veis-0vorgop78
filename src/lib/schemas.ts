import { z } from 'zod'
import { parseCurrency } from './formatters'

export const parseCurrencySafe = (val: string | number | undefined | null) => {
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
    status: z.string().default('em_elaboracao'),
    tipo_documento: z.string().optional(),
    user: z.string().optional(),

    id: z.string().optional(),
    // Parties - Comprador
    tipo_comprador: z.enum(['pf', 'pj']).default('pf'),
    nome_comprador: z.string().min(1, 'Obrigatório'),
    cpf_comprador: z.string().optional(),
    rg_comprador: z.string().optional(),
    orgao_emissor_comprador: z.string().optional(),
    data_nascimento_comprador: z.string().optional(),
    nacionalidade_comprador: z.string().optional(),
    profissao_comprador: z.string().optional(),
    estado_civil_comprador: z.string().optional(),
    regime_bens_comprador: z.string().optional(),
    email_comprador: z.union([z.literal(''), z.string().email('E-mail inválido')]).optional(),
    telefone_comprador: z.string().optional(),
    endereco_comprador: z.string().optional(),
    cep_comprador: z.string().optional(),
    nome_conjuge_comprador: z.string().optional(),
    cpf_conjuge_comprador: z.string().optional(),
    rg_conjuge_comprador: z.string().optional(),
    possui_procurador_comprador: z.boolean().default(false),
    nome_procurador_comprador: z.string().optional(),
    cpf_procurador_comprador: z.string().optional(),
    instrumento_procurador_comprador: z.string().optional(),
    financiamento_comprador: z.boolean().default(false),
    fgts_comprador: z.boolean().default(false),

    // Parties - Vendedor
    vendedor_pj: z.boolean().default(false),
    nome_vendedor: z.string().min(1, 'Obrigatório'),
    cpf_vendedor: z.string().optional(),
    rg_vendedor: z.string().optional(),
    orgao_emissor_vendedor: z.string().optional(),
    data_nascimento_vendedor: z.string().optional(),
    estado_civil_vendedor: z.string().optional(),
    regime_bens_vendedor: z.string().optional(),
    conjuge_vendedor: z.string().optional(),
    cpf_conjuge_vendedor: z.string().optional(),
    rg_conjuge_vendedor: z.string().optional(),
    procurador_vendedor: z.boolean().default(false),
    nome_procurador_vendedor: z.string().optional(),
    cpf_procurador_vendedor: z.string().optional(),
    instrumento_procurador_vendedor: z.string().optional(),
    endereco_vendedor: z.string().optional(),
    cep_vendedor: z.string().optional(),
    email_vendedor: z.union([z.literal(''), z.string().email('E-mail inválido')]).optional(),
    telefone_vendedor: z.string().optional(),
    cnpj_vendedor: z.string().optional(),
    cnpj_comprador: z.string().optional(),
    representante_vendedor: z.string().optional(),
    representante_comprador: z.string().optional(),

    havera_parcelas: z.boolean().default(false),
    numero_processo_inventario: z.string().optional(),
    inventariante: z.string().optional(),
    alvara_inventario: z.string().optional(),
    detalhes_locacao: z.string().optional(),
    prazo_locacao: z.string().optional(),
    preferencia_locatario: z.boolean().default(false),
    matricula_file: z.any().optional(),
    iptu_file: z.any().optional(),

    // Property
    endereco_imovel: z.string().min(1, 'Obrigatório'),
    numero_imovel: z.string().optional(),
    complemento_imovel: z.string().optional(),
    bairro_imovel: z.string().optional(),
    cidade_imovel: z.string().optional(),
    estado_imovel: z.string().optional(),
    cep_imovel: z.string().optional(),
    matricula_imovel: z.string().optional(),
    data_matricula: z.string().optional(),
    cartorio_imovel: z.string().optional(),
    inscricao_iptu: z.string().optional(),
    area_privativa: z.coerce.number().optional(),
    area_total: z.coerce.number().optional(),
    vagas_garagem: z.coerce.number().optional(),
    quartos: z.coerce.number().optional(),
    suites: z.coerce.number().optional(),
    possui_box: z.boolean().default(false),
    tipo_imovel: z.string().optional(),
    imovel_ocupado: z.boolean().default(false),
    imovel_locado: z.boolean().default(false),
    imovel_financiado: z.boolean().default(false),
    imovel_inventario: z.boolean().default(false),
    possui_onus: z.boolean().default(false),
    possui_usufruto: z.boolean().default(false),
    acoes_judiciais: z.boolean().default(false),

    // Financial & Possession
    valor_total: currencyToNumber.optional(),
    valor_sinal: currencyToNumber.optional(),
    valor_financiamento: currencyToNumber.optional(),
    instituicao_financeira: z.string().optional(),
    valor_fgts: currencyToNumber.optional(),
    valor_recursos_proprios: currencyToNumber.optional(),
    quantidade_parcelas: z.coerce.number().optional(),
    valor_parcela: currencyToNumber.optional(),
    data_pagamento_sinal: z.string().optional(),
    prazo_escritura: z.string().optional(),
    prazo_financiamento: z.coerce.number().optional(),
    prazo_aprovacao: z.coerce.number().optional(),
    renda_declarada_comprador: currencyToNumber.optional(),
    multa_inadimplencia: z.coerce.number().optional(),
    posse_imediata: z.boolean().default(false),
    data_posse: z.string().optional(),
    prazo_desocupacao: z.coerce.number().optional(),
    multa_desocupacao: currencyToNumber.optional(),
    entrega_chaves: z.string().optional(),
    data_assinatura: z.string().optional(),
    data_quitacao: z.string().optional(),
    vistoria_obrigatoria: z.boolean().default(false),

    valor_condominio: currencyToNumber.optional(),
    valor_iptu_anual: currencyToNumber.optional(),
    valor_avaliacao: currencyToNumber.optional(),

    // Legal & Commission
    percentual_comissao: z.coerce.number().optional(),
    valor_comissao: currencyToNumber.optional(),
    responsavel_comissao: z.string().optional(),
    data_pagamento_comissao: z.string().optional(),
    comissao_garantida: z.boolean().default(false),
    assinatura_eletronica: z.boolean().default(false),
    plataforma_assinatura: z.string().optional(),
    clausula_lgpd: z.boolean().default(false),
    foro_comarca: z.string().optional(),
    arbitragem: z.boolean().default(false),
    mediacao: z.boolean().default(false),

    checklist_compliance: z.record(z.boolean()).optional(),
  })
  .superRefine((data, ctx) => {
    const isFinanciado =
      data.financiamento_comprador ||
      data.possui_financiamento ||
      (data as any).tipo_negociacao === 'financiamento'
    if (isFinanciado && (!data.valor_financiamento || data.valor_financiamento <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['valor_financiamento'],
        message: 'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento',
      })
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
