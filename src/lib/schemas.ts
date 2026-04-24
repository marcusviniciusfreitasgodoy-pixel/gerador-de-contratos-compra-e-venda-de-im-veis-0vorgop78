import { z } from 'zod'

export const contractSchema = z.object({
  tipo: z.enum(['a_vista', 'financiado']),
  status: z.string().default('gerado'),

  nome_vendedor: z.string().min(1, 'Obrigatório'),
  cpf_vendedor: z.string().min(14, 'Obrigatório'),
  rg_vendedor: z.string().min(1, 'Obrigatório'),
  orgao_emissor_vendedor: z.string().min(1, 'Obrigatório'),
  nacionalidade_vendedor: z.string().min(1, 'Obrigatório'),
  estado_civil_vendedor: z.string().min(1, 'Obrigatório'),
  profissao_vendedor: z.string().min(1, 'Obrigatório'),
  endereco_vendedor: z.string().min(1, 'Obrigatório'),
  email_vendedor: z.string().email('Email inválido'),
  telefone_vendedor: z.string().min(14, 'Obrigatório'),

  nome_comprador: z.string().min(1, 'Obrigatório'),
  cpf_comprador: z.string().min(14, 'Obrigatório'),
  rg_comprador: z.string().min(1, 'Obrigatório'),
  orgao_emissor_comprador: z.string().min(1, 'Obrigatório'),
  nacionalidade_comprador: z.string().min(1, 'Obrigatório'),
  estado_civil_comprador: z.string().min(1, 'Obrigatório'),
  profissao_comprador: z.string().min(1, 'Obrigatório'),
  endereco_comprador: z.string().min(1, 'Obrigatório'),
  email_comprador: z.string().email('Email inválido'),
  telefone_comprador: z.string().min(14, 'Obrigatório'),

  endereco_imovel: z.string().min(1, 'Obrigatório'),
  matricula_imovel: z.string().min(1, 'Obrigatório'),
  rgi_imovel: z.string().min(1, 'Obrigatório'),
  inscricao_municipal: z.string().min(1, 'Obrigatório'),
  area_total: z.string().min(1, 'Obrigatório'),
  vagas_garagem: z.string().min(1, 'Obrigatório'),

  valor_total: z.string().min(1, 'Obrigatório'),
  valor_sinal: z.string().min(1, 'Obrigatório'),
  comissao: z.string().min(1, 'Obrigatório'),

  valor_reforco: z.string().optional(),
  valor_complemento: z.string().optional(),
  valor_saldo: z.string().optional(),
  valor_financiado: z.string().optional(),

  instituicao_financeira: z.string().optional(),
  taxa_juros: z.string().optional(),
  prazo_meses: z.string().optional(),
  data_liberacao_credito: z.string().optional(),
  data_pagamento_saldo: z.string().optional(),
})

export type ContractFormValues = z.infer<typeof contractSchema>
