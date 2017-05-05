import { Category } from './category';

export class Transaction{
  id?: string;
  categoryId: string;
  category: string;
  accountId: string;
  account: string;
  payeeId: string;
  payee: string;
  amount: number;
  date: Date;

}
