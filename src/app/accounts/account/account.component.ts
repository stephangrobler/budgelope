import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { AccountService } from '../account.service';
import { Account, IAccount, IAccountId } from '../../shared/account';
import { TransactionService } from 'app/transactions/transaction.service';
import { AuthService } from 'app/shared/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/shared/user.service';
import { AccountDataService } from 'app/store/entity/account-data.service';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: 'account.component.html'
})
export class AccountComponent implements OnInit {
  thisUser: string;

  accName: string;
  accStartingBalance: number;

  account: IAccount;
  accountId: any;
  accountType: string;
  budgetId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AccountComponent>,
    public userService: UserService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe(async profile => {
      this.budgetId = profile.activeBudget;
      if (this.data.accountId !== 'add') {
        this.account = await this.accountService.getByKey(this.data.accountId).toPromise();
      } else {
        this.account = {} as IAccount;
      }
    });
  }

  onSaveAccount() {
    if (this.data.accountId !== 'add') {
      this.editAccount(this.account);
    } else {
      this.createAccount(this.account);
    }
  }

  editAccount(account) {
    if (account.balance !== this.accStartingBalance) {
      this.transactionService.createStartingBalance(
        this.data.accountId,
        this.budgetId,
        account.balance
      );
    } else {
      this.accountService.update(account);
    }
  }

  createAccount(account: IAccount) {
    console.log(account);
    this.accountService.add(account).subscribe(savedAccount => {
      this.transactionService.createStartingBalance(
        savedAccount.id,
        this.budgetId,
        savedAccount.balance
      );
    });
  }

  onCancel() {
    this.dialogRef.close('Account Dialog Closed.');
  }
}
