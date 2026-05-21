import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, ArrowRight, AlertCircle, FileText } from 'lucide-react'
import { documentPhases, scenarios } from '@/components/dashboard/dashboard-data'
import { ExportDocxButton } from '@/components/contracts/ExportDocxButton'
import { Button } from '@/components/ui/button'
import { PhaseCard } from '@/components/dashboard/phase-card'
import { ScenarioList } from '@/components/dashboard/scenario-list'

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in-up">
      {/* Contract Editor Actions Toolbar (Demo for Export DOCX) */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/30 p-4 rounded-xl border border-border shadow-sm gap-4">
        <div className="text-sm font-medium text-muted-foreground">Ações do Contrato (Preview)</div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar para PDF
          </Button>
          <ExportDocxButton
            size="sm"
            contractData={{
              tipo_documento: 'Promessa_Compra_Venda',
              nome_comprador: 'Cliente Exemplo',
              minuta_texto: 'Minuta de teste para exportação de DOCX.',
            }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto pt-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Bem-vindo. Do primeiro contato ao fechamento, com tudo no lugar.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Acompanhe e gere os instrumentos legais certos em cada uma das 4 fases da transação
          imobiliária para garantir segurança jurídica e uma experiência profissional para os seus
          clientes.
        </p>
      </div>

      {/* Regra de Ouro */}
      <div className="mb-10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm dark:from-amber-900/30">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-full dark:bg-amber-900/50 shadow-sm shrink-0">
            <ShieldCheck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-amber-800 dark:text-amber-400">Regra de Ouro</h3>
            <p className="text-amber-700 dark:text-amber-300 mt-2 text-base md:text-lg leading-relaxed">
              A <strong>Promessa de Compra e Venda</strong> é o único instrumento que nunca deve ser
              pulado. É a sua principal garantia jurídica e o documento do qual todos os outros
              derivam.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs das Fases */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Jornada de Contratos</h2>
        <Tabs defaultValue="captacao" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            {documentPhases.map((phase) => (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className="text-xs md:text-sm py-3 px-2 md:px-4 text-center whitespace-normal h-full bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md"
              >
                {phase.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentPhases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="space-y-6 mt-8 animate-fade-in">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground">{phase.title}</h3>
                <p className="text-muted-foreground mt-1 text-lg">{phase.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {phase.docs.map((doc) => (
                  <PhaseCard key={doc.id} doc={doc} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Caminhos por Cenário */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ArrowRight className="w-6 h-6 text-primary" /> Caminhos por Cenário
        </h2>
        <ScenarioList scenarios={scenarios} />
      </div>

      {/* Legal Disclaimer */}
      <div className="mb-8 bg-muted/40 p-6 rounded-xl border border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
          <h4 className="font-semibold text-lg text-muted-foreground">Como usar com segurança</h4>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Este painel fornece um guia padronizado para as transações imobiliárias mais comuns. No
          entanto, negócios que envolvam permutas complexas, inventários não finalizados, disputas
          judiciais ou estruturação societária (holding patrimonial) exigem a análise de um advogado
          especialista em Direito Imobiliário. Em caso de dúvida, não assuma o risco.
        </p>
      </div>
    </div>
  )
}
