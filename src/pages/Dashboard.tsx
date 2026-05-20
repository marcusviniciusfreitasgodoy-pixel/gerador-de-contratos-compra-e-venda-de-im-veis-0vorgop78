import { documentPhases, scenarios } from '@/components/dashboard/dashboard-data'
import { PhaseCard } from '@/components/dashboard/phase-card'
import { ScenarioList } from '@/components/dashboard/scenario-list'

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in">
      <div className="mb-10 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Kit Profissional Imobiliário
        </h1>
        <p className="text-slate-600 mt-3 text-lg leading-relaxed">
          Selecione o documento que deseja gerar, organizado pelas fases da negociação imobiliária.
          Acompanhe os guias e as regras de ouro para uma transação segura. Todos os instrumentos
          incluem injeção automática de cláusulas de proteção de dados (LGPD), validade de
          assinatura eletrônica e adequação PLD-FT (Provimento CNJ 88).
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">
          Caminhos por Cenário
        </h2>
        <ScenarioList scenarios={scenarios} />
      </div>

      <div className="space-y-12">
        {documentPhases.map((phase) => (
          <section key={phase.id} className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{phase.title}</h2>
              <p className="text-slate-500 mt-1">{phase.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {phase.docs.map((doc) => (
                <PhaseCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
