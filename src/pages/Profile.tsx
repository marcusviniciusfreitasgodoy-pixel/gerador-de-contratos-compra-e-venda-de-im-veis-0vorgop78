import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/use-auth'
import { updateUserProfile } from '@/services/users'
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
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return
    setIsSaving(true)
    try {
      await updateUserProfile(user.id, data)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      toast.error('Erro ao atualizar perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Perfil e Configurações</h1>
        <p className="text-slate-600 mt-2">
          Gerencie seus dados profissionais e bancários para automação de contratos.
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} placeholder="Ex: Itaú" />
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
                      <Input {...field} placeholder="Ex: 0001" />
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
                      <Input {...field} placeholder="Ex: 12345-6" />
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
                      <Input {...field} placeholder="CPF, Email ou Celular" />
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
                      <Input type="number" step="0.1" {...field} />
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
    </div>
  )
}
