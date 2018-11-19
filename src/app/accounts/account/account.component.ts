import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

import { AccountService } from '../account.service';
import { Account } from '../../shared/account';
import { TransactionService } from 'app/transactions/transaction.service';
import { AuthService } from 'app/shared/auth.service';

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
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private transactionService: TransactionService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.accountId = params['id'];
    });
    this.db
      .doc<any>('users/' + this.auth.currentUserId)
      .valueChanges()
      .subscribe(profile => {
        this.budgetId = profile.activeBudget;

        if (this.accountId !== 'add') {
          const accRef = 'budgets/' + this.budgetId + '/accounts/' + this.accountId;
          this.db
            .doc<Account>(accRef)
            .valueChanges()
            .subscribe(account => (this.account = account));
        } else {
          this.account = new Account();
        }
      });
  }

  saveAccount() {
    if (this.accountId !== 'add') {
      this.editAccount();
    } else {
      this.createAccount();
    }
  }

  editAccount() {
    const accountRef = 'budgets/' + this.budgetId + '/accounts/' + this.accountId;
    this.db.doc<Account>(accountRef).update(this.account);
  }

  createAccount() {
    this.accountService.createAccount(this.budgetId, this.account).then(docRef => {
      this.transactionService.createStartingBalance(docRef.id, this.budgetId, this.account.balance);
    });
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
