export type DocumentStatusType = 'optional' | 'mandatory' | 'core' | 'conditional'

export interface DocumentInfo {
  id: string
  title: string
  subtitle: string
  description: string
  tip: string
  status: string
  statusType: DocumentStatusType
  typeId: string
}

export interface PhaseInfo {
  id: string
  title: string
  description: string
  docs: DocumentInfo[]
}

export interface ScenarioInfo {
  title: string
  description: string
  steps: string[]
}

export const documentPhases: PhaseInfo[] = [
  {
    id: 'captacao',
    title: '1. Captação e Cadastro',
    description: 'A base sólida da transação começa aqui.',
    docs: [
      {
        id: 'ficha_cadastral',
        title: 'Ficha Cadastral',
        subtitle: 'Todas as informações do imóvel e das partes, reunidas antes de qualquer coisa.',
        description:
          'Formulário para coleta estruturada de dados das partes e do imóvel. Serve de base para a elaboração de todos os outros documentos.',
        tip: 'Envie este formulário ao cliente logo no primeiro contato mais quente. Quanto mais cedo tiver os dados, mais ágil será a emissão dos contratos.',
        status: 'Pode ser pulado',
        statusType: 'optional',
        typeId: 'ficha_cadastral',
      },
      {
        id: 'checklist_documental',
        title: 'Checklist Documental',
        subtitle: 'Tudo o que precisa ser apresentado antes de fechar negócio.',
        description:
          'Relação das certidões e documentos exigidos do vendedor, comprador e imóvel para garantir a segurança jurídica da transação.',
        tip: 'Compartilhe esta lista com os clientes o mais cedo possível, pois a emissão de certidões pode demorar.',
        status: 'Obrigatório',
        statusType: 'mandatory',
        typeId: 'checklist_documental',
      },
      {
        id: 'autorizacao_intermediacao',
        title: 'Autorização de Intermediação',
        subtitle: 'O documento que garante o seu direito de trabalhar a venda.',
        description:
          'Formaliza a prestação de serviços do corretor, estabelecendo exclusividade (ou não), valor da comissão e regras de pagamento.',
        tip: 'Nunca inicie a divulgação ou visitas sem este documento assinado. É a sua proteção de comissionamento.',
        status: 'Obrigatório',
        statusType: 'mandatory',
        typeId: 'autorizacao_intermediacao',
      },
    ],
  },
  {
    id: 'contratual',
    title: '2. Contratual',
    description: 'A essência jurídica e financeira do negócio.',
    docs: [
      {
        id: 'recibo_sinal',
        title: 'Recibo de Sinal (Arras)',
        subtitle: 'Confirmação do interesse e princípio de pagamento.',
        description:
          'Documento simples que formaliza o recebimento de um valor inicial. É vital detalhar a diferença entre arras confirmatórias (não permitem arrependimento) e penitenciais (permitem arrependimento com multa).',
        tip: 'Use para travar o negócio rapidamente enquanto os contratos mais densos são elaborados.',
        status: 'Pode ser pulado',
        statusType: 'optional',
        typeId: 'recibo_sinal',
      },
      {
        id: 'contrato_preliminar',
        title: 'Contrato Particular Preliminar',
        subtitle: 'Estabelece as bases do negócio antes da assinatura definitiva.',
        description:
          'Utilizado principalmente para fixar condições suspensivas, como a aprovação de um financiamento ou a regularização de uma averbação na matrícula.',
        tip: 'Essencial quando o negócio depende de um fator externo para acontecer de fato.',
        status: 'Pode ser pulado',
        statusType: 'optional',
        typeId: 'contrato_particular',
      },
      {
        id: 'promessa_cv',
        title: 'Promessa de Compra e Venda',
        subtitle: 'O compromisso firme de transferir a propriedade.',
        description:
          'O principal instrumento da transação. Gera o "direito real de aquisição" e detalha todas as obrigações, prazos, multas e condições do negócio.',
        tip: 'A promessa de compra e venda é a sua garantia principal. Quando registrada na matrícula, impede que o imóvel seja vendido a terceiros.',
        status: 'Obrigatório em quase todo cenário',
        statusType: 'core',
        typeId: 'promessa_compra_venda',
      },
      {
        id: 'contrato_particular',
        title: 'Contrato Particular de Compra e Venda',
        subtitle: 'Transferência sem escritura pública (em casos específicos).',
        description:
          'Instrumento com força de escritura, aplicável apenas quando o imóvel é financiado pelo SFH ou quando o valor é inferior ao limite legal.',
        tip: 'Só utilize como instrumento definitivo se tiver certeza do enquadramento nas exceções legais.',
        status: 'Só em financiamento ou valor dentro do limite',
        statusType: 'conditional',
        typeId: 'contrato_particular',
      },
      {
        id: 'contrato_definitivo',
        title: 'Contrato Definitivo de Compra e Venda',
        subtitle: 'A escritura pública (ou equivalente) que transfere a propriedade.',
        description:
          'Ato final da transação, lavrado em cartório (ou pelo banco), essencial para o registro na matrícula e transferência da titularidade.',
        tip: 'Acompanhe a lavratura para garantir que reflita exatamente o que foi acordado na Promessa.',
        status: 'Obrigatório para fechar',
        statusType: 'mandatory',
        typeId: 'contrato_particular',
      },
    ],
  },
  {
    id: 'aditivos',
    title: '3. Aditivos e Complementares',
    description: 'Ajustes finais e formalização da entrega.',
    docs: [
      {
        id: 'declaracoes_comp',
        title: 'Declarações Complementares',
        subtitle: 'Documentos auxiliares de declaração de fatos.',
        description:
          'Incluem declarações sobre união estável, capacidade financeira ou origem lícita dos recursos, exigidas pelos bancos ou cartórios.',
        tip: 'Verifique antecipadamente as exigências do cartório de notas escolhido.',
        status: 'Pode ser pulado',
        statusType: 'optional',
        typeId: 'declaracoes_complementares',
      },
      {
        id: 'termo_chaves',
        title: 'Termo de Entrega de Chaves',
        subtitle: 'Formaliza a entrega física do imóvel ao comprador.',
        description:
          'Documento que atesta o recebimento das chaves, o estado de conservação do imóvel e a transferência da responsabilidade pelo pagamento de taxas e impostos.',
        tip: 'Faça uma vistoria fotográfica e anexe a este termo.',
        status: 'Obrigatório',
        statusType: 'mandatory',
        typeId: 'termo_entrega_chaves',
      },
      {
        id: 'termo_posse',
        title: 'Termo de Posse',
        subtitle: 'Transferência do uso e gozo do imóvel.',
        description:
          'Formaliza a imissão na posse. Se a entrega das chaves e a posse ocorrerem no mesmo ato, podem ser unificados. Mas se o imóvel estiver locado, a posse transfere o direito de receber aluguéis.',
        tip: "Regra Prática: Se chaves e posse ocorrem no mesmo dia, unifique no 'Termo de Entrega de Chaves e Transferência de Posse'.",
        status: 'Obrigatório',
        statusType: 'mandatory',
        typeId: 'termo_posse',
      },
    ],
  },
  {
    id: 'finalizacao',
    title: '4. Finalização',
    description: 'Encerramento e garantias.',
    docs: [
      {
        id: 'distrato',
        title: 'Distrato',
        subtitle: 'O encerramento formal do negócio, quando a transação não vai mais seguir.',
        description:
          'Rescisão amigável do contrato anterior, prevendo a devolução (ou retenção) de valores e estabelecendo quitação mútua plena.',
        tip: 'É fundamental garantir a quitação mútua plena, evitando processos judiciais futuros.',
        status: 'Se aplicável',
        statusType: 'conditional',
        typeId: 'distrato',
      },
    ],
  },
]

export const scenarios: ScenarioInfo[] = [
  {
    title: 'Venda à vista (Sem financiamento)',
    description: 'Para transações limpas, sem pendências e com pagamento com recursos próprios.',
    steps: [
      'Checklist Documental',
      'Promessa de Compra e Venda',
      'Escritura Pública Definitiva',
      'Termo de Entrega de Chaves',
    ],
  },
  {
    title: 'Venda com Financiamento Bancário',
    description: 'Quando parte do valor será pago via instituição financeira.',
    steps: [
      'Checklist Documental',
      'Promessa de Compra e Venda',
      'Contrato Particular (com força de Escritura)',
      'Termo de Entrega de Chaves',
    ],
  },
  {
    title: 'Imóvel com Pendência Documental',
    description:
      'Quando o negócio depende da regularização prévia (ex: averbação de obra, inventário em curso).',
    steps: ['Contrato Particular Preliminar', 'Promessa de Compra e Venda', 'Escritura Pública'],
  },
  {
    title: 'Urgência de Travamento',
    description:
      'Quando é necessário segurar o negócio rapidamente enquanto se elabora a promessa completa.',
    steps: ['Recibo de Sinal (Arras)', 'Promessa de Compra e Venda', 'Escritura Pública'],
  },
]
