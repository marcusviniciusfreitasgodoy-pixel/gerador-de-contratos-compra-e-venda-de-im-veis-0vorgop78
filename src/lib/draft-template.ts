import type { ContractFormValues } from './schemas'
import { parseCurrency } from './formatters'

const parseCurrencySafe = (val: string | undefined | null) => {
  if (!val) return 0
  return parseCurrency(val) || 0
}

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

export const generateDraftText = (data: ContractFormValues, user?: any): string => {
  const hojeDate = new Date()
  const hoje = `${String(hojeDate.getDate()).padStart(2, '0')}/${String(hojeDate.getMonth() + 1).padStart(2, '0')}/${hojeDate.getFullYear()}`

  let pgtoText = ''
  if (data.tipo === 'a_vista') {
    const reforcoText =
      data.valor_reforco && parseCurrencySafe(data.valor_reforco) > 0
        ? `\n- Reforço de Sinal: ${formatCurrency(data.valor_reforco)} (por extenso).`
        : ''
    const complementoText =
      data.valor_complemento && parseCurrencySafe(data.valor_complemento) > 0
        ? `\n- Complemento: ${formatCurrency(data.valor_complemento)} (por extenso).`
        : ''
    const saldoText =
      data.valor_saldo && parseCurrencySafe(data.valor_saldo) > 0
        ? `\n- Saldo: ${formatCurrency(data.valor_saldo)} (por extenso), com vencimento em ${formatDate(data.data_pagamento_saldo)}.`
        : ''

    pgtoText = `- Sinal: ${formatCurrency(data.valor_sinal)} (por extenso).${reforcoText}${complementoText}${saldoText}
- Comissão: ${formatCurrency(data.comissao)} (por extenso).`
  } else {
    pgtoText = `- Sinal: ${formatCurrency(data.valor_sinal)} (por extenso).
- Reforço de Sinal: ${formatCurrency(data.valor_reforco)} (por extenso).
- Complemento: ${formatCurrency(data.valor_complemento)} (por extenso).
- Valor Financiado: ${formatCurrency(data.valor_financiado)} (por extenso)${data.instituicao_financeira ? `, através da instituição financeira ${data.instituicao_financeira}` : ''}.
- Comissão: ${formatCurrency(data.comissao)} (por extenso).`
  }

  const brokerBankInfo = user?.banco_nome
    ? `
O pagamento da comissão de corretagem deverá ser depositado na conta bancária de titularidade de ${user.imobiliaria_nome || user.name}, CPF/CNPJ: ${user.imobiliaria_documento || ''}, CRECI: ${user.creci || ''}.
Banco: ${user.banco_nome}, Agência: ${user.agencia}, Conta: ${user.conta}, Chave Pix: ${user.chave_pix}.`
    : ''

  const sellerBankInfo = data.vendedor_banco
    ? `
Os pagamentos devidos ao VENDEDOR deverão ser efetuados na seguinte conta bancária:
Banco: ${data.vendedor_banco}, Agência: ${data.vendedor_agencia}, Conta: ${data.vendedor_conta}, Chave Pix: ${data.vendedor_pix}.`
    : ''

  return `${user?.imobiliaria_nome || 'GODOY PRIME REALTY'}
═══════════════════════════════════════════════════════════════════════════

INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA

Por este instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Promessa de Compra e Venda, mediante as cláusulas e condições a seguir estabelecidas:

Cláusula 1ª - Das Partes
VENDEDOR: ${data.nome_vendedor || ''}, nacionalidade: ${data.nacionalidade_vendedor || ''}, estado civil: ${data.estado_civil_vendedor || ''}, profissão: ${data.profissao_vendedor || ''}, portador do RG nº ${data.rg_vendedor || ''} expedido por ${data.orgao_emissor_vendedor || ''}, inscrito no CPF sob o nº ${data.cpf_vendedor || ''}, residente e domiciliado em ${data.endereco_vendedor || ''}. E-mail: ${data.email_vendedor || ''}, Telefone: ${data.telefone_vendedor || ''}.

COMPRADOR: ${data.nome_comprador || ''}, nacionalidade: ${data.nacionalidade_comprador || ''}, estado civil: ${data.estado_civil_comprador || ''}, profissão: ${data.profissao_comprador || ''}, portador do RG nº ${data.rg_comprador || ''} expedido por ${data.orgao_emissor_comprador || ''}, inscrito no CPF sob o nº ${data.cpf_comprador || ''}, residente e domiciliado em ${data.endereco_comprador || ''}. E-mail: ${data.email_comprador || ''}, Telefone: ${data.telefone_comprador || ''}.

Cláusula 2ª - Do Objeto
O objeto do presente contrato é o imóvel (tipo: padrão), situado em ${data.endereco_imovel || ''}, bairro não informado, CEP não informado, Matrícula nº ${data.matricula_imovel || ''}, registrado no RGI de ${data.rgi_imovel || ''}, Inscrição Municipal nº ${data.inscricao_municipal || ''}, possuindo área total de ${data.area_total || ''} m², área construída não informada e ${data.vagas_garagem || ''} vaga(s) de garagem.

Cláusula 3ª - Do Preço e Condições de Pagamento
O preço certo e ajustado para a presente compra e venda é de ${formatCurrency(data.valor_total)} (por extenso), que será pago da seguinte forma:
${pgtoText}${sellerBankInfo}${brokerBankInfo}

Cláusula 4ª - Da Documentação
As partes obrigam-se a apresentar as seguintes certidões e documentos: Ônus Reais, Quitação Fiscal, Quitação Condominial e Negativas Pessoais.

Cláusula 5ª - Das Obrigações
O VENDEDOR obriga-se a transferir o domínio, garantir a habitabilidade e quitar impostos até a data da posse. O COMPRADOR obriga-se ao pagamento do preço, custos de registro e impostos futuros.

Cláusula 6ª - Da Posse
A posse do imóvel será transferida com a entrega das chaves, sujeita à penalidade de R$ 300,00 por dia em caso de atraso na desocupação ou entrega.

Cláusula 7ª - Das Penalidades
Em caso de rescisão por culpa do COMPRADOR, perderá este o sinal pago. Sendo a culpa do VENDEDOR, devolverá o sinal em dobro. Em caso de atraso, haverá multa de 2% (dois por cento) e juros de 1% (um por cento) ao mês.

Cláusula 8ª - Da Rescisão
Caso qualquer das partes descumpra o estipulado, a parte inocente poderá notificar a infratora para sanar a falha, sob pena de rescisão de pleno direito.

Cláusula 9ª - Da Legislação
Este contrato é regido pelo Código Civil Brasileiro aplicável à espécie.

Cláusula 10ª - Do Foro
Fica eleito o Foro da Comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato, renunciando a qualquer outro por mais privilegiado que seja.

═══════════════════════════════════════════════════════════════════════════

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
