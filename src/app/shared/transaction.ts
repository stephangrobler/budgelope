import { Category } from './category';

export class Transaction{
  id?: string;
  categories: Array<string>;
  value: number;
  date: Date;
  payeeId: string;
}
