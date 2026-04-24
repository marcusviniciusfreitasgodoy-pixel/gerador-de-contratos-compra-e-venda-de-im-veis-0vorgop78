import type { ContractFormValues } from './schemas'

const formatCurrency = (val: string | undefined | null) => {
  if (!val) return 'R$ 0,00'
  return val
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '[data]'
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return '[data]'
  return `${d}/${m}/${y}`
}

export const generateDraftText = (data: ContractFormValues): string => {
  const hojeDate = new Date()
  const hoje = `${String(hojeDate.getDate()).padStart(2, '0')}/${String(hojeDate.getMonth() + 1).padStart(2, '0')}/${hojeDate.getFullYear()}`

  let pgtoText = ''
  if (data.tipo === 'a_vista') {
    pgtoText = `- Sinal: ${formatCurrency(data.valor_sinal)} (por extenso).
- Saldo: ${formatCurrency(data.valor_saldo)} (por extenso), com vencimento em ${formatDate(data.data_pagamento_saldo)}.
- Comissão: ${formatCurrency(data.comissao)} (por extenso).`
  } else {
    pgtoText = `- Sinal: ${formatCurrency(data.valor_sinal)} (por extenso).
- Reforço de Sinal: ${formatCurrency(data.valor_reforco)} (por extenso).
- Complemento: ${formatCurrency(data.valor_complemento)} (por extenso).
- Valor Financiado: ${formatCurrency(data.valor_financiado)} (por extenso)${data.instituicao_financeira ? `, através da instituição financeira ${data.instituicao_financeira}` : ''}.
- Comissão: ${formatCurrency(data.comissao)} (por extenso).`
  }

  return `Godoy Prime Realty

INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA

Cláusula 1 - Identificação das Partes
VENDEDOR: ${data.nome_vendedor || ''}, nacionalidade: ${data.nacionalidade_vendedor || ''}, estado civil: ${data.estado_civil_vendedor || ''}, profissão: ${data.profissao_vendedor || ''}, portador do RG nº ${data.rg_vendedor || ''} expedido por ${data.orgao_emissor_vendedor || ''}, inscrito no CPF sob o nº ${data.cpf_vendedor || ''}, residente e domiciliado em ${data.endereco_vendedor || ''}. E-mail: ${data.email_vendedor || ''}, Telefone: ${data.telefone_vendedor || ''}.

COMPRADOR: ${data.nome_comprador || ''}, nacionalidade: ${data.nacionalidade_comprador || ''}, estado civil: ${data.estado_civil_comprador || ''}, profissão: ${data.profissao_comprador || ''}, portador do RG nº ${data.rg_comprador || ''} expedido por ${data.orgao_emissor_comprador || ''}, inscrito no CPF sob o nº ${data.cpf_comprador || ''}, residente e domiciliado em ${data.endereco_comprador || ''}. E-mail: ${data.email_comprador || ''}, Telefone: ${data.telefone_comprador || ''}.

Cláusula 2 - Objeto
O objeto do presente contrato é o imóvel situado em ${data.endereco_imovel || ''}, Matrícula nº ${data.matricula_imovel || ''}, registrado no RGI de ${data.rgi_imovel || ''}, Inscrição Municipal nº ${data.inscricao_municipal || ''}, possuindo área total de ${data.area_total || ''} m² e ${data.vagas_garagem || ''} vaga(s) de garagem.

Cláusula 3 - Preço e Condições de Pagamento
O preço certo e ajustado para a presente compra e venda é de ${formatCurrency(data.valor_total)} (por extenso), que será pago da seguinte forma:
${pgtoText}

Cláusula 4 - Documentação
As partes obrigam-se a apresentar as seguintes certidões e documentos: Ônus Reais, Quitação Fiscal, Quitação Condominial e Negativas Pessoais.

Cláusula 5 - Obrigações
O VENDEDOR obriga-se a transferir o domínio, garantir a habitabilidade e quitar impostos até a data da posse. O COMPRADOR obriga-se ao pagamento do preço, custos de registro e impostos futuros.

Cláusula 6 - Posse
A posse do imóvel será transferida com a entrega das chaves, sujeita à penalidade de R$ 300,00 por dia em caso de atraso.

Cláusula 7 - Penalidades
Em caso de rescisão por culpa do COMPRADOR, perderá este o sinal pago. Sendo a culpa do VENDEDOR, devolverá o sinal em dobro. Em caso de atraso, haverá multa e juros.

Cláusula 8 - Legislação
Este contrato é regido pelo Código Civil Brasileiro aplicável à espécie.

Cláusula 9 - Foro
Fica eleito o Foro da Comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.


Rio de Janeiro, ${hoje}
Foro: Comarca do Rio de Janeiro


_________________________________________________
VENDEDOR: ${data.nome_vendedor || ''}


_________________________________________________
COMPRADOR: ${data.nome_comprador || ''}


_________________________________________________
TESTEMUNHA 1 (Nome e CPF):


_________________________________________________
TESTEMUNHA 2 (Nome e CPF):`
}
