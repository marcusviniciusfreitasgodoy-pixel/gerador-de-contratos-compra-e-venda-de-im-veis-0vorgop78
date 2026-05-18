import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getLegalKnowledgeList,
  deleteLegalKnowledge,
  type LegalKnowledge,
} from '@/services/legal_knowledge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function LegalKnowledgeList() {
  const [items, setItems] = useState<LegalKnowledge[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getLegalKnowledgeList()
      setItems(data)
    } catch (error: any) {
      toast.error('Erro ao carregar registros: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return
    try {
      await deleteLegalKnowledge(id)
      toast.success('Registro excluído com sucesso')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const categoryMap: Record<string, string> = {
    legislacao: 'Legislação',
    jurisprudencia: 'Jurisprudência',
    boas_praticas: 'Boas Práticas',
    clausula_fixa: 'Cláusula Fixa',
    clausula_condicional: 'Cláusula Condicional',
    protecao_comercial: 'Proteção Comercial',
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Base de Conhecimento Jurídico</h1>
          <p className="text-muted-foreground">Gerencie o acervo jurídico da IA.</p>
        </div>
        <Button asChild>
          <Link to="/admin/knowledge/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[300px] truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoryMap[item.category] || item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.code || '-'}</TableCell>
                  <TableCell>{item.priority ?? '-'}</TableCell>
                  <TableCell>{item.version ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/knowledge/${item.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
