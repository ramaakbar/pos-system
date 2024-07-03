export function generateCode(prefix: string) {
  const uniquePart = crypto.randomUUID().split("-")[0].toUpperCase();
  return `${prefix}-${uniquePart}`;
}
