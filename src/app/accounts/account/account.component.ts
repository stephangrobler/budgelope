import { Component, OnInit, Inject } from '@angular/core';
import { AccountService } from '../account.service';
import { AccountType, IAccount } from '../../shared/account';
import { TransactionService } from 'app/transactions/transaction.service';
import { AuthService } from 'app/shared/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/shared/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: 'account.component.html',
})
export class AccountComponent implements OnInit {
  thisUser: string;

  accName: string;
  accStartingBalance: number;

  account: IAccount;
  accountId: any;
  accountType: string;
  budgetId: string;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    balance: [0, Validators.required],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AccountComponent>,
    private auth: AuthService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.auth.currentUser.subscribe(async (user) => {
      if (!user) return;
      this.budgetId = user.active_budget_id;
      if (this.data.accountId !== 'add') {
        this.account = await this.accountService
          .getByKey(this.data.accountId)
          .toPromise();
      } else {
        this.account = {} as IAccount;
      }
    });
  }

  onSubmit() {
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
    account = {
      ...account,
      ...this.form.value,
      budget_id: this.budgetId,
      cleared_balance: 0,
      type: AccountType.CHEQUE,
    };
    console.log(
      '🚀 ~ file: account.component.ts ~ line 67 ~ AccountComponent ~ this.accountService.add ~ savedAccount',
      account
    );
    this.accountService.add(account).subscribe((savedAccount) => {
      this.transactionService.createStartingBalance(
        savedAccount._id,
        this.budgetId,
        savedAccount.balance
      );
    });
  }

  onCancel() {
    this.dialogRef.close('Account Dialog Closed.');
  }
}
