import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.femaleDresses]: 'Female Dresses',
  [Category.maleShirts]: 'Cotton Shirts',
  [Category.maleTshirts]: 'Graphic T-Shirts',
  [Category.kidsApparel]: 'Kids Apparel',
};

export const CATEGORY_IMAGES: Record<Category, string> = {
  [Category.femaleDresses]: '/assets/generated/category-female-dresses.dim_600x700.png',
  [Category.maleShirts]: '/assets/generated/male-shirts-cover.dim_800x1000.jpg',
  [Category.maleTshirts]: '/assets/generated/category-male-tshirts.dim_600x700.png',
  [Category.kidsApparel]: '/assets/generated/category-kids-apparel.dim_600x700.png',
};

export const CATEGORY_SLUGS: Record<string, Category> = {
  'female-dresses': Category.femaleDresses,
  'male-shirts': Category.maleShirts,
  'male-tshirts': Category.maleTshirts,
  'kids-apparel': Category.kidsApparel,
};

export const CATEGORY_TO_SLUG: Record<Category, string> = {
  [Category.femaleDresses]: 'female-dresses',
  [Category.maleShirts]: 'male-shirts',
  [Category.maleTshirts]: 'male-tshirts',
  [Category.kidsApparel]: 'kids-apparel',
};

export const ALL_CATEGORIES: Category[] = [
  Category.femaleDresses,
  Category.maleShirts,
  Category.maleTshirts,
  Category.kidsApparel,
];
