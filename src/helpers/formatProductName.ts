export default function formatProductName(product: string): string {
  // Remove the price part after the last slash
  return product.replace(/\s*\/\s*[\d.,]+$/, "").trim();
}
