import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  UserCheck,
  FileText,
  ShieldCheck,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          Bem-vindo. Do primeiro contato ao fechamento, com tudo no lugar.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
          Cada venda passa por etapas. E em cada etapa existe um documento que protege o negócio.
          Quando um deles fica de fora ou sai errado, é aí que a venda trava ou vira dor de cabeça
          depois. Esta ferramenta acompanha você na jornada inteira. Ela monta o documento certo, na
          hora certa, com as cláusulas que não podem faltar. Você chega preparado em cada fase e
          passa segurança pro cliente.
        </p>
      </div>

      {/* 4 Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <UserCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-slate-800">Captação e Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 leading-relaxed">
            O começo de tudo. Ficha cadastral, checklist de documentos e a autorização de
            intermediação. É aqui que você organiza o imóvel e garante o seu direito de trabalhar a
            venda.
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-700">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-slate-800">Contratual</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 leading-relaxed">
            O coração do negócio. Sinal, promessa de compra e venda, contrato preliminar e
            definitivo. É aqui que entra preço, prazo, forma de pagamento e o que acontece se alguém
            desistir.
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-slate-800">Aditivos e Complementares</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 leading-relaxed">
            Os detalhes que blindam o negócio. Declarações de estado civil, termo de entrega de
            chaves e termo de posse, o momento em que o imóvel passa de fato para o comprador.
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <CheckCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-slate-800">Finalização</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 leading-relaxed">
            O encerramento. Quando o negócio não segue, o distrato encerra tudo de forma organizada
            e sem briga.
          </CardContent>
        </Card>
      </div>

      {/* Educational Highlight */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row gap-5 items-start shadow-sm">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-700 shrink-0">
          <Lightbulb className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-indigo-900 mb-3">Uma coisa que vale guardar</h3>
          <p className="text-indigo-800 leading-relaxed text-lg">
            O contrato cria as obrigações entre as partes. Mas quem transfere o imóvel de verdade é
            o registro na matrícula, lá no final. Antes dele, ninguém é dono, por mais que o
            dinheiro já tenha sido pago. Por isso a peça mais importante costuma ser a promessa do
            começo, não a escritura do fim. É nela que tudo se decide.
          </p>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <Alert className="mb-14 border-orange-200 bg-orange-50 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900 font-bold text-base">
          Como usar com segurança
        </AlertTitle>
        <AlertDescription className="text-orange-800 mt-2 text-base leading-relaxed">
          A ferramenta monta os documentos com base técnica sólida e te deixa pronto pra conduzir
          cada etapa. Ela não substitui o advogado. Cada negócio tem um detalhe que muda tudo, então
          quando o caso for mais complexo, mande a versão final pra revisão de um profissional do
          direito.
        </AlertDescription>
      </Alert>

      {/* Call to Action */}
      <div className="text-center space-y-8 bg-slate-50 py-10 px-6 rounded-3xl border border-slate-100">
        <p className="text-xl font-semibold text-slate-800 max-w-2xl mx-auto">
          Corretor que entende o que está assinando fecha mais negócio. É esse corretor que a gente
          quer te ajudar a ser.
        </p>
        <Button
          size="lg"
          className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          onClick={() => navigate('/dashboard')}
        >
          Começar <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
