import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/use-auth'
import { updateUserProfile } from '@/services/users'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
  })
  const [testingProvider, setTestingProvider] = useState<string | null>(null)

  const [isSavingBranding, setIsSavingBranding] = useState(false)
  const [brandingData, setBrandingData] = useState({
    header_content: user?.header_content || '',
    footer_content: user?.footer_content || '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setIsSavingBranding(true)
    try {
      const formData = new FormData()
      formData.append('header_content', brandingData.header_content)
      formData.append('footer_content', brandingData.footer_content)
      if (logoFile) {
        formData.append('imobiliaria_logo', logoFile)
      }
      await pb.collection('users').update(user.id, formData)
      toast.success('Configurações de marca atualizadas!')
    } catch (err) {
      toast.error('Erro ao atualizar marca.')
    } finally {
      setIsSavingBranding(false)
    }
  }

  const handleTestConnection = async (provider: string, key: string) => {
    if (!key) return
    setTestingProvider(provider)
    try {
      await pb.send('/backend/v1/testar_conexao_ia', {
        method: 'POST',
        body: JSON.stringify({ apiKey: key, provider }),
      })
      toast.success('Chave validada com sucesso!')
    } catch (err: any) {
      const msg =
        err.response?.message || err.message || 'Erro ao validar chave. Verifique os dados.'
      toast.error('Erro ao validar chave. Verifique os dados.', { description: msg })
    } finally {
      setTestingProvider(null)
    }
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      imobiliaria_nome: user?.imobiliaria_nome || '',
      imobiliaria_documento: user?.imobiliaria_documento || '',
      creci: user?.creci || '',
      banco_nome: user?.banco_nome || '',
      agencia: user?.agencia || '',
      conta: user?.conta || '',
      chave_pix: user?.chave_pix || '',
      comissao_padrao_percentual: user?.comissao_padrao_percentual || 0,
      openai_api_key: user?.openai_api_key || '',
      anthropic_api_key: user?.anthropic_api_key || '',
      gemini_api_key: user?.gemini_api_key || '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    const currentUserId = user?.id || pb.authStore.record?.id

    if (!currentUserId) {
      toast.error('Sessão inválida ou expirada. Faça login novamente.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...data,
        comissao_padrao_percentual: Number(data.comissao_padrao_percentual) || 0,
      }

      await updateUserProfile(currentUserId, payload)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      if (err?.status === 404) {
        console.error(
          `Attempted to update user at: /api/collections/users/records/${currentUserId}`,
        )
        toast.error('Erro de permissão ou registro não encontrado. A sessão pode ser inválida.')
        setIsSaving(false)
        return
      }

      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          form.setError(field as keyof ProfileFormValues, { message })
        }
        toast.error('Verifique os erros no formulário.')
      } else {
        toast.error(err?.message || 'Erro ao atualizar perfil.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Perfil e Configurações</h1>
        <p className="text-slate-600 mt-2">
          Gerencie seus dados profissionais, bancários e chaves de API.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">
              Dados Profissionais / Imobiliária
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imobiliaria_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Imobiliária ou Corretor</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imobiliaria_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF ou CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creci"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRECI</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">
              Dados Bancários (Para Comissão)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="banco_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ex: Itaú" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ex: 0001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta Corrente/Poupança</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ex: 12345-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chave_pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave Pix</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="CPF, Email ou Celular"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comissao_padrao_percentual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão Padrão (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? '' : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">
              Chaves de API (Inteligência Artificial)
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="openai_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys.openai ? 'text' : 'password'}
                            {...field}
                            value={field.value || ''}
                            placeholder="sk-..."
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeys((p) => ({ ...p, openai: !p.openai }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showKeys.openai ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleTestConnection('openai', field.value || '')}
                          disabled={testingProvider === 'openai' || !field.value}
                        >
                          {testingProvider === 'openai' && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Validar
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anthropic_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anthropic API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys.anthropic ? 'text' : 'password'}
                            {...field}
                            value={field.value || ''}
                            placeholder="sk-ant-..."
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeys((p) => ({ ...p, anthropic: !p.anthropic }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showKeys.anthropic ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleTestConnection('anthropic', field.value || '')}
                          disabled={testingProvider === 'anthropic' || !field.value}
                        >
                          {testingProvider === 'anthropic' && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Validar
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gemini_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys.gemini ? 'text' : 'password'}
                            {...field}
                            value={field.value || ''}
                            placeholder="AIza..."
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeys((p) => ({ ...p, gemini: !p.gemini }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showKeys.gemini ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleTestConnection('gemini', field.value || '')}
                          disabled={testingProvider === 'gemini' || !field.value}
                        >
                          {testingProvider === 'gemini' && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Validar
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 mb-12">
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">
              Configurações de Marca (Header/Footer)
            </h2>
            <p className="text-sm text-slate-500">
              Personalize o cabeçalho e rodapé dos documentos exportados. Variáveis suportadas:{' '}
              <code className="bg-slate-100 px-1 rounded">{{ imobiliaria_nome }}</code>,{' '}
              <code className="bg-slate-100 px-1 rounded">{{ creci }}</code>,{' '}
              <code className="bg-slate-100 px-1 rounded">{{ imobiliaria_documento }}</code>.
            </p>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Logo da Imobiliária
                </label>
                <div className="flex items-center gap-4">
                  {user?.imobiliaria_logo && !logoFile && (
                    <img
                      src={pb.files.getURL(user, user.imobiliaria_logo)}
                      alt="Logo atual"
                      className="h-16 w-auto object-contain border rounded p-1"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setLogoFile(e.target.files[0])
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Cabeçalho (Header)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={brandingData.header_content}
                  onChange={(e) =>
                    setBrandingData((prev) => ({ ...prev, header_content: e.target.value }))
                  }
                  placeholder="Texto do cabeçalho..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Rodapé (Footer)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={brandingData.footer_content}
                  onChange={(e) =>
                    setBrandingData((prev) => ({ ...prev, footer_content: e.target.value }))
                  }
                  placeholder="Texto do rodapé..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSavingBranding}
                className="bg-slate-800 hover:bg-slate-900"
              >
                {isSavingBranding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Marca
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
