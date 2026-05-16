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
  } = data

  let pgtoText = ''
  if (tipo === 'a_vista') {
    pgtoText = `Sinal: ${formatCurrency(valor_sinal || 0)}.\nSaldo: ${formatCurrency(valor_saldo || 0)}, com vencimento em ${data_pagamento_saldo ? new Date(data_pagamento_saldo).toLocaleDateString('pt-BR') : '[data]'}.`
  } else {
    pgtoText = `Sinal: ${formatCurrency(valor_sinal || 0)}.\nReforço: ${formatCurrency(valor_reforco || 0)}.\nComplemento: ${formatCurrency(valor_complemento || 0)}.\nValor Financiado: ${formatCurrency(valor_financiado || 0)}${instituicao_financeira ? ` no banco ${instituicao_financeira}` : ''}.`
  }

  const financiamentoClause =
    tipo === 'financiado' && valor_financiado > 0
      ? `
CLÁUSULA TERCEIRA - DO FINANCIAMENTO BANCÁRIO
Sendo parte do pagamento realizada através de financiamento bancário, estabelece-se que:
a) O COMPRADOR é o único e exclusivo responsável pela obtenção, aprovação e liberação do crédito junto à instituição financeira.
b) Em caso de negativa de crédito por restrições no CPF/nome do COMPRADOR ou por insuficiência de renda, este deverá quitar o saldo devedor com recursos próprios no prazo máximo de 30 (trinta) dias, sob pena de rescisão contratual por sua culpa exclusiva, com a retenção do sinal pago.
c) Eventuais atrasos no repasse dos valores decorrentes de entraves burocráticos no banco não isentam o COMPRADOR das responsabilidades assumidas, salvo se o atraso for comprovadamente causado por pendências na documentação do VENDEDOR ou do imóvel.
d) O VENDEDOR obriga-se a fornecer toda a documentação pessoal e do imóvel exigida pelo agente financeiro no prazo assinalado pelo banco.
`
      : ''

  return `INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE IMÓVEL

Pelo presente instrumento particular, as partes abaixo qualificadas:

VENDEDOR: ${nome_vendedor || '[Nome]'}, nacionalidade: ${nacionalidade_vendedor || '[Nacionalidade]'}, estado civil: ${estado_civil_vendedor || '[Estado Civil]'}, profissão: ${profissao_vendedor || '[Profissão]'}, portador do RG nº ${rg_vendedor || '[RG]'} expedido por ${orgao_emissor_vendedor || '[Órgão]'}, inscrito no CPF sob o nº ${cpf_vendedor || '[CPF]'}, residente e domiciliado em ${endereco_vendedor || '[Endereço]'}.

COMPRADOR: ${nome_comprador || '[Nome]'}, nacionalidade: ${nacionalidade_comprador || '[Nacionalidade]'}, estado civil: ${estado_civil_comprador || '[Estado Civil]'}, profissão: ${profissao_comprador || '[Profissão]'}, portador do RG nº ${rg_comprador || '[RG]'} expedido por ${orgao_emissor_comprador || '[Órgão]'}, inscrito no CPF sob o nº ${cpf_comprador || '[CPF]'}, residente e domiciliado em ${endereco_comprador || '[Endereço]'}.

Resolvem celebrar o presente contrato mediante as seguintes cláusulas:

CLÁUSULA PRIMEIRA - DO OBJETO
O objeto do presente contrato é o imóvel situado em ${endereco_imovel || '[Endereço do Imóvel]'}, Matrícula nº ${matricula_imovel || '[Matrícula]'}, registrado no RGI de ${rgi_imovel || '[RGI]'}, Inscrição Municipal nº ${inscricao_municipal || '[IPTU]'}, possuindo área total de ${area_total || '[Área]'} m² e ${vagas_garagem || '[Vagas]'} vaga(s) de garagem.

CLÁUSULA SEGUNDA - DO PREÇO E CONDIÇÕES DE PAGAMENTO
O preço certo e ajustado é de ${formatCurrency(valor_total || 0)}, a ser pago da seguinte forma:
${pgtoText}
Os pagamentos devidos ao VENDEDOR deverão ser efetuados na seguinte conta bancária: Banco ${vendedor_banco || '[Banco]'}, Ag. ${vendedor_agencia || '[Agência]'}, Conta ${vendedor_conta || '[Conta]'}, PIX: ${vendedor_pix || '[PIX]'}.
${financiamentoClause}
CLÁUSULA QUARTA - DA DOCUMENTAÇÃO
As partes obrigam-se a apresentar as seguintes certidões e documentos no prazo de 10 (dez) dias corridos:
I - VENDEDOR: CNDT, Feitos Ajuizados (Justiça Federal, Estadual Cível/Criminal, Trabalho), Protestos, Objeto e Pé (se houver apontamento).
II - IMÓVEL: Certidão de Ônus Reais atualizada, Quitação Fiscal/IPTU, Quitação Condominial.

CLÁUSULA QUINTA - DA PREVENÇÃO À LAVAGEM DE DINHEIRO E FINANCIAMENTO AO TERRORISMO (PLD-FT)
Em estrito atendimento ao Provimento CNJ nº 88/2019, o COMPRADOR declara expressamente, sob as penas da lei civil e penal, que os recursos utilizados para o pagamento do preço ajustado neste instrumento têm origem lícita e não são provenientes de qualquer infração penal. As partes declaram-se cientes de que a presente operação poderá ser comunicada ao Conselho de Controle de Atividades Financeiras (COAF) pelos notários e registradores caso se enquadre nas hipóteses de obrigatoriedade legal relativas à prevenção da lavagem de dinheiro e do financiamento do terrorismo.

CLÁUSULA SEXTA - DA POSSE E DAS OBRIGAÇÕES
A posse direta do imóvel será transferida ao COMPRADOR com a efetiva entrega das chaves, o que ocorrerá no ato da assinatura da escritura pública definitiva e quitação integral do preço.

CLÁUSULA SÉTIMA - DAS PENALIDADES E RESCISÃO
Em caso de arrependimento ou rescisão por culpa exclusiva do COMPRADOR, este perderá o sinal (arras) em favor do VENDEDOR. Sendo a culpa do VENDEDOR, este deverá devolver o sinal recebido em dobro.

E, por estarem justos e contratados, assinam o presente em 2 (duas) vias de igual teor e forma.

Rio de Janeiro, ${new Date().toLocaleDateString('pt-BR')}.

_________________________________________________
VENDEDOR: ${nome_vendedor || '[Nome Vendedor]'}

_________________________________________________
COMPRADOR: ${nome_comprador || '[Nome Comprador]'}
`
}
