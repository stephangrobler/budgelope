import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

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
  transactions: FirebaseListObservable<Transaction[]>;

  colums: any[];

  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router,
    private db: AngularFireDatabase,
    private af: AngularFireAuth
  ) {
    af.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.object('users/' + user.uid).subscribe(profile => {
        this.loadTransactions(profile.activeBudget);
      });
    });
  }

  ngOnInit() {

  }

  loadTransactions(budgetId: string) {
    let ref = 'transactions/' + budgetId;
    this.db.list(ref).subscribe(snapshots => {
      let list: any = [];
      snapshots.forEach(trans => {
        list.push(trans);
      });
      this.transactions = list.reverse();
      console.log(this.transactions);
    });
  }


}
