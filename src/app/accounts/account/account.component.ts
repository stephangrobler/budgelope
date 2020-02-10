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

  account: Observable<IAccountId>;
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
    this.userService.getProfile().subscribe(profile => {
      this.budgetId = profile.activeBudget;
      if (this.data.accountId !== 'add') {
        this.account = this.accountService.getByKey(this.data.accountId);
      } else {
        this.account = of({} as IAccount);
      }
    });
  }

  onSaveAccount() {
    this.account.pipe(take(1)).subscribe(account => {
      if (this.data.accountId !== 'add') {
        this.editAccount(account);
      } else {
        this.createAccount(account);
      }
    });
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
