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
  in: number;
  out: number;
  date: Date;
  type: string; // income or expense
  cleared: boolean;

  constructor(transactionData?: any){
    if (transactionData) {
      this.id = transactionData.id ? transactionData.id : null ;
      this.categoryId = transactionData.categoryId ? transactionData.categoryId : null ;
      this.category = transactionData.category ? transactionData.category : null ;
      this.accountId = transactionData.accountId ? transactionData.accountId : null ;
      this.account = transactionData.account ? transactionData.account : null ;
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

  toObject() : any {
    return {
      "id": this.id,
      "categoryId": this.categoryId,
      "category": this.category,
      "accountId": this.accountId,
      "account": this.account,
      "payeeId": this.payeeId,
      "payee": this.payee,      
      "in": this.in,
      "out": this.out,
      "type": this.type,
      "cleared": this.cleared,
      "date": this.date,
    }
  }
}
