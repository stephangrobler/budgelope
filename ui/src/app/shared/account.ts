export enum AccountType {
  CHEQUE = 'cheque',
  CREDIT = 'credit',
}

export interface IAccount {
  _id?: string;
  balance: number;
  clearedBalance: number;
  name: string;
  type: AccountType;
  status: string;
}
