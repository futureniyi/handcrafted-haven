import { PRODUCT_FALLBACK_IMAGE } from "@/src/lib/product-image";

export type ProductCategory = "jewelry" | "clothing" | "home-decor" | "art" | "other";

export type SellerProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageUrl: string;
  inStock: boolean;
};

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageUrl: string;
  inStock: boolean;
};

export const categoryOptions: { value: ProductCategory; label: string }[] = [
  { value: "jewelry", label: "Jewelry" },
  { value: "clothing", label: "Clothing" },
  { value: "home-decor", label: "Home Decor" },
  { value: "art", label: "Art" },
  { value: "other", label: "Other" },
];

export const defaultFormState: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "other",
  imageUrl: "",
  inStock: true,
};

export const mockProducts: SellerProduct[] = [
  {
    id: "p1",
    name: "Woven Wall Basket",
    description: "Handwoven seagrass basket designed for small-space wall styling.",
    price: "42.00",
    category: "home-decor",
    imageUrl: PRODUCT_FALLBACK_IMAGE,
    inStock: true,
  },
  {
    id: "p2",
    name: "Clay Pendant Set",
    description: "Lightweight handcrafted pendants with earthy finishes and brass hooks.",
    price: "28.50",
    category: "jewelry",
    imageUrl: PRODUCT_FALLBACK_IMAGE,
    inStock: false,
  },
];

export const sellerProductsStorageKey = "dashboard_mock_products";

export function formatCategory(category: ProductCategory) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function toFormState(product: SellerProduct): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
  };
}
