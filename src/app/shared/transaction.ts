import { IImportedTransaction } from 'app/transactions/import/importedTransaction';
import { IAccountId } from './account';
import { Category, TransactionCategory } from './category';

export const enum TransactionTypes {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export interface Transaction {
  id?: string;
  account: Partial<IAccountId>;
  amount: number;
  categories: {
    [categoryId: string]: TransactionCategory;
  };
  cleared: boolean;
  transfer?: boolean;
  transferAccount?: Partial<IAccountId>;
  date: Date;
  memo?: string;
  payee?: string;
  type: string;
  matched?: IImportedTransaction;
}

export class TransactionClass implements Transaction {
  id?: string;
  account: Partial<IAccountId>;
  amount: number;
  categories: { [categoryId: string]: TransactionCategory; };
  cleared: boolean;
  transfer?: boolean;
  transferAccount?: Partial<IAccountId>;
  date: Date;
  memo?: string;
  payee?: string;
  type: string;
  matched?: IImportedTransaction;

  constructor(transactionData?: any) {
    if (transactionData) {

    }
  }
}
