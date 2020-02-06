import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { AccountService } from '../account.service';
import { Account, IAccount } from '../../shared/account';
import { TransactionService } from 'app/transactions/transaction.service';
import { AuthService } from 'app/shared/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/shared/user.service';
import { AccountDataService } from 'app/store/entity/account-data.service';

@Component({
  templateUrl: 'account.component.html'
})
export class AccountComponent implements OnInit {
  thisUser: string;

  accName: string;
  accStartingBalance: number;

  account: Account;
  accountId: any;
  accountType: string;
  budgetId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountService: AccountService,
    private accountDataService: AccountDataService,
    public dialogRef: MatDialogRef<AccountComponent>,
    public userService: UserService,
    private db: AngularFirestore,
    private transactionService: TransactionService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe(profile => {
      this.budgetId = profile.activeBudget;

      if (this.data.accountId !== 'add') {
        const accRef =
          'budgets/' + this.data.budgetId + '/accounts/' + this.data.accountId;
        this.db
          .doc<Account>(accRef)
          .valueChanges()
          .subscribe(account => {
            this.account = account;
            this.accStartingBalance = account.balance;
          });
      } else {
        this.account = new Account();
      }
    });
  }

  onSaveAccount() {
    if (this.accountId !== 'add') {
      this.editAccount();
    } else {
      this.createAccount(this.account);
    }
  }

  editAccount() {
    const accountRef =
      'budgets/' + this.budgetId + '/accounts/' + this.data.accountId;

    // starting balance was changed create a starting balance
    if (this.account.balance !== this.accStartingBalance) {
      // console.log(this.account, this.accStartingBalance);
      this.transactionService.createStartingBalance(
        this.data.accountId,
        this.budgetId,
        this.account.balance
      );
    } else {
      this.db.doc<Account>(accountRef).update(this.account);
    }
  }

  createAccount(account: IAccount) {
    this.accountDataService.add(account).subscribe(savedAccount => {
      this.transactionService.createStartingBalance(
        savedAccount.id,
        this.budgetId,
        savedAccount.balance
      );
    });
  }

  onCancel() {
    this.dialogRef.close('Pizza!');
  }
}
