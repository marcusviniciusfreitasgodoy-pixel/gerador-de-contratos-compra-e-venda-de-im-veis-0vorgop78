import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'

const CATEGORIES = [
  {
    title: 'Vendedor',
    items: [
      'Documento de Identidade (RG/CNH)',
      'CPF',
      'Comprovante de Residência Atualizado',
      'Certidão de Estado Civil (Nascimento atualizada ou Casamento)',
      'Documento de Identidade do Cônjuge/Companheiro(a)',
      'CPF do Cônjuge/Companheiro(a)',
      'Pacto Antenupcial (se houver)',
      'Certidões de Protesto de Títulos (domicílio e local do imóvel)',
      'Certidão de Distribuição Cível e Criminal Estadual',
      'Certidão Conjunta de Débitos Relativos a Tributos Federais e à Dívida Ativa da União (RFB)',
      'Certidão do 2º Ofício de Distribuidor',
      'Certidão de Interdições e Tutelas',
      'Certidão da Justiça Federal',
      'Certidão da Justiça do Trabalho',
    ],
  },
  {
    title: 'Comprador',
    items: [
      'Documento de Identidade (RG/CNH)',
      'CPF',
      'Comprovante de Residência Atualizado',
      'Comprovante de Estado Civil (Casado)',
      'Documento de Identidade do Cônjuge/Companheiro(a)',
      'CPF do Cônjuge/Companheiro(a)',
      'Certidão de Casamento/União Estável',
    ],
  },
  {
    title: 'Imóvel',
    items: [
      'Matrícula Atualizada (com ônus e ações)',
      'Capa do carnê de IPTU',
      'Certidão de Quitação Fiscal e Enfitêutica',
      'Declaração de Quitação Condominial (assinada pelo síndico)',
      'Cópia da Ata de Eleição do Síndico',
      'Certidão do Funesbom (Corpo de Bombeiros)',
      'Laudo de Vistoria com fotos',
      'Comprovantes de quitação de contas de consumo (Luz, Água, Gás)',
      'Termo de declaração de desocupação pelo vendedor',
    ],
  },
  {
    title: 'Dados Bancários',
    items: [
      'Dados do Banco (Nome/Código)',
      'Agência e Conta (com dígito)',
      'Titularidade e CPF/CNPJ vinculado',
      'Chave PIX vinculada (se aplicável)',
    ],
  },
]

export function ChecklistDocumental() {
  const { control } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-500 mb-0">
          Marque os documentos que já foram coletados ou verificados para este checklist.
        </p>
      </div>

      {CATEGORIES.map((category) => (
        <div key={category.title} className="space-y-3">
          <h3 className="text-lg font-bold text-[#0C2340] border-b pb-2">{category.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.items.map((item) => {
              const fieldName = `compliance_checklist.${category.title} - ${item}`
              return (
                <FormField
                  key={fieldName}
                  control={control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md bg-white shadow-sm border border-slate-200 transition-colors hover:border-slate-300">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="flex flex-col space-y-1">
                        <FormLabel className="text-sm font-medium leading-snug cursor-pointer">
                          {item}
                        </FormLabel>
                        <div>
                          {field.value ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              ✓ COLETADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                              ⚠️ PENDENTE
                            </span>
                          )}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
