export function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Lê um número em formato brasileiro a partir de texto livre.
 * Trata "1.299,90" (ponto = milhar, vírgula = decimal) e "1299,90"/"19.90".
 * Retorna undefined se não houver número válido.
 */
export function parseBRLNumber(raw: string): number | undefined {
  let s = raw.replace(/[^0-9.,]/g, '');
  if (!s) return undefined;
  if (s.includes(',')) {
    // vírgula é o separador decimal; pontos são separadores de milhar
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}
