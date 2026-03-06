/**
 * Benefills logo used as a graceful fallback when a product image
 * is missing or fails to load.
 */
export const PLACEHOLDER_IMAGE =
    'https://assets.zyrosite.com/AzGXppLqlGTo9X9r/benefills-png-A85M60Nx0phaMVln.png';

/**
 * Resolves the best available image URL for a product / cart-item.
 *
 * Priority: item.image → item.images[0] → Benefills logo
 */
export const getProductImage = (item) =>
    item?.image || (item?.images && item.images[0]) || PLACEHOLDER_IMAGE;

/**
 * `onError` handler for <img> tags.
 * Swaps the broken src for the placeholder and removes itself to prevent loops.
 *
 * Usage:  <img onError={handleImageError} … />
 */
export const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER_IMAGE;
};
