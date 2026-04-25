import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export function IntegrationPanel() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (user?.anthropic_api_key) {
      setApiKey(user.anthropic_api_key)
    }
  }, [user])

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast.error('Informe a chave da API para testar.')
      return
    }
    setIsTesting(true)
    setStatus('idle')
    try {
      await pb.send('/backend/v1/testar_conexao_ia', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      })
      setStatus('success')
      toast.success('Conexão estabelecida com sucesso!')
    } catch (err: any) {
      setStatus('error')
      const msg = err.response?.message || err.message || 'Erro ao validar a chave de API.'
      toast.error(msg)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await pb.collection('users').update(user.id, { anthropic_api_key: apiKey.trim() })
      toast.success('Configurações salvas com sucesso!')
      setIsOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar chave de API.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full"
          title="Painel de Integração"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Configurações de Integração
          </DialogTitle>
          <DialogDescription>
            Configure sua chave da API da Anthropic para habilitar a análise jurídica avançada de
            contratos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">Como obter sua chave:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1 text-blue-700/90">
              <li>
                Acesse o{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Anthropic Console <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Clique em <strong className="font-semibold">"Create Key"</strong>.
              </li>
              <li>Copie a chave gerada garantindo que não haja espaços.</li>
              <li>Cole no campo abaixo.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API (Anthropic)</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {status === 'success' && (
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Conexão estabelecida com sucesso
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center text-sm text-red-600 font-medium">
                  <XCircle className="w-4 h-4 mr-1" /> Falha na conexão
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey}
            >
              {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Testar Conexão
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
