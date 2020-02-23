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
export interface IAccountId extends IAccount {
  id?: string;
}

export class Account implements IAccountId {
  id?: any;
  name: string;
  balance: number;
  clearedBalance: number;
  type: AccountType;
}
