import pb from '@/lib/pocketbase/client'
import type { ContractFormValues } from '@/lib/schemas'

export const createContract = async (data: ContractFormValues) => {
  return await pb.collection('contracts').create({
    ...data,
    user: pb.authStore.record?.id,
  })
}
