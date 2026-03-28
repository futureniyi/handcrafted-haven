"use client";

import { useSyncExternalStore } from "react";
import {
  defaultFormState,
  mockProducts,
  type ProductFormState,
  type SellerProduct,
} from "./dashboard-data";

let sellerProductsStore: SellerProduct[] = mockProducts;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return sellerProductsStore;
}

export function useMockSellerProducts() {
  const products = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function createProduct(form: ProductFormState) {
    const nextProduct: SellerProduct = {
      id: `p-${Date.now()}`,
      ...form,
    };

    sellerProductsStore = [nextProduct, ...sellerProductsStore];
    emitChange();
    return nextProduct;
  }

  function updateProduct(productId: string, form: ProductFormState) {
    sellerProductsStore = sellerProductsStore.map((product) =>
      product.id === productId ? { ...product, ...form } : product,
    );
    emitChange();
  }

  function deleteProduct(productId: string) {
    sellerProductsStore = sellerProductsStore.filter((product) => product.id !== productId);
    emitChange();
  }

  function getProductById(productId: string) {
    return sellerProductsStore.find((product) => product.id === productId) ?? null;
  }

  function resetProducts() {
    sellerProductsStore = mockProducts;
    emitChange();
  }

  return {
    products,
    isReady: true,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    resetProducts,
    defaultFormState,
  };
}
