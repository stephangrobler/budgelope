import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Transaction } from '../shared/transaction';
import { TransactionService } from '../core/transaction.service';
import { BudgetService } from '../core/budget.service';
import { UserService } from '../shared/user.service';

@Component({
  templateUrl: 'transactions.component.html',
})
export class TransactionsComponent implements OnInit {

  userId: string;
  budgetId: string;
  transactions: FirebaseListObservable<any[]>;

  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router,
    private db: AngularFireDatabase
  ) {

  }

  ngOnInit() {
    this.userId = this.userService.authUser.uid;
    this.budgetId = this.budgetService.getActiveBudget().id;
    let ref = 'transactions/' + this.userId + '/' + this.budgetId;
    this.transactions = this.db.list(ref);

  }


}
