import { Category } from './category';

export interface Budget {
  name: string;
  start: Date;
  active: boolean;
  balance: number;
  allocations?: Allocations[];
  sharedWith: string[];
  user_id?: string;
  _id?: string;
}

export interface Allocations {
  month: string;
  income: number;
  expense: number;
  budgeted: number;
  categories: Category[];
}
