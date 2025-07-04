import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  return `${price.toFixed(2)} BDT`;
}

// Calculate discounted price
export function getDiscountedPrice(price, discount) {
  return price - (price * (discount / 100));
}
