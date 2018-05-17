import { Category } from './category';
import { Account } from './account';

export class Transaction{
  id?: string;
  categoryId: string;
  categoryName: string;
  categories: any[]; // object with category id for keys
  accountId: string;
  accountName: string;
  payeeId: string;
  payee: string;
  amount: number;
  in: number;
  out: number;
  date: Date;
  type: string; // income or expense
  cleared: boolean;

  constructor(transactionData?: any){

    if (transactionData) {
      this.id = transactionData.id ? transactionData.id : null ;
      this.categoryId = transactionData.categoryId ? transactionData.categoryId : null ;
      this.categoryName = transactionData.category ? transactionData.category : null ;
      this.categories = transactionData.categories ? transactionData.categories: null;
      this.accountId = transactionData.accountId ? transactionData.accountId : null ;
      this.accountName = transactionData.account ? transactionData.account : null ;
      this.payeeId = transactionData.payeeId ? transactionData.payeeId : null ;
      this.payee = transactionData.payee ? transactionData.payee : null ;
      this.amount = transactionData.amount ? transactionData.amount : null ;
      this.in = transactionData.in ? transactionData.in : null ;
      this.out = transactionData.out ? transactionData.out : null ;
      this.type = transactionData.type ? transactionData.type : null ;
      this.cleared = transactionData.cleared ? transactionData.cleared : null ;
      this.date = transactionData.date ? transactionData.date : null ;
    }
  }

  get toObject(): any {
    return {
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      categories: this.categories,
      accountId: this.accountId,
      accountName: this.accountName,
      payeeId: this.payeeId,
      payee: this.payee,
      amount: this.amount,
      in: this.in,
      out: this.out,
      date: this.date,
      type: this.type, // income or expense
      cleared: this.cleared
    };
  }
}
