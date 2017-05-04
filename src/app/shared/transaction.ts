import { Category } from './category';

export class Transaction{
  id?: string;
  categoryId: string;
  accountId: string;
  payeeId: string;
  amount: number;
  date: Date;
  
}
