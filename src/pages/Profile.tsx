import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/use-auth'
import { updateUserProfile } from '@/services/users'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
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
import { Loader2, Save } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

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
    if (!user || !user.id) {
      toast.error('Usuário não identificado.')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        ...data,
        comissao_padrao_percentual: Number(data.comissao_padrao_percentual) || 0,
      }
      await updateUserProfile(user.id, payload)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      if (err?.status === 404) {
        console.error(`Attempted to update user at: /api/collections/users/records/${user.id}`)
        toast.error('Recurso não encontrado (404). Verifique sua sessão.')
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openai_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        value={field.value || ''}
                        placeholder="sk-..."
                      />
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
                      <Input
                        type="password"
                        {...field}
                        value={field.value || ''}
                        placeholder="sk-ant-..."
                      />
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
                      <Input
                        type="password"
                        {...field}
                        value={field.value || ''}
                        placeholder="AIza..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pb-12">
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
    </div>
  )
}
