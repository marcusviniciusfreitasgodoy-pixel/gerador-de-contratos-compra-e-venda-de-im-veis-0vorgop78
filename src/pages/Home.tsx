import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import { documentPhases, scenarios } from '@/components/dashboard/dashboard-data'
import { PhaseCard } from '@/components/dashboard/phase-card'
import { ScenarioList } from '@/components/dashboard/scenario-list'

export default function Home() {
  const phases = documentPhases || []
  const scens = scenarios || []

  if (!phases.length || !scens.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4 animate-fade-in">
        <div className="text-amber-500 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Sem dados disponíveis</h2>
        <p className="text-muted-foreground">
          Não foi possível carregar as informações do dashboard no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in-up">
      {/* Hero Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto pt-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#0C2340]">
          Bem-vindo. Do primeiro contato ao fechamento, com tudo no lugar.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
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
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#0C2340]">
          Jornada de Contratos
        </h2>
        <Tabs defaultValue={phases[0]?.id || 'captacao'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            {phases.map((phase) => (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className="text-xs md:text-sm py-3 px-2 md:px-4 text-center whitespace-normal h-full bg-slate-100 data-[state=active]:bg-[#0C2340] data-[state=active]:text-[#D4AF37] data-[state=active]:shadow-md rounded-md"
              >
                {phase.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {phases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="space-y-6 mt-8 animate-fade-in">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-[#0C2340]">{phase.title}</h3>
                <p className="text-slate-500 mt-1 text-lg">{phase.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {phase.docs.map((doc: any) => (
                  <PhaseCard key={doc.id} doc={doc} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Caminhos por Cenário */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#0C2340]">
          <ArrowRight className="w-6 h-6 text-[#D4AF37]" /> Caminhos por Cenário
        </h2>
        <ScenarioList scenarios={scens} />
      </div>

      {/* Legal Disclaimer */}
      <div className="mb-8 bg-slate-100 p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6 text-slate-500" />
          <h4 className="font-semibold text-lg text-slate-600">Como usar com segurança</h4>
        </div>
        <p className="text-base text-slate-500 leading-relaxed">
          Este painel fornece um guia padronizado para as transações imobiliárias mais comuns. No
          entanto, negócios que envolvam permutas complexas, inventários não finalizados, disputas
          judiciais ou estruturação societária (holding patrimonial) exigem a análise de um advogado
          especialista em Direito Imobiliário. Em caso de dúvida, não assuma o risco.
        </p>
      </div>
    </div>
  )
}
