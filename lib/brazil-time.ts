/**
 * Função para obter timestamp em UTC (formato esperado pelo UTMify)
 * Formato: YYYY-MM-DD HH:MM:SS
 * 
 * @param date - Data opcional (padrão: now)
 * @returns String no formato "2025-10-07 17:37:00" em UTC
 */
export function getBrazilTimestamp(date: Date = new Date()): string {
  // UTMify exige data em UTC ISO 8601
  return date.toISOString()
}
