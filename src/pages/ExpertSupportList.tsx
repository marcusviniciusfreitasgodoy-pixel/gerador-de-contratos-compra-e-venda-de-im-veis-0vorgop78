import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, FileText, UserCheck, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getMyExpertRequests, translateStatus, translateObjective } from '@/services/expert'
import { Loader2 } from 'lucide-react'

export default function ExpertSupportList() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyExpertRequests()
      .then((res) => {
        setRequests(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-primary" />
            Suporte Especializado
          </h1>
          <p className="text-slate-500 mt-1">
            Escalone casos complexos para nossa equipe de Escreventes Notariais e Especialistas.
          </p>
        </div>
        <Button asChild className="shrink-0 shadow-sm">
          <Link to="/expert-support/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Minhas Solicitações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p>Nenhuma solicitação encontrada.</p>
              <Button variant="outline" asChild className="mt-4">
                <Link to="/expert-support/new">Criar a primeira</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  to={`/expert-support/${req.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-white">
                        {translateObjective(req.objective)}
                      </Badge>
                      {req.urgency === 'high' && (
                        <Badge variant="destructive" className="text-[10px] px-1.5">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 line-clamp-1">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Criado em{' '}
                        {new Date(req.created).toLocaleDateString()}
                      </span>
                      {req.expand?.contract && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Com anexo de contrato
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:ml-auto">
                    <Badge
                      className={
                        req.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : req.status === 'proposal_issued' || req.status === 'awaiting_decision'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'closed' || req.status === 'refused'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {translateStatus(req.status)}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
