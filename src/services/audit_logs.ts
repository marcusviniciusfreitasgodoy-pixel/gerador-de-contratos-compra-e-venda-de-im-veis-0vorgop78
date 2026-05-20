import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  user: string
  knowledge_item: string
  action: string
  changes: Record<string, any>
  created: string
  updated: string
  expand?: {
    user?: {
      name: string
      email: string
    }
  }
}

export const getKnowledgeAuditLogs = (knowledgeItemId: string) =>
  pb.collection('knowledge_audit_logs').getFullList<AuditLog>({
    filter: `knowledge_item = '${knowledgeItemId}'`,
    sort: '-created',
    expand: 'user',
  })
