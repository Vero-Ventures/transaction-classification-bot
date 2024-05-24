import { Category } from './Category';
export type CategorizedResult = {
  transaction_ID: string;
  possibleCategories: Category[];
  classifiedBy: string;
};
