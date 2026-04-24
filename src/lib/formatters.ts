export const parseCurrency = (val: string | null | undefined): number => {
  if (!val) return 0
  if (typeof val === 'number') return val
  const digits = val.replace(/[^\d-]/g, '')
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

export const formatCurrency = (val: number | string): string => {
  if (val === undefined || val === null || val === '') return ''
  const num = typeof val === 'string' ? parseInt(val.replace(/[^\d-]/g, '') || '0', 10) / 100 : val
  if (isNaN(num)) return ''
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
