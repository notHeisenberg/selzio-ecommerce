import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  // Check if price is a whole number
  if (price % 1 === 0) {
    return Math.round(price);
  }
  return price.toFixed(2);
}

// Calculate discounted price
export function getDiscountedPrice(price, discount) {
  const discountedPrice = price - (price * (discount / 100));
  // If the original price was a whole number, round the discounted price to whole number
  if (price % 1 === 0) {
    return Math.round(discountedPrice);
  }
  return discountedPrice;
}
