import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getExpertRequests,
  updateExpertRequest,
  createExpertProposal,
  translateStatus,
  translateObjective,
} from '@/services/expert'
import { toast } from 'sonner'
import { Loader2, Briefcase, FileText, ChevronRight, Eye, Send } from 'lucide-react'

export default function ExpertDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState<any>(null)
  const [proposalModal, setProposalModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [proposalForm, setProposalForm] = useState({
    scope: '',
    deadline_days: '',
    value: '',
    complexity_type: 'standard',
  })

  const loadRequests = async () => {
    try {
      const res = await getExpertRequests()
      setRequests(res)
    } catch (err) {
      toast.error('Erro ao carregar solicitações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    try {
      await updateExpertRequest(reqId, { status: newStatus })
      toast.success('Status atualizado')
      loadRequests()
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleSendProposal = async () => {
    if (!proposalForm.scope || !proposalForm.deadline_days || !proposalForm.value) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setActionLoading(true)
    try {
      await createExpertProposal({
        request: selectedReq.id,
        scope: proposalForm.scope,
        deadline_days: Number(proposalForm.deadline_days),
        value: Number(proposalForm.value.replace(/\D/g, '')),
        complexity_type: proposalForm.complexity_type,
        user_response: 'none',
      })
      await updateExpertRequest(selectedReq.id, { status: 'proposal_issued' })
      toast.success('Proposta enviada com sucesso!')
      setProposalModal(false)
      loadRequests()
    } catch (err) {
      toast.error('Erro ao enviar proposta')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-primary" />
          Painel do Especialista (Admin)
        </h1>
        <p className="text-slate-500 mt-1">Gerencie fila de solicitações e envie propostas.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Fila de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhuma solicitação no momento.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-white">
                        {translateObjective(req.objective)}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-600">
                        ID: {req.id.slice(0, 6)}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800">
                      {req.expand?.user?.name || req.expand?.user?.email}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-1">{req.description}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:ml-auto shrink-0">
                    <Select value={req.status} onValueChange={(v) => handleStatusChange(req.id, v)}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Recebido</SelectItem>
                        <SelectItem value="screening">Em Triagem</SelectItem>
                        <SelectItem value="analyzing">Em Análise</SelectItem>
                        <SelectItem value="proposal_issued">Proposta Emitida</SelectItem>
                        <SelectItem value="reformulating">Em Reformulação</SelectItem>
                        <SelectItem value="executing">Em Execução</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="closed">Encerrado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReq(req)
                        setProposalModal(true)
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" /> Propor
                    </Button>
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={`/expert-support/${req.id}`}>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={proposalModal} onOpenChange={setProposalModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Emitir Proposta Especializada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReq && (
              <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 mb-2">
                Solicitação: <strong>{selectedReq.id.slice(0, 6)}</strong> -{' '}
                {translateObjective(selectedReq.objective)}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Escopo do Serviço</label>
              <Textarea
                placeholder="Descreva o que será feito..."
                rows={4}
                value={proposalForm.scope}
                onChange={(e) => setProposalForm({ ...proposalForm, scope: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prazo (Dias Úteis)</label>
                <Input
                  type="number"
                  value={proposalForm.deadline_days}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, deadline_days: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$)</label>
                <Input
                  placeholder="Ex: 50000"
                  value={proposalForm.value}
                  onChange={(e) => setProposalForm({ ...proposalForm, value: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Complexidade</label>
              <Select
                value={proposalForm.complexity_type}
                onValueChange={(v) => setProposalForm({ ...proposalForm, complexity_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padronizada</SelectItem>
                  <SelectItem value="adjusted">Ajustada</SelectItem>
                  <SelectItem value="personalized">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProposalModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendProposal} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
