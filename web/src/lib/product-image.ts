export const PRODUCT_FALLBACK_IMAGE = "/images/product-fallback.svg";

export function getProductImageSrc(imageUrl?: string | null) {
  return imageUrl?.trim() ? imageUrl : PRODUCT_FALLBACK_IMAGE;
}
