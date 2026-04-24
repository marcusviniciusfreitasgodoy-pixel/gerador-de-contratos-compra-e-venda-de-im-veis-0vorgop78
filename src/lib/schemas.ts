import { z } from 'zod'

export const personSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  cpf: z.string().min(14, 'Obrigatório'),
  rg: z.string().min(1, 'Obrigatório'),
  issuing_body: z.string().min(1, 'Obrigatório'),
  nationality: z.string().min(1, 'Obrigatório'),
  marital_status: z.string().min(1, 'Obrigatório'),
  profession: z.string().min(1, 'Obrigatório'),
  address: z.string().min(1, 'Obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Obrigatório'),
})

const propertySchema = z.object({
  address: z.string().min(1, 'Obrigatório'),
  registration: z.string().min(1, 'Obrigatório'),
  rgi: z.string().min(1, 'Obrigatório'),
  municipal_id: z.string().min(1, 'Obrigatório'),
  area: z.string().min(1, 'Obrigatório'),
  garage: z.string().min(1, 'Obrigatório'),
})

const baseSchema = z.object({
  seller_data: personSchema,
  buyer_data: personSchema,
  property_data: propertySchema,
})

export const contractSchema = z.discriminatedUnion('type', [
  baseSchema.extend({
    type: z.literal('A_VISTA'),
    financial_data: z.object({
      total_value: z.string().min(1, 'Obrigatório'),
      signal_value: z.string().min(1, 'Obrigatório'),
      commission: z.string().min(1, 'Obrigatório'),
      balance_value: z.string().min(1, 'Obrigatório'),
      balance_date: z.string().min(1, 'Obrigatório'),
    }),
  }),
  baseSchema.extend({
    type: z.literal('FINANCIADO'),
    financial_data: z.object({
      total_value: z.string().min(1, 'Obrigatório'),
      signal_value: z.string().min(1, 'Obrigatório'),
      commission: z.string().min(1, 'Obrigatório'),
      reinforcement: z.string().optional(),
      complement: z.string().optional(),
      financed_amount: z.string().min(1, 'Obrigatório'),
    }),
    financing_details: z.object({
      institution: z.string().min(1, 'Obrigatório'),
      interest_rate: z.string().min(1, 'Obrigatório'),
      term: z.string().min(1, 'Obrigatório'),
      release_date: z.string().min(1, 'Obrigatório'),
    }),
  }),
])

export type ContractFormValues = z.infer<typeof contractSchema>
