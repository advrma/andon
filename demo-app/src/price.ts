export type Item = { price: number; qty: number };

export function subtotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function total(items: Item[]): number {
  return subtotal(items);
}
