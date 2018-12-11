export enum AccountType {
  CHEQUE = 'cheque',
  CREDIT = 'credit'
}

export interface IAccount {
  balance: number;
  clearedBalance: number;
  name: string;
  type: AccountType;
}

export class Account implements IAccount {
  id?: any;
  name: string;
  balance: number;
  clearedBalance: number;
  type: AccountType;
}
