import { formatCurrency } from './formatters'

export function generateDraftText(data: any, user: any) {
  const {
    nome_vendedor,
    cpf_vendedor,
    rg_vendedor,
    orgao_emissor_vendedor,
    nacionalidade_vendedor,
    estado_civil_vendedor,
    profissao_vendedor,
    endereco_vendedor,
    nome_comprador,
    cpf_comprador,
    rg_comprador,
    orgao_emissor_comprador,
    nacionalidade_comprador,
    estado_civil_comprador,
    profissao_comprador,
    endereco_comprador,
    endereco_imovel,
    matricula_imovel,
    rgi_imovel,
    inscricao_municipal,
    area_total,
    vagas_garagem,
    valor_total,
    valor_sinal,
    valor_reforco,
    valor_complemento,
    valor_saldo,
    valor_financiado,
    instituicao_financeira,
    data_pagamento_saldo,
    tipo,
    vendedor_banco,
    vendedor_agencia,
    vendedor_conta,
    vendedor_pix,
    tipo_documento,
    tipo_negociacao,
    situacao_juridica_imovel,
    condicao_suspensiva,
    cartorio,
    prazo_acordo,
    responsavel_comissao,
    comissao,
    prazo_escritura,
    data_posse,
    percentual_multa,
    cidade,
  } = data

  const dateNow = new Date().toLocaleDateString('pt-BR')
  const foro = cidade || '[Cidade/Estado]'

  let pgtoText = ''
  if (tipo === 'a_vista') {
    pgtoText = `Sinal: ${formatCurrency(valor_sinal || 0)}.\nSaldo: ${formatCurrency(valor_saldo || 0)}, com vencimento em ${data_pagamento_saldo ? new Date(data_pagamento_saldo).toLocaleDateString('pt-BR') : '[data]'}.`
  } else {
    pgtoText = `Sinal: ${formatCurrency(valor_sinal || 0)}.\nReforço: ${formatCurrency(valor_reforco || 0)}.\nComplemento: ${formatCurrency(valor_complemento || 0)}.\nValor Financiado: ${formatCurrency(valor_financiado || 0)}${instituicao_financeira ? ` no banco ${instituicao_financeira}` : ''}.`
  }

  let baseText = ''

  if (tipo_documento === 'recibo_sinal') {
    baseText = `RECIBO DE SINAL E PRINCÍPIO DE PAGAMENTO

VENDEDOR: ${nome_vendedor || '[Nome]'}, portador do CPF nº ${cpf_vendedor || '[CPF]'}.
COMPRADOR: ${nome_comprador || '[Nome]'}, portador do CPF nº ${cpf_comprador || '[CPF]'}.

Referente ao imóvel situado em ${endereco_imovel || '[Endereço do Imóvel]'}, Matrícula nº ${matricula_imovel || '[Matrícula]'}, Cartório: ${cartorio || '[Cartório]'}.

1. O VENDEDOR declara ter recebido do COMPRADOR a quantia de ${formatCurrency(valor_sinal || 0)} a título de sinal e princípio de pagamento (Arras).
2. O valor total acordado para a futura negociação é de ${formatCurrency(valor_total || 0)}.
3. ARRAS (Art. 417 ao 420 do Código Civil): Fica estipulado que, em caso de desistência por parte do COMPRADOR, este perderá o valor do sinal em favor do VENDEDOR. Caso a desistência ocorra por parte do VENDEDOR, este deverá restituir o valor recebido em dobro.
4. As partes concordam em assinar o contrato principal (Promessa de Compra e Venda ou Contrato Definitivo) até a data de ${prazo_acordo || '[Data do Acordo]'}.
5. A responsabilidade pelo pagamento da comissão de corretagem, no valor de ${formatCurrency(comissao || 0)}, caberá ao ${responsavel_comissao || '[Responsável]'}.

Elegem o foro da Comarca de ${foro} para dirimir quaisquer dúvidas.`
  } else if (tipo_documento === 'promessa_cv' || tipo_documento === 'contrato_particular') {
    const titulo =
      tipo_documento === 'promessa_cv'
        ? 'INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE IMÓVEL'
        : 'INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE IMÓVEL'

    baseText = `${titulo}

Pelo presente instrumento particular, as partes abaixo qualificadas:

VENDEDOR: ${nome_vendedor || '[Nome]'}, nacionalidade: ${nacionalidade_vendedor || '[Nacionalidade]'}, estado civil: ${estado_civil_vendedor || '[Estado Civil]'}, profissão: ${profissao_vendedor || '[Profissão]'}, portador do RG nº ${rg_vendedor || '[RG]'} expedido por ${orgao_emissor_vendedor || '[Órgão]'}, inscrito no CPF sob o nº ${cpf_vendedor || '[CPF]'}, residente e domiciliado em ${endereco_vendedor || '[Endereço]'}.

COMPRADOR: ${nome_comprador || '[Nome]'}, nacionalidade: ${nacionalidade_comprador || '[Nacionalidade]'}, estado civil: ${estado_civil_comprador || '[Estado Civil]'}, profissão: ${profissao_comprador || '[Profissão]'}, portador do RG nº ${rg_comprador || '[RG]'} expedido por ${orgao_emissor_comprador || '[Órgão]'}, inscrito no CPF sob o nº ${cpf_comprador || '[CPF]'}, residente e domiciliado em ${endereco_comprador || '[Endereço]'}.

Resolvem celebrar o presente contrato mediante as seguintes cláusulas:

CLÁUSULA PRIMEIRA - DO OBJETO
O objeto do presente contrato é o imóvel situado em ${endereco_imovel || '[Endereço do Imóvel]'}, Matrícula nº ${matricula_imovel || '[Matrícula]'}, registrado no ${cartorio || rgi_imovel || '[RGI]'}, Inscrição Municipal nº ${inscricao_municipal || '[IPTU]'}, possuindo área total de ${area_total || '[Área]'} m² e ${vagas_garagem || '[Vagas]'} vaga(s) de garagem.
${situacao_juridica_imovel ? `\nParágrafo Único: O imóvel é prometido à venda na seguinte situação jurídica: ${situacao_juridica_imovel}.\n` : ''}

CLÁUSULA SEGUNDA - DO PREÇO E CONDIÇÕES DE PAGAMENTO
O preço certo e ajustado é de ${formatCurrency(valor_total || 0)}, a ser pago da seguinte forma:
${pgtoText}
Os pagamentos devidos ao VENDEDOR deverão ser efetuados na seguinte conta bancária: Banco ${vendedor_banco || '[Banco]'}, Ag. ${vendedor_agencia || '[Agência]'}, Conta ${vendedor_conta || '[Conta]'}, PIX: ${vendedor_pix || '[PIX]'}.
`
    if (tipo === 'financiado' && valor_financiado > 0) {
      baseText += `
CLÁUSULA TERCEIRA - DO FINANCIAMENTO BANCÁRIO
Sendo parte do pagamento realizada através de financiamento bancário, estabelece-se que o COMPRADOR é o único e exclusivo responsável pela obtenção, aprovação e liberação do crédito.
`
    }

    if (condicao_suspensiva) {
      baseText += `
CLÁUSULA - DA CONDIÇÃO SUSPENSIVA
O presente negócio jurídico fica condicionado ao seguinte evento: ${condicao_suspensiva}.
`
    }

    baseText += `
CLÁUSULA - DA POSSE E DA ESCRITURA
A posse direta do imóvel será transferida ao COMPRADOR na data de ${data_posse ? new Date(data_posse).toLocaleDateString('pt-BR') : '[Data Posse]'}, condicionada à quitação das obrigações correntes. 
A escritura definitiva deverá ser lavrada até ${prazo_escritura ? new Date(prazo_escritura).toLocaleDateString('pt-BR') : '[Data Escritura]'}.

CLÁUSULA - DAS PENALIDADES E RESCISÃO
Em caso de inadimplemento das obrigações assumidas, estipula-se multa penal correspondente a ${percentual_multa || 10}% sobre o valor total do contrato, além da aplicação da regra das arras (Art. 417-420 CC).
`
  } else {
    baseText = `DOCUMENTO - ${tipo_documento?.toUpperCase()?.replace(/_/g, ' ') || 'CONTRATO'}

VENDEDOR: ${nome_vendedor || '[Nome]'}
COMPRADOR: ${nome_comprador || '[Nome]'}
IMÓVEL: ${endereco_imovel || '[Endereço do Imóvel]'}

Declaram as partes cientes de seus direitos e deveres para o prosseguimento da negociação.
`
  }

  // Modern Legal Clauses Integration: Specific Negotiation Types
  let negClause = ''
  if (tipo_negociacao === 'investidor') {
    negClause = `CLÁUSULA - DA CESSÃO DE DIREITOS (FLIP/RENDA)\nFica expressamente autorizada a cessão de direitos deste contrato a terceiros, sem a necessidade de anuência prévia do VENDEDOR, preservando-se todas as condições originais pactuadas, visando conferir liquidez ao COMPRADOR investidor.`
  } else if (tipo_negociacao === 'alto_padrao') {
    negClause = `CLÁUSULA - DOS MÓVEIS PLANEJADOS E ACABAMENTOS PREMIUM\nDeclara o VENDEDOR que os móveis planejados, eletrodomésticos embutidos, itens de decoração fixos e acabamentos de alto padrão descritos em memorial descritivo anexo fazem parte integrante do negócio e serão entregues em perfeito estado de conservação.`
  } else if (tipo_negociacao === 'permuta') {
    negClause = `CLÁUSULA - DA PERMUTA DE BENS\nA presente negociação envolve a dação em pagamento (permuta) de bem(ns) descrito(s) em anexo, pelo valor equivalente a parte do preço ajustado. As partes garantem a propriedade, a liquidez e a ausência de ônus sobre os bens permutados.`
  }

  // Modern Legal Clauses Integration: Global Clauses
  const globais = `
CLÁUSULA - PREVENÇÃO À LAVAGEM DE DINHEIRO E FINANCIAMENTO AO TERRORISMO (PLD-FT)
Em atendimento ao Provimento CNJ nº 88/2019, o COMPRADOR declara expressamente que os recursos utilizados para o pagamento do preço têm origem lícita. As partes estão cientes de que a operação poderá ser comunicada ao COAF, isentando os intermediadores de responsabilidade civil decorrente deste dever legal.

CLÁUSULA - DA PROTEÇÃO DE DADOS (LGPD)
As partes autorizam o tratamento de dados pessoais exclusivamente para execução deste contrato.

CLÁUSULA - DA ASSINATURA ELETRÔNICA
As partes reconhecem como válida a assinatura eletrônica deste instrumento.

E, por estarem justos e contratados, assinam o presente.

${foro}, ${dateNow}.

_________________________________________________
VENDEDOR: ${nome_vendedor || '[Nome Vendedor]'}

_________________________________________________
COMPRADOR: ${nome_comprador || '[Nome Comprador]'}
`

  return baseText + (negClause ? '\n\n' + negClause : '') + '\n' + globais
}
