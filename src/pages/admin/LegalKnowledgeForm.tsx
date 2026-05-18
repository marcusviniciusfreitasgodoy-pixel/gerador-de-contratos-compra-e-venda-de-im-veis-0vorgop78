import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getLegalKnowledge,
  createLegalKnowledge,
  updateLegalKnowledge,
} from '@/services/legal_knowledge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function LegalKnowledgeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'legislacao',
    version: 1,
    priority: 1,
    trigger_logic: '',
    code: '',
  })

  useEffect(() => {
    if (id) {
      getLegalKnowledge(id)
        .then((data) => {
          setFormData({
            title: data.title || '',
            content: data.content || '',
            category: data.category || 'legislacao',
            version: data.version || 1,
            priority: data.priority || 1,
            trigger_logic: data.trigger_logic || '',
            code: data.code || '',
          })
        })
        .catch((error) => {
          toast.error('Erro ao carregar registro: ' + error.message)
          navigate('/admin/knowledge')
        })
        .finally(() => setLoading(false))
    }
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEditing && id) {
        await updateLegalKnowledge(id, formData)
        toast.success('Registro atualizado com sucesso')
      } else {
        await createLegalKnowledge(formData)
        toast.success('Registro criado com sucesso')
      }
      navigate('/admin/knowledge')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isEditing ? 'Editar Conhecimento Jurídico' : 'Novo Conhecimento Jurídico'}
          </h1>
          <p className="text-muted-foreground">Preencha os detalhes do registro para a IA.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/knowledge')}>
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legislacao">Legislação</SelectItem>
                <SelectItem value="jurisprudencia">Jurisprudência</SelectItem>
                <SelectItem value="boas_praticas">Boas Práticas</SelectItem>
                <SelectItem value="clausula_fixa">Cláusula Fixa</SelectItem>
                <SelectItem value="clausula_condicional">Cláusula Condicional</SelectItem>
                <SelectItem value="protecao_comercial">Proteção Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código (Identificador Único)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="ex: CL-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Versão</Label>
            <Input
              id="version"
              type="number"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="trigger_logic">Lógica de Acionamento (Opcional)</Label>
            <Input
              id="trigger_logic"
              value={formData.trigger_logic}
              onChange={(e) => setFormData({ ...formData, trigger_logic: e.target.value })}
              placeholder="ex: if tipo_imovel == 'rural'"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="content">Conteúdo (Texto ou Markdown)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              className="min-h-[200px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
