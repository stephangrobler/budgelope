import { CategoryGroup } from './category_group';

export interface Category {
  _id?: string;
  budget_id: string;
  name: string;
  category_group_id: string;
  categoryGroup?: CategoryGroup;
  sortingOrder: string;
  balance: number;
  planned: number;
  actual: number;
  type?: string;
}

export interface TransactionCategory {
  name: string;
  in: number;
  out: number;
}
