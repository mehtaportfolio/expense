export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700 border-orange-200',
  Transport: 'bg-blue-100 text-blue-700 border-blue-200',
  Shopping: 'bg-purple-100 text-purple-700 border-purple-200',
  Bills: 'bg-red-100 text-red-700 border-red-200',
  Entertainment: 'bg-pink-100 text-pink-700 border-pink-200',
  Health: 'bg-green-100 text-green-700 border-green-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200'
};