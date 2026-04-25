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
import { Settings, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'
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
    if (user?.gemini_api_key) {
      setApiKey(user.gemini_api_key)
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
      toast.success('Conexão bem-sucedida! Sua chave está pronta para uso.')
    } catch (err: any) {
      setStatus('error')
      const msg = err.response?.message || err.message || 'Chave de API inválida.'
      toast.error(msg)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await pb.collection('users').update(user.id, { gemini_api_key: apiKey.trim() })
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
            Configure sua chave da API do Gemini para habilitar a análise jurídica avançada de
            contratos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API (Gemini)</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
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
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Conectado
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center text-sm text-red-600">
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
            disabled={isSaving}
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
