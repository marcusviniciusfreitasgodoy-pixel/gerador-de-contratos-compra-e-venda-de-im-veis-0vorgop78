import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect } from 'react'

export function ChecklistDocumental() {
  const { control, watch, setValue, getValues } = useFormContext()

  const values = watch()

  const isVendedorPJ = values.vendedor_pj
  const isVendedorUniao =
    values.vendedor_uniao_estavel ||
    values.estado_civil_vendedor === 'Casado' ||
    values.estado_civil_vendedor === 'Casada'
  const isCompradorUniao =
    values.comprador_uniao_estavel ||
    values.estado_civil_comprador === 'Casado' ||
    values.estado_civil_comprador === 'Casada'

  const getActiveDocs = () => {
    let docs: string[] = []

    // Vendedor
    if (isVendedorPJ) {
      docs.push(
        'Cartão CNPJ',
        'Contrato Social / Estatuto Social',
        'Últimas Alterações Contratuais',
        'Documento de Identidade dos Sócios/Representantes',
        'CPF dos Sócios/Representantes',
        'Certidão Negativa de Débitos (CND) Federal, Estadual e Municipal',
      )
    } else {
      docs.push(
        'Documento de Identidade (RG/CNH) - Vendedor',
        'CPF - Vendedor',
        'Comprovante de Residência Atualizado - Vendedor',
        'Certidão de Estado Civil (Nascimento atualizada ou Casamento)',
      )
    }
    if (isVendedorUniao) {
      docs.push(
        'Documento de Identidade do Cônjuge/Companheiro(a) - Vendedor',
        'CPF do Cônjuge/Companheiro(a) - Vendedor',
        'Pacto Antenupcial (se houver)',
      )
    }
    docs.push(
      'Certidão do 2º Ofício de Distribuidor',
      'Certidão de Interdições e Tutelas',
      'Certidão da Justiça Federal',
      'Certidão da Justiça do Trabalho',
    )

    // Comprador
    docs.push(
      'Documento de Identidade (RG/CNH) - Comprador',
      'CPF - Comprador',
      'Comprovante de Residência Atualizado - Comprador',
    )
    if (values.estado_civil_comprador) {
      docs.push(`Comprovante de Estado Civil (${values.estado_civil_comprador})`)
    } else {
      docs.push('Comprovante de Estado Civil')
    }

    if (isCompradorUniao) {
      docs.push(
        'Documento de Identidade do Cônjuge/Companheiro(a) - Comprador',
        'CPF do Cônjuge/Companheiro(a) - Comprador',
        'Certidão de Casamento/União Estável',
      )
    }

    // Imóvel
    docs.push(
      'Matrícula Atualizada (com ônus e ações)',
      'Capa do carnê de IPTU',
      'Certidão de Quitação Fiscal e Enfitêutica',
      'Declaração de Quitação Condominial (assinada pelo síndico)',
      'Certidão do Funesbom (Corpo de Bombeiros)',
    )

    if (values.imovel_inventario) {
      docs.push(
        'Certidão de Óbito',
        'Certidão de Inventariante',
        'Formal de Partilha ou Escritura Pública de Inventário',
        'Alvará Judicial (se o processo estiver em curso)',
      )
    }

    if (values.imovel_locado) {
      docs.push(
        'Cópia do Contrato de Locação vigente',
        'Notificação do Direito de Preferência ao locatário',
        'Termo de Renúncia ao Direito de Preferência',
      )
    }

    if (values.imovel_ocupado) {
      docs.push(
        'Laudo de Vistoria com fotos',
        'Comprovantes de quitação de contas de consumo (Luz, Água, Gás)',
        'Termo de declaração de desocupação pelo vendedor',
      )
    }

    if (values.imovel_desocupado || values.ocupacao_imovel === 'desocupado') {
      docs.push('Termo de Entrega de Chaves', 'Certidões negativas de débitos de consumo')
    }

    // Financeiro
    docs.push(
      'Dados do Banco (Nome/Código)',
      'Agência e Conta (com dígito)',
      'Titularidade e CPF/CNPJ vinculado',
      'Chave PIX vinculada (se aplicável)',
    )

    return docs
  }

  const activeDocs = getActiveDocs()

  useEffect(() => {
    const currentChecklist = getValues('checklist_compliance') || {}
    const newChecklist: Record<string, boolean> = {}

    activeDocs.forEach((doc) => {
      newChecklist[doc] = currentChecklist[doc] || false
    })

    setValue('checklist_compliance', newChecklist, { shouldDirty: true })
  }, [
    values.vendedor_pj,
    values.vendedor_uniao_estavel,
    values.estado_civil_vendedor,
    values.comprador_uniao_estavel,
    values.estado_civil_comprador,
    values.imovel_inventario,
    values.imovel_locado,
    values.imovel_ocupado,
    values.imovel_desocupado,
    values.ocupacao_imovel,
  ])

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-500 mb-4">
        Marque os documentos que já foram coletados ou verificados. Esta lista é atualizada
        automaticamente de acordo com as características do negócio.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeDocs.map((doc) => (
          <FormField
            key={doc}
            control={control}
            name={`checklist_compliance.${doc}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug cursor-pointer">
                  {doc}
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}
