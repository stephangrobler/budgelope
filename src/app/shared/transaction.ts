import { Category } from './category';
import { Account } from './account';

export class Transaction {
  id?: string;
  categories: { categoryId: string; categoryName: string; in: number; out: number }[]; // object with category id for keys
  categoryDisplayName: string;
  account: { accountId: string; accountName: string };
  accountDisplayName: string;
  transferAccount: { accountId: string; accountName: string } = null;
  transferAccountDisplayName: string = null;
  transferAmount = 0;
  payeeId: string;
  payee: string;
  amount: number;
  in: number;
  out: number;
  date: Date;
  type: string; // income or expense
  cleared: boolean;
  transfer = false;

  constructor(transactionData?: any) {
    if (transactionData) {
      this.id = transactionData.id ? transactionData.id : null;
      this.categoryDisplayName = transactionData.category ? transactionData.category : null;
      if (transactionData.categories && transactionData.categories.length > 0) {
        const newCategories: {
          categoryId: string;
          categoryName: string;
          in: number;
          out: number;
        }[] = [];
        transactionData.categories.forEach(item => {
          // it should have an id specified for later use
          if (item.category && item.category.id) {
            const newCategory = {
              categoryId: item.category.id,
              categoryName: item.category.name,
              in: item.in,
              out: item.out
            };
            newCategories.push(newCategory);
          }
        });
        this.categories = newCategories;
      }
      if (transactionData.transferAccount) {
        this.transferAccount = transactionData.transferAccount;
      }
      this.transferAmount = transactionData.transferAmount ? transactionData.transferAmount : 0;
      this.payeeId = transactionData.payeeId ? transactionData.payeeId : null;
      this.payee = transactionData.payee ? transactionData.payee : null;
      this.amount = transactionData.amount ? transactionData.amount : null;
      this.in = transactionData.in ? transactionData.in : null;
      this.out = transactionData.out ? transactionData.out : null;
      this.type = transactionData.type ? transactionData.type : null;
      this.cleared = transactionData.cleared ? transactionData.cleared : null;
      this.date = transactionData.date ? transactionData.date : null;
    }
  }

  get toObject(): any {
    return {
      categories: this.categories,
      categoryDisplayName: this.categoryDisplayName,
      account: this.account,
      accountDisplayName: this.accountDisplayName,
      transferAccount: this.transferAccount,
      transferAccountDisplayName: this.transferAccountDisplayName,
      transferAmount: this.transferAmount,
      payeeId: this.payeeId,
      payee: this.payee,
      amount: this.amount,
      in: this.in,
      out: this.out,
      date: this.date,
      type: this.type, // income or expense
      cleared: this.cleared,
      transfer: this.transfer
    };
  }
}
