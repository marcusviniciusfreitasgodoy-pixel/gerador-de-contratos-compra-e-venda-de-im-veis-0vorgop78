import pb from '@/lib/pocketbase/client'

export const updateUserProfile = async (id: string, data: any) => {
  const record = await pb.collection('users').update(id, data)
  if (pb.authStore.record?.id === id) {
    await pb.collection('users').authRefresh()
  }
  return record
}
