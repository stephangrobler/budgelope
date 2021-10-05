import { IImportedTransaction } from 'app/transactions/import/importedTransaction';
import { IAccount } from './account';
import { Category, TransactionCategory } from './category';
import { IPayee } from './payee';

export const enum TransactionTypes {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface Transaction {
  id?: string;
  amount: number;
  account_id: string;
  account?: IAccount;
  category_id: string;
  category?: Category;
  payee_id: string;
  payee?: IPayee;
  cleared: boolean;
  transfer?: boolean;
  transferAccount?: Partial<IAccount>;
  date: Date;
  memo?: string;
  type: string;
  matched?: IImportedTransaction;
}

export class TransactionClass implements Transaction {
  constructor(transactionData?: any) {}
  id?: string;
  amount: number;
  account_id: string;
  account?: IAccount;
  category_id: string;
  category?: Category;
  payee_id: string;
  payee?: IPayee;
  cleared: boolean;
  transfer?: boolean;
  transferAccount?: Partial<IAccount>;
  date: Date;
  memo?: string;
  type: string;
  matched?: IImportedTransaction;
}
