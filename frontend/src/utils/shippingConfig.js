export const INDIA_POST_FLAT_RATE = 75;
export const INDIA_POST_FREE_THRESHOLD = 3000;

export function getEstimatedShipping(cartSubtotal) {
  return cartSubtotal >= INDIA_POST_FREE_THRESHOLD ? 0 : INDIA_POST_FLAT_RATE;
}
